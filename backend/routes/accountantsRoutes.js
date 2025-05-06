const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Get all accountants (Admin only)
router.get('/', auth, role(['admin']), async (req, res) => {
  try {
    const [accountants] = await db.query(`
      SELECT a.*, u.email FROM accountants a
      JOIN users u ON a.user_id = u.id
    `);
    
    res.json(accountants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get accountant by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const accountantId = req.params.id;
    
    // Admins can view any accountant, accountants can only view themselves
    if (req.user.role === 'accountant') {
      const [accountants] = await db.query(
        'SELECT * FROM accountants WHERE user_id = ?',
        [req.user.id]
      );
      
      if (accountants.length === 0 || accountants[0].id != accountantId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    const [accountants] = await db.query(`
      SELECT a.*, u.email FROM accountants a
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `, [accountantId]);
    
    if (accountants.length === 0) {
      return res.status(404).json({ message: 'Accountant not found' });
    }
    
    // Get companies assigned to this accountant
    const [companies] = await db.query(
      'SELECT * FROM companies WHERE accountant_id = ?',
      [accountantId]
    );
    
    res.json({
      accountant: accountants[0],
      companies
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update accountant
router.put('/:id', auth, role(['admin']), async (req, res) => {
  try {
    const accountantId = req.params.id;
    const { name, phone, address, admission_date } = req.body;
    
    await db.query(
      'UPDATE accountants SET name = ?, phone = ?, address = ?, admission_date = ? WHERE id = ?',
      [name, phone, address, admission_date, accountantId]
    );
    
    res.json({ message: 'Accountant updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;