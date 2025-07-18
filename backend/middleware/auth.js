// Simple in-memory session approach (no additional packages needed)
// middleware/auth.js - Simplified version

const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const router = express.Router();
const pool = require('../db');

// In-memory session store (for development/small apps)
// For production, you'd want to use Redis or database storage
const sessions = new Map();

// Session cleanup (remove expired sessions every hour)
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(sessionId);
    }
  }
}, 60 * 60 * 1000); // 1 hour

// Helper function to generate session ID
const generateSessionId = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Helper function to create session
const createSession = (userId, userEmail) => {
  const sessionId = generateSessionId();
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  
  sessions.set(sessionId, {
    userId,
    userEmail,
    createdAt: Date.now(),
    expiresAt
  });
  
  return sessionId;
};

// Helper function to get session
const getSession = (sessionId) => {
  if (!sessionId) return null;
  
  const session = sessions.get(sessionId);
  if (!session) return null;
  
  // Check if expired
  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionId);
    return null;
  }
  
  return session;
};

// Helper function to destroy session
const destroySession = (sessionId) => {
  if (sessionId) {
    sessions.delete(sessionId);
  }
};

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user from database
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    const sessionId = createSession(user.id, user.email);

    // Update last login
    await pool.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      sessionId: sessionId, // Send session ID to client
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [trimmedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())',
      [name.trim(), trimmedEmail, hashedPassword]
    );

    // Get created user
    const [newUser] = await pool.execute(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    // Create session
    const sessionId = createSession(result.insertId, trimmedEmail);

    res.status(201).json({
      user: newUser[0],
      sessionId: sessionId,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  destroySession(sessionId);
  res.json({ message: 'Logged out successfully' });
});

// Check session
router.get('/verify', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const session = getSession(sessionId);

  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  // Get user data (optional, for fresh user data)
  pool.execute('SELECT id, name, email, created_at FROM users WHERE id = ?', [session.userId])
    .then(([rows]) => {
      if (rows.length === 0) {
        destroySession(sessionId);
        return res.status(401).json({ error: 'User not found' });
      }
      res.json({ user: rows[0], session: { expiresAt: session.expiresAt } });
    })
    .catch(error => {
      console.error('Session verification error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  const sessionId = req.headers['x-session-id'];
  const session = getSession(sessionId);

  if (!session) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  req.userId = session.userId;
  req.userEmail = session.userEmail;
  req.sessionId = sessionId;
  next();
};

// Get session info (for debugging)
router.get('/session-info', (req, res) => {
  res.json({
    totalSessions: sessions.size,
    sessionIds: Array.from(sessions.keys()).map(id => id.substring(0, 8) + '...')
  });
});

module.exports = { router, requireAuth };

// React Native API Service for this approach
// services/apiService.js - Simple session version

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://spirited-vitality-production.up.railway.app';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get stored session ID
  async getSessionId() {
    try {
      return await AsyncStorage.getItem('sessionId');
    } catch (error) {
      console.error('Error getting session ID:', error);
      return null;
    }
  }

  // Store session ID
  async setSessionId(sessionId) {
    try {
      if (sessionId) {
        await AsyncStorage.setItem('sessionId', sessionId);
      } else {
        await AsyncStorage.removeItem('sessionId');
      }
    } catch (error) {
      console.error('Error storing session ID:', error);
    }
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const sessionId = await this.getSessionId();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(sessionId && { 'X-Session-ID': sessionId }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle session expiration
      if (response.status === 401) {
        await this.setSessionId(null);
        throw new Error('Session expired. Please login again.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email, password) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store session ID
    if (response.sessionId) {
      await this.setSessionId(response.sessionId);
    }
    
    return response;
  }

  async signup(userData) {
    const response = await this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store session ID
    if (response.sessionId) {
      await this.setSessionId(response.sessionId);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      // Always clear session ID, even if request fails
      await this.setSessionId(null);
    }
  }

  async verifySession() {
    return this.request('/api/auth/verify');
  }

  // All your other methods remain the same
  async getProfile(userId) {
    return this.request(`/api/users/${userId}`);
  }

  async getDocuments(userId) {
    return this.request(`/api/documents?userId=${userId}`);
  }

  // ... rest of your methods
}

export default new ApiService();

// app.js - Main application setup
const express = require('express');
const cors = require('cors');
const { router: authRoutes, requireAuth } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Configure for production
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Protected route example
app.get('/api/profile', requireAuth, async (req, res) => {
  // req.userId is available here
  const pool = require('./db');
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [req.userId]
    );
    res.json({ user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;