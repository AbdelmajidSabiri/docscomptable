const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, name, siret, address, contactName, contactEmail, contactPhone } = req.body;
    
    // Check if user exists
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const [result] = await db.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );
    
    const userId = result.insertId;
    
    // Create profile based on role
    if (role === 'accountant') {
      await db.query(
        'INSERT INTO accountants (name, user_id) VALUES (?, ?)',
        [name, userId]
      );
    } else if (role === 'company') {
      await db.query(
        'INSERT INTO companies (name, user_id, siret, address, contact_name, contact_email, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, userId, siret, address, contactName, contactEmail, contactPhone]
      );
    } else if (role === 'admin') {
      await db.query(
        'INSERT INTO administrators (name, user_id) VALUES (?, ?)',
        [name, userId]
      );
    }
    
    // Generate token
    const payload = {
      user: {
        id: userId,
        role
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };
    
    jwt.sign(
      payload, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, email, role, created_at FROM users WHERE id = ?', 
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    let profile = null;
    
    // Get profile data based on role
    if (user.role === 'accountant') {
      const [accountants] = await db.query(
        'SELECT * FROM accountants WHERE user_id = ?',
        [user.id]
      );
      if (accountants.length > 0) {
        profile = accountants[0];
      }
    } else if (user.role === 'company') {
      const [companies] = await db.query(
        'SELECT * FROM companies WHERE user_id = ?',
        [user.id]
      );
      if (companies.length > 0) {
        profile = companies[0];
      }
    } else if (user.role === 'admin') {
      const [admins] = await db.query(
        'SELECT * FROM administrators WHERE user_id = ?',
        [user.id]
      );
      if (admins.length > 0) {
        profile = admins[0];
      }
    }
    
    res.json({ user, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;