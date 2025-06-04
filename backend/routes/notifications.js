const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { auth } = require('../middleware/auth');

// Create MySQL pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'docscompta',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get notifications for current user (accountant)
router.get('/accountant', auth, async (req, res) => {
  try {
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE recipient_type = ? AND recipient_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.role, req.user.id]
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND recipient_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read' });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE recipient_id = ? AND recipient_type = ? AND is_read = FALSE',
      [req.user.id, req.user.role]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking all notifications as read' });
  }
});

module.exports = router; 