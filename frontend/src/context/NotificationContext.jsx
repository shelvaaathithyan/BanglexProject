import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import API_BASE from '../config/api';
import { isFestivalActive } from '../utils/festivalPrice';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [broadcastQueue, setBroadcastQueue] = useState([]);
  const [activeFestival, setActiveFestival] = useState(null);
  const [festivalNotifDismissed, setFestivalNotifDismissed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check login status for festival popup (assuming it requires login based on existing logic)
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const handleLoginUpdate = () => setIsLoggedIn(!!localStorage.getItem('token'));
    window.addEventListener('storage', handleLoginUpdate);
    // Might need a custom event if local storage change doesn't trigger on same tab
    return () => window.removeEventListener('storage', handleLoginUpdate);
  }, []);

  // Fetch active festival
  const fetchActiveFestival = async () => {
    try {
      const res = await fetch(`${API_BASE}/festivals/active`);
      if (res.ok) {
        const data = await res.json();
        if (data && isFestivalActive(data)) {
          setActiveFestival(data);
        } else {
          setActiveFestival(null);
        }
      }
    } catch (err) {
      console.error('Error fetching active festival:', err);
    }
  };

  useEffect(() => {
    fetchActiveFestival();
    // Check every minute if the festival has expired or started
    const interval = setInterval(() => {
      fetchActiveFestival();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Socket connection
  useEffect(() => {
    // Extract base URL from API_BASE (removing /api)
    const socketUrl = API_BASE.replace('/api', '');
    const newSocket = io(socketUrl, {
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on('notification_sync', (queue) => {
      setBroadcastQueue(queue);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Determine which notification to show based on priority
  let currentNotification = null;

  if (activeFestival && !activeFestival.isDown && isLoggedIn && !festivalNotifDismissed) {
    currentNotification = { type: 'festival', data: activeFestival };
  } else if (broadcastQueue && broadcastQueue.length > 0) {
    // Find the first active broadcast. (Status 'active' means it is meant to be displayed)
    const activeBroadcasts = broadcastQueue.filter(b => b.status === 'active');
    
    // Sort by priority if needed (High > Medium > Low), assuming High is highest.
    const priorityOrder = { High: 3, Medium: 2, Low: 1 };
    activeBroadcasts.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));

    if (activeBroadcasts.length > 0) {
      currentNotification = { type: 'broadcast', data: activeBroadcasts[0] };
    }
  }

  const dismissFestival = () => {
    setFestivalNotifDismissed(true);
  };

  return (
    <NotificationContext.Provider value={{ currentNotification, dismissFestival, broadcastQueue, socket, activeFestival }}>
      {children}
    </NotificationContext.Provider>
  );
};
