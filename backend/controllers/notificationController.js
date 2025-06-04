const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'docscompta',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('Notification controller loaded');

// Get notifications for an accountant
const getAccountantNotifications = async (req, res) => {
  console.log('getAccountantNotifications called');
  try {
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE recipient_type = ? AND recipient_id = ? ORDER BY created_at DESC LIMIT 50',
      ['accountant', req.user.id]
    );
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
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
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE recipient_id = ? AND recipient_type = ? AND is_read = FALSE',
      [req.user.id, req.user.role]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error marking all notifications as read' });
  }
};

// Create a new notification
const createNotification = async (recipientType, recipientId, message) => {
  try {
    const [result] = await pool.query(
      'INSERT INTO notifications (recipient_type, recipient_id, message, is_read) VALUES (?, ?, ?, FALSE)',
      [recipientType, recipientId, message]
    );
    return { id: result.insertId, recipientType, recipientId, message, is_read: false };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Export all functions
const notificationController = {
  getAccountantNotifications,
  markAsRead,
  markAllAsRead,
  createNotification
};

console.log('Exported functions:', Object.keys(notificationController));

module.exports = notificationController; 