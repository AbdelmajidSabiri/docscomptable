// routes/notifications.routes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get notifications for current user
router.get('/', auth, async (req, res) => {
  try {
    const [notifications] = await db.query(
      'SELECT * FROM notifications WHERE recipient_type = ? AND recipient_id = ? ORDER BY created_at DESC',
      [req.user.role, req.user.id]
    );
    
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    // Security check - user can only mark their own notifications
    const [notifications] = await db.query(
      'SELECT * FROM notifications WHERE id = ? AND recipient_type = ? AND recipient_id = ?',
      [notificationId, req.user.role, req.user.id]
    );
    
    if (notifications.length === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [notificationId]
    );
    
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;