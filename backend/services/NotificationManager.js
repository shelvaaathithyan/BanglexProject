const crypto = require('crypto');

class NotificationManager {
  constructor() {
    this.broadcastQueue = [];
    this.io = null;

    // Check for expired notifications every 10 seconds
    setInterval(() => {
      this.checkExpiries();
    }, 10000);
  }

  setIo(io) {
    this.io = io;
  }

  getNotificationQueue() {
    return this.broadcastQueue;
  }

  add(notificationData) {
    const newNotification = {
      id: crypto.randomUUID(),
      ...notificationData,
      status: notificationData.scheduledTime && new Date(notificationData.scheduledTime) > new Date() ? 'scheduled' : 'active',
      createdAt: new Date().toISOString()
    };

    this.broadcastQueue.push(newNotification);
    this.sync();
    return newNotification;
  }

  remove(id) {
    const initialLength = this.broadcastQueue.length;
    this.broadcastQueue = this.broadcastQueue.filter(n => n.id !== id);
    if (this.broadcastQueue.length < initialLength) {
      this.sync();
      return true;
    }
    return false;
  }

  update(id, updates) {
    const index = this.broadcastQueue.findIndex(n => n.id === id);
    if (index !== -1) {
      this.broadcastQueue[index] = { ...this.broadcastQueue[index], ...updates };
      // Also update status if scheduled time changed
      if (updates.scheduledTime) {
         this.broadcastQueue[index].status = new Date(updates.scheduledTime) > new Date() ? 'scheduled' : 'active';
      }
      this.sync();
      return this.broadcastQueue[index];
    }
    return null;
  }

  checkExpiries() {
    let changed = false;
    const now = new Date();

    this.broadcastQueue = this.broadcastQueue.filter(notification => {
      // Check expiry
      if (notification.expiryTime && new Date(notification.expiryTime) <= now) {
        changed = true;
        return false; // Remove
      }
      
      // Check if scheduled became active
      if (notification.status === 'scheduled' && notification.scheduledTime && new Date(notification.scheduledTime) <= now) {
        notification.status = 'active';
        changed = true;
      }
      
      return true; // Keep
    });

    if (changed) {
      this.sync();
    }
  }

  sync() {
    if (this.io) {
      this.io.emit('notification_sync', this.getNotificationQueue());
    }
  }
}

// Export a singleton instance
const notificationManager = new NotificationManager();
module.exports = notificationManager;
