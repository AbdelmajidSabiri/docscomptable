// routes/documents.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../config/db');
const auth = require('../middleware/auth');

// Multer setup for temporary storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload document
router.post('/', auth, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { 
      company_id, 
      operation_type, 
      document_type, 
      document_date, 
      vendor_client 
    } = req.body;
    
    // Security check - company can only upload for itself
    if (req.user.role === 'company') {
      const [companies] = await db.query(
        'SELECT id FROM companies WHERE user_id = ?',
        [req.user.id]
      );
      
      if (companies.length === 0 || companies[0].id != company_id) {
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
        [company_id, accountantId]
      );
      
      if (companies.length === 0) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    // Store file directly in MySQL
    const [result] = await db.query(
      `INSERT INTO documents 
       (company_id, file_name, file_mime, file_content, operation_type, document_type, document_date, vendor_client) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_id, 
        req.file.originalname,
        req.file.mimetype,
        req.file.buffer, // Binary file data
        operation_type, 
        document_type, 
        document_date, 
        vendor_client
      ]
    );
    
    res.status(201).json({ 
      id: result.insertId,
      file_name: req.file.originalname
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get document content (file download)
router.get('/:id/download', auth, async (req, res) => {
  try {
    const documentId = req.params.id;
    
    // Get document with access check
    const [documents] = await db.query(
      `SELECT d.*, c.accountant_id, c.user_id as company_user_id
       FROM documents d
       JOIN companies c ON d.company_id = c.id
       WHERE d.id = ?`,
      [documentId]
    );
    
    if (documents.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    const document = documents[0];
    
    // Security check - company can only view its own documents
    if (req.user.role === 'company' && document.company_user_id != req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    } else if (req.user.role === 'accountant') {
      // Check if document belongs to a company assigned to this accountant
      const [accountants] = await db.query(
        'SELECT id FROM accountants WHERE user_id = ?',
        [req.user.id]
      );
      
      if (accountants.length === 0 || accountants[0].id != document.accountant_id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    // Set content type and send file
    res.setHeader('Content-Type', document.file_mime);
    res.setHeader('Content-Disposition', `attachment; filename="${document.file_name}"`);
    
    // Send the file content directly from the database
    res.send(document.file_content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get documents metadata by company
router.get('/company/:companyId', auth, async (req, res) => {
  try {
    const companyId = req.params.companyId;
    
    // Security check - company can only view its own documents
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
    
    // Get documents with optional filtering
    const { status, operation_type, document_type } = req.query;
    
    let query = `
      SELECT 
        id, company_id, file_name, file_mime, operation_type, 
        document_type, document_date, vendor_client, status, 
        comments, upload_date, processing_date 
      FROM documents 
      WHERE company_id = ?`;
    
    const params = [companyId];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (operation_type) {
      query += ' AND operation_type = ?';
      params.push(operation_type);
    }
    
    if (document_type) {
      query += ' AND document_type = ?';
      params.push(document_type);
    }
    
    query += ' ORDER BY upload_date DESC';
    
    const [documents] = await db.query(query, params);
    
    res.json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Process document (accountant only) - unchanged from your original implementation
router.patch('/:id/process', auth, async (req, res) => {
  try {
    if (req.user.role !== 'accountant' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const documentId = req.params.id;
    const { status, comments } = req.body;
    
    if (!['processed', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Check document exists and is associated with accountant's company
    if (req.user.role === 'accountant') {
      const [accountants] = await db.query(
        'SELECT id FROM accountants WHERE user_id = ?',
        [req.user.id]
      );
      
      if (accountants.length === 0) {
        return res.status(404).json({ message: 'Accountant profile not found' });
      }
      
      const accountantId = accountants[0].id;
      
      const [documents] = await db.query(`
        SELECT d.* FROM documents d
        JOIN companies c ON d.company_id = c.id
        WHERE d.id = ? AND c.accountant_id = ?
      `, [documentId, accountantId]);
      
      if (documents.length === 0) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    // Update document
    await db.query(
      'UPDATE documents SET status = ?, comments = ?, processing_date = ? WHERE id = ?',
      [status, comments, new Date(), documentId]
    );
    
    // Add notification for company
    const [documents] = await db.query(
      'SELECT company_id FROM documents WHERE id = ?',
      [documentId]
    );
    
    if (documents.length > 0) {
      const companyId = documents[0].company_id;
      
      const [companies] = await db.query(
        'SELECT user_id FROM companies WHERE id = ?',
        [companyId]
      );
      
      if (companies.length > 0) {
        const userId = companies[0].user_id;
        const message = `Your document has been ${status === 'processed' ? 'processed' : 'rejected'}.`;
        
        await db.query(
          'INSERT INTO notifications (recipient_type, recipient_id, message) VALUES (?, ?, ?)',
          ['company', userId, message]
        );
      }
    }
    
    res.json({ message: 'Document processed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;