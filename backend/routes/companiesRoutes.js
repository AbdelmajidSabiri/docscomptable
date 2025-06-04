const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for profile picture storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/profile_pictures');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'company-' + req.params.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only .png, .jpg and .gif format allowed!'));
    }
    cb(null, true);
  }
});

// Get all companies (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    // Admin can see all companies
    if (req.user.role === 'admin') {
      const [companies] = await db.query(`
        SELECT c.*, u.email, a.name as accountant_name FROM companies c
        JOIN users u ON c.user_id = u.id
        LEFT JOIN accountants a ON c.accountant_id = a.id
      `);
      
      return res.json(companies);
    }
    
    // Accountant can see assigned companies
    if (req.user.role === 'accountant') {
      const [accountants] = await db.query(
        'SELECT id FROM accountants WHERE user_id = ?',
        [req.user.id]
      );
      
      if (accountants.length === 0) {
        return res.status(404).json({ message: 'Accountant profile not found' });
      }
      
      const accountantId = accountants[0].id;
      
      const [companies] = await db.query(`
        SELECT c.*, u.email FROM companies c
        JOIN users u ON c.user_id = u.id
        WHERE c.accountant_id = ?
      `, [accountantId]);
      
      return res.json(companies);
    }
    
    // Company can see only itself
    if (req.user.role === 'company') {
      const [companies] = await db.query(`
        SELECT c.*, u.email, a.name as accountant_name FROM companies c
        JOIN users u ON c.user_id = u.id
        LEFT JOIN accountants a ON c.accountant_id = a.id
        WHERE c.user_id = ?
      `, [req.user.id]);
      
      return res.json(companies);
    }
    
    res.status(403).json({ message: 'Access denied' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get company by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const companyId = req.params.id;
    
    // Security check - only allow access to company's own data or to admin
    if (req.user.role === 'company') {
      const [companies] = await db.query(
        'SELECT id FROM companies WHERE user_id = ?',
        [req.user.id]
      );
      
      if (companies.length === 0 || companies[0].id != companyId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'accountant') {
      // Check if company is assigned to this accountant
      const [accountants] = await db.query(
        'SELECT id FROM accountants WHERE user_id = ?',
        [req.user.id]
      );
      
      if (accountants.length === 0) {
        return res.status(404).json({ message: 'Accountant profile not found' });
      }
      
      const accountantId = accountants[0].id;
      
      const [companies] = await db.query(
        'SELECT id FROM companies WHERE id = ? AND accountant_id = ?',
        [companyId, accountantId]
      );
      
      if (companies.length === 0) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    const [companies] = await db.query(`
      SELECT c.*, u.email, u.created_at as user_created_at, a.name as accountant_name FROM companies c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN accountants a ON c.accountant_id = a.id
      WHERE c.id = ?
    `, [companyId]);
    
    if (companies.length === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    res.json(companies[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign company to accountant (Admin only)
router.post('/:id/assign', auth, role(['admin']), async (req, res) => {
  try {
    const companyId = req.params.id;
    const { accountant_id } = req.body;
    
    // Check if company exists
    const [companies] = await db.query(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    );
    
    if (companies.length === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Check if accountant exists
    if (accountant_id) {
      const [accountants] = await db.query(
        'SELECT * FROM accountants WHERE id = ?',
        [accountant_id]
      );
      
      if (accountants.length === 0) {
        return res.status(404).json({ message: 'Accountant not found' });
      }
    }
    
    // Assign company to accountant
    await db.query(
      'UPDATE companies SET accountant_id = ? WHERE id = ?',
      [accountant_id, companyId]
    );
    
    res.json({ message: 'Company assigned successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update company status (Admin only)
router.patch('/:id/status', auth, role(['admin']), async (req, res) => {
  try {
    const companyId = req.params.id;
    const { status } = req.body;
    
    if (!['pending', 'active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    await db.query(
      'UPDATE companies SET status = ?, activation_date = ? WHERE id = ?',
      [status, status === 'active' ? new Date() : null, companyId]
    );
    
    res.json({ message: 'Company status updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload company profile picture
router.post('/:id/profile-picture', auth, upload.single('profile_picture'), async (req, res) => {
  try {
    const companyId = req.params.id;
    
    // Security check - only allow access to company's own data or to admin/assigned accountant
    if (req.user.role === 'company') {
      const [companies] = await db.query(
        'SELECT id FROM companies WHERE user_id = ?',
        [req.user.id]
      );
      
      if (companies.length === 0 || companies[0].id != companyId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'accountant') {
      const [accountants] = await db.query(
        'SELECT id FROM accountants WHERE user_id = ?',
        [req.user.id]
      );
      
      if (accountants.length === 0) {
        return res.status(404).json({ message: 'Accountant profile not found' });
      }
      
      const accountantId = accountants[0].id;
      
      const [companies] = await db.query(
        'SELECT id FROM companies WHERE id = ? AND accountant_id = ?',
        [companyId, accountantId]
      );
      
      if (companies.length === 0) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get the relative path for storage in database
    const relativePath = path.relative(path.join(__dirname, '..'), req.file.path);

    // Update company profile picture in database
    await db.query(
      'UPDATE companies SET profile_picture = ? WHERE id = ?',
      [relativePath, companyId]
    );

    res.json({
      message: 'Profile picture uploaded successfully',
      profile_picture: relativePath
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;