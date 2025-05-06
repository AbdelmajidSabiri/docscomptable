const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

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
      SELECT c.*, u.email, a.name as accountant_name FROM companies c
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

module.exports = router;