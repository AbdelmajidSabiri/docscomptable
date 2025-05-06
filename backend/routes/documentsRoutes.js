// routes/documents.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage');
const db = require('../config/db');
const auth = require('../middleware/auth');

// Initialize Firebase
const firebaseConfig = {
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

// Multer setup
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
    
    // Upload to Firebase
    const dateString = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${dateString}_${req.file.originalname}`;
    const fileRef = ref(storage, `documents/${fileName}`);
    
    const metadata = {
      contentType: req.file.mimetype,
    };
    
    // Upload file
    const snapshot = await uploadBytesResumable(fileRef, req.file.buffer, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Save to database
    const [result] = await db.query(
      `INSERT INTO documents 
       (company_id, file_path, operation_type, document_type, document_date, vendor_client) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [company_id, downloadURL, operation_type, document_type, document_date, vendor_client]
    );
    
    res.status(201).json({ 
      id: result.insertId,
      file_path: downloadURL
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get documents by company
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
    
    let query = 'SELECT * FROM documents WHERE company_id = ?';
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

// Process document (accountant only)
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