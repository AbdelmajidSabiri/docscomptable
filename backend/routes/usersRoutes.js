const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get all users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const [users] = await db.query(
      'SELECT id, name, email, user_type, status FROM users'
    );
    
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { status } = req.body;
    const userId = req.params.id;
    
    await db.query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, userId]
    );
    
    res.json({ message: 'User status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;