// routes/documents.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage');
const { storage } = require('../config/firebase');
const db = require('../config/db');
const auth = require('../middleware/auth');

// Multer setup for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload a document
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { company_id, category_id } = req.body;
    
    // Authorization check
    if (req.user.user_type === 'company') {
      // Check if company belongs to user
      const [companies] = await db.query(
        'SELECT * FROM companies WHERE id = ? AND user_id = ?',
        [company_id, req.user.id]
      );
      
      if (companies.length === 0) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    } else if (req.user.user_type === 'accountant') {
      // Check if company belongs to accountant
      const [accountants] = await db.query(
        'SELECT id FROM accountants WHERE user_id = ?',
        [req.user.id]
      );
      
      if (accountants.length === 0) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      const accountantId = accountants[0].id;
      
      const [companies] = await db.query(
        'SELECT * FROM companies WHERE id = ? AND accountant_id = ?',
        [company_id, accountantId]
      );
      
      if (companies.length === 0) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }
    
    // Upload file to Firebase
    const file = req.file;
    const fileName = `${Date.now()}_${file.originalname}`;
    const fileRef = ref(storage, `documents/${fileName}`);
    
    const metadata = {
      contentType: file.mimetype,
    };
    
    // Upload to Firebase
    const snapshot = await uploadBytesResumable(fileRef, file.buffer, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Save document to database
    const [result] = await db.query(
      'INSERT INTO documents (company_id, category_id, file_name, file_path, uploaded_by) VALUES (?, ?, ?, ?, ?)',
      [company_id, category_id, fileName, downloadURL, req.user.id]
    );
    
    res.status(201).json({
      id: result.insertId,
      file_name: fileName,
      download_url: downloadURL
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get documents for a company
router.get('/company/:companyId', auth, async (req, res) => {
  try {
    const companyId = req.params.companyId;
    
    // Authorization check
    if (req.user.user_type === 'company') {
      // Check if company belongs to user
      const [companies] = await db.query(
        'SELECT * FROM companies WHERE id = ? AND user_id = ?',
        [companyId, req.user.id]
      );
      
      if (companies.length === 0) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    } else if (req.user.user_type === 'accountant') {
      // Check if company belongs to accountant
      const [accountants] = await db.query(
        'SELECT id FROM accountants WHERE user_id = ?',
        [req.user.id]
      );
      
      if (accountants.length === 0) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      const accountantId = accountants[0].id;
      
      const [companies] = await db.query(
        'SELECT * FROM companies WHERE id = ? AND accountant_id = ?',
        [companyId, accountantId]
      );
      
      if (companies.length === 0) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }
    
    // Get documents
    const [documents] = await db.query(
      `SELECT d.*, c.name as category_name, u.name as uploader_name
       FROM documents d
       JOIN document_categories c ON d.category_id = c.id
       JOIN users u ON d.uploaded_by = u.id
       WHERE d.company_id = ?
       ORDER BY d.id DESC`,
      [companyId]
    );
    
    res.json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update document status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const documentId = req.params.id;
    const { status } = req.body;
    
    // Only accountants can update status
    if (req.user.user_type !== 'accountant' && req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await db.query(
      'UPDATE documents SET status = ? WHERE id = ?',
      [status, documentId]
    );
    
    res.json({ message: 'Document status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;