const express = require('express');
const router = express.Router();
const notificationManager = require('../services/NotificationManager');

// Get all notifications in queue
router.get('/', (req, res) => {
  try {
    const queue = notificationManager.getNotificationQueue();
    res.json(queue);
  } catch (error) {
    console.error('Error fetching broadcasts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new notification
router.post('/', (req, res) => {
  try {
    const {
      title,
      message,
      icon,
      type,
      priority,
      audience,
      buttonText,
      buttonUrl,
      scheduledTime,
      expiryTime,
      displayDuration
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const notification = notificationManager.add({
      title,
      message,
      icon: icon || 'Diamond',
      type: type || 'Information',
      priority: priority || 'High',
      audience: audience || 'Everyone',
      buttonText: buttonText || '',
      buttonUrl: buttonUrl || '',
      scheduledTime: scheduledTime || null,
      expiryTime: expiryTime || null,
      displayDuration: displayDuration || null
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating broadcast:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a notification
router.put('/:id', (req, res) => {
  try {
    const updated = notificationManager.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Broadcast not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating broadcast:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a notification
router.delete('/:id', (req, res) => {
  try {
    const success = notificationManager.remove(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'Broadcast not found' });
    }
    res.json({ message: 'Broadcast deleted successfully' });
  } catch (error) {
    console.error('Error deleting broadcast:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Pause/Resume (by updating status)
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'paused', 'scheduled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const updated = notificationManager.update(req.params.id, { status });
    if (!updated) {
      return res.status(404).json({ message: 'Broadcast not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
