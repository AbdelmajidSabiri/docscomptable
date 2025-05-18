// routes/statsRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Get overall statistics (admin only)
router.get('/overview', auth, role(['admin']), async (req, res) => {
  try {
    // Get user counts by role
    const [userCounts] = await db.query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `);
    
    // Get document counts by status
    const [documentCounts] = await db.query(`
      SELECT status, COUNT(*) as count
      FROM documents
      GROUP BY status
    `);
    
    // Get company counts by status
    const [companyCounts] = await db.query(`
      SELECT status, COUNT(*) as count
      FROM companies
      GROUP BY status
    `);
    
    // Get total counts
    const [totalCounts] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM documents) as total_documents,
        (SELECT COUNT(*) FROM companies) as total_companies,
        (SELECT COUNT(*) FROM accountants) as total_accountants
    `);
    
    // Format user counts
    const users = {
      total: totalCounts[0].total_users,
      byRole: {}
    };
    
    userCounts.forEach(item => {
      users.byRole[item.role] = item.count;
    });
    
    // Format document counts
    const documents = {
      total: totalCounts[0].total_documents,
      byStatus: {}
    };
    
    documentCounts.forEach(item => {
      documents.byStatus[item.status] = item.count;
    });
    
    // Format company counts
    const companies = {
      total: totalCounts[0].total_companies,
      byStatus: {}
    };
    
    companyCounts.forEach(item => {
      companies.byStatus[item.status] = item.count;
    });
    
    // Get document count per month for the current year
    const currentYear = new Date().getFullYear();
    const [documentsByMonth] = await db.query(`
      SELECT
        MONTH(upload_date) as month,
        COUNT(*) as count
      FROM documents
      WHERE YEAR(upload_date) = ?
      GROUP BY MONTH(upload_date)
      ORDER BY month
    `, [currentYear]);
    
    // Fill in missing months
    const documentsTrend = Array(12).fill(0);
    documentsByMonth.forEach(item => {
      documentsTrend[item.month - 1] = item.count;
    });
    
    res.json({
      users,
      documents,
      companies,
      accountants: {
        total: totalCounts[0].total_accountants
      },
      trends: {
        documents: documentsTrend
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get accountant statistics
router.get('/accountant/:id', auth, async (req, res) => {
  try {
    const accountantId = req.params.id;
    
    // Check if user has permission to view stats
    if (req.user.role === 'accountant') {
      const [accountants] = await db.query(
        'SELECT id FROM accountants WHERE user_id = ?',
        [req.user.id]
      );
      
      if (accountants.length === 0 || accountants[0].id != accountantId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get company count
    const [companyCounts] = await db.query(`
      SELECT COUNT(*) as count, status
      FROM companies
      WHERE accountant_id = ?
      GROUP BY status
    `, [accountantId]);
    
    // Get document counts
    const [documentCounts] = await db.query(`
      SELECT d.status, COUNT(*) as count
      FROM documents d
      JOIN companies c ON d.company_id = c.id
      WHERE c.accountant_id = ?
      GROUP BY d.status
    `, [accountantId]);
    
    // Get processing efficiency (avg processing time)
    const [processingTime] = await db.query(`
      SELECT AVG(TIMESTAMPDIFF(HOUR, upload_date, processing_date)) as avg_hours
      FROM documents d
      JOIN companies c ON d.company_id = c.id
      WHERE c.accountant_id = ? AND d.status = 'processed' AND d.processing_date IS NOT NULL
    `, [accountantId]);
    
    // Document trend by month
    const currentYear = new Date().getFullYear();
    const [documentsTrend] = await db.query(`
      SELECT
        MONTH(d.upload_date) as month,
        COUNT(*) as count
      FROM documents d
      JOIN companies c ON d.company_id = c.id
      WHERE c.accountant_id = ? AND YEAR(d.upload_date) = ?
      GROUP BY MONTH(d.upload_date)
      ORDER BY month
    `, [accountantId, currentYear]);
    
    // Format company counts
    const companies = {
      total: companyCounts.reduce((sum, item) => sum + item.count, 0),
      byStatus: {}
    };
    
    companyCounts.forEach(item => {
      companies.byStatus[item.status] = item.count;
    });
    
    // Format document counts
    const documents = {
      total: documentCounts.reduce((sum, item) => sum + item.count, 0),
      byStatus: {}
    };
    
    documentCounts.forEach(item => {
      documents.byStatus[item.status] = item.count;
    });
    
    // Fill in missing months for trend
    const monthlyTrend = Array(12).fill(0);
    documentsTrend.forEach(item => {
      monthlyTrend[item.month - 1] = item.count;
    });
    
    res.json({
      companies,
      documents,
      performance: {
        avgProcessingHours: processingTime[0].avg_hours || 0,
        processingRate: documents.total > 0 
          ? (documents.byStatus['processed'] || 0) / documents.total 
          : 0
      },
      trends: {
        documents: monthlyTrend
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get company statistics
router.get('/company/:id', auth, async (req, res) => {
  try {
    const companyId = req.params.id;
    
    // Check if user has permission to view stats
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
    
    // Get document counts by status
    const [documentCounts] = await db.query(`
      SELECT status, COUNT(*) as count
      FROM documents
      WHERE company_id = ?
      GROUP BY status
    `, [companyId]);
    
    // Get document counts by type
    const [documentTypes] = await db.query(`
      SELECT document_type, COUNT(*) as count
      FROM documents
      WHERE company_id = ?
      GROUP BY document_type
    `, [companyId]);
    
    // Get document counts by operation type
    const [operationTypes] = await db.query(`
      SELECT operation_type, COUNT(*) as count
      FROM documents
      WHERE company_id = ?
      GROUP BY operation_type
    `, [companyId]);
    
    // Get monthly document trend
    const currentYear = new Date().getFullYear();
    const [monthlyTrend] = await db.query(`
      SELECT
        MONTH(upload_date) as month,
        COUNT(*) as count
      FROM documents
      WHERE company_id = ? AND YEAR(upload_date) = ?
      GROUP BY MONTH(upload_date)
      ORDER BY month
    `, [companyId, currentYear]);
    
    // Format document counts
    const documents = {
      total: documentCounts.reduce((sum, item) => sum + item.count, 0),
      byStatus: {},
      byType: {},
      byOperation: {}
    };
    
    documentCounts.forEach(item => {
      documents.byStatus[item.status] = item.count;
    });
    
    documentTypes.forEach(item => {
      documents.byType[item.document_type] = item.count;
    });
    
    operationTypes.forEach(item => {
      documents.byOperation[item.operation_type] = item.count;
    });
    
    // Fill in missing months for trend
    const documentsMonthly = Array(12).fill(0);
    monthlyTrend.forEach(item => {
      documentsMonthly[item.month - 1] = item.count;
    });
    
    res.json({
      documents,
      trends: {
        documentsMonthly
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;