import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import PlatinumBroadcastNotification from './PlatinumBroadcastNotification';
import { Gift, X } from 'lucide-react';

const NotificationContainer = () => {
  const { currentNotification, dismissFestival } = useNotification();

  if (!currentNotification) return null;

  if (currentNotification.type === 'festival') {
    const activeFestival = currentNotification.data;
    
    // Extracted exactly as it was in Navbar.jsx
    return (
      <div className="festival-side-notification">
        <button className="festival-notif-close" onClick={dismissFestival} aria-label="Close notification">
          <X size={16} />
        </button>
        <div className="festival-notif-icon">
          <Gift size={28} color="#d4af37" />
        </div>
        <div className="festival-notif-content" style={{ fontFamily: "'Poppins', sans-serif" }}>
          <span className="festival-name-golden" style={{ fontSize: '1.1rem', fontWeight: 700 }}>{activeFestival.name}</span>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.4 }}>
            Get <strong>{activeFestival.discountValue}{activeFestival.discountType === 'Percentage (%)' ? '%' : '₹'}</strong> OFF on {activeFestival.applyTo === 'All Products' ? 'all products' : 'selected items'}!
          </p>
          {activeFestival.endDate && (
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
              Ends: {new Date(`${activeFestival.endDate}T${activeFestival.endTime || '23:59'}`).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (currentNotification.type === 'broadcast') {
    return (
      <PlatinumBroadcastNotification 
        notification={currentNotification.data} 
        key={currentNotification.data.id} 
      />
    );
  }

  return null;
};

export default NotificationContainer;
