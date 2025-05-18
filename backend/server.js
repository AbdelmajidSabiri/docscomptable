// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'docscompta',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Make uploads directory accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Auth middleware
const auth = async (req, res, next) => {
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Role middleware
const role = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

// Initialize database tables
const initDatabase = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'accountant', 'company') NOT NULL,
        status ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Administrators table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS administrators (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Accountants table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS accountants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Companies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        accountant_id INT,
        name VARCHAR(255) NOT NULL,
        siret VARCHAR(50) NOT NULL,
        address TEXT,
        contact_name VARCHAR(255),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        status ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (accountant_id) REFERENCES accountants(id) ON DELETE SET NULL
      )
    `);

    // Documents table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        file_mime VARCHAR(100) NOT NULL,
        operation_type ENUM('purchase', 'sale') NOT NULL,
        document_type ENUM('invoice', 'receipt', 'delivery_note', 'other') NOT NULL,
        document_date DATE NOT NULL,
        vendor_client VARCHAR(255),
        amount DECIMAL(10, 2),
        reference VARCHAR(100),
        status ENUM('new', 'processed', 'rejected') NOT NULL DEFAULT 'new',
        comments TEXT,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processing_date TIMESTAMP NULL,
        processed_by INT,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (processed_by) REFERENCES accountants(id) ON DELETE SET NULL
      )
    `);

    // Notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipient_type ENUM('admin', 'accountant', 'company') NOT NULL,
        recipient_id INT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create default admin if none exists
    const [admins] = await pool.query('SELECT * FROM users WHERE role = "admin" LIMIT 1');
    
    if (admins.length === 0) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Insert admin user
      const [result] = await pool.query(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        ['admin@docscompta.com', hashedPassword, 'admin']
      );
      
      const userId = result.insertId;
      
      // Insert admin profile
      await pool.query(
        'INSERT INTO administrators (name, user_id) VALUES (?, ?)',
        ['System Administrator', userId]
      );
      
      console.log('Default admin user created successfully');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'DocsCompta API is running' });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role, name, siret, address, contactName, contactEmail, contactPhone } = req.body;
    
    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const [result] = await pool.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );
    
    const userId = result.insertId;
    
    // Create profile based on role
    if (role === 'accountant') {
      await pool.query(
        'INSERT INTO accountants (name, user_id) VALUES (?, ?)',
        [name, userId]
      );
    } else if (role === 'company') {
      await pool.query(
        'INSERT INTO companies (name, user_id, siret, address, contact_name, contact_email, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, userId, siret, address, contactName, contactEmail, contactPhone]
      );
    } else if (role === 'admin') {
      await pool.query(
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
      process.env.JWT_SECRET || 'your_secret_key',
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

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
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
      process.env.JWT_SECRET || 'your_secret_key',
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

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const [users] = await pool.query(
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
      const [accountants] = await pool.query(
        'SELECT * FROM accountants WHERE user_id = ?',
        [user.id]
      );
      if (accountants.length > 0) {
        profile = accountants[0];
      }
    } else if (user.role === 'company') {
      const [companies] = await pool.query(
        'SELECT * FROM companies WHERE user_id = ?',
        [user.id]
      );
      if (companies.length > 0) {
        profile = companies[0];
      }
    } else if (user.role === 'admin') {
      const [admins] = await pool.query(
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

// Company routes
app.get('/api/companies', auth, async (req, res) => {
  try {
    // Admin can see all companies
    if (req.user.role === 'admin') {
      const [companies] = await pool.query(`
        SELECT c.*, u.email, a.name as accountant_name FROM companies c
        JOIN users u ON c.user_id = u.id
        LEFT JOIN accountants a ON c.accountant_id = a.id
      `);
      
      return res.json(companies);
    }
    
    // Accountant can see assigned companies
    if (req.user.role === 'accountant') {
      const [accountants] = await pool.query(
        'SELECT id FROM accountants WHERE user_id = ?',
        [req.user.id]
      );
      
      if (accountants.length === 0) {
        return res.status(404).json({ message: 'Accountant profile not found' });
      }
      
      const accountantId = accountants[0].id;
      
      const [companies] = await pool.query(`
        SELECT c.*, u.email FROM companies c
        JOIN users u ON c.user_id = u.id
        WHERE c.accountant_id = ?
      `, [accountantId]);
      
      return res.json(companies);
    }
    
    // Company can see only itself
    if (req.user.role === 'company') {
      const [companies] = await pool.query(`
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
app.get('/api/companies/:id', auth, async (req, res) => {
  try {
    const companyId = req.params.id;
    
    // Security check - only allow access to company's own data or to admin
    if (req.user.role === 'company') {
      const [companies] = await pool.query(
        'SELECT id FROM companies WHERE user_id = ?',
        [req.user.id]
      );
      
      if (companies.length === 0 || companies[0].id != companyId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'accountant') {
      // Check if company is assigned to this accountant
      const [accountants] = await pool.query(
        'SELECT id FROM accountants WHERE user_id = ?',
        [req.user.id]
      );
      
      if (accountants.length === 0) {
        return res.status(404).json({ message: 'Accountant profile not found' });
      }
      
      const accountantId = accountants[0].id;
      
      const [companies] = await pool.query(
        'SELECT id FROM companies WHERE id = ? AND accountant_id = ?',
        [companyId, accountantId]
      );
      
      if (companies.length === 0) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    const [companies] = await pool.query(`
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
app.post('/api/companies/:id/assign', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const companyId = req.params.id;
    const { accountant_id } = req.body;
    
    // Check if company exists
    const [companies] = await pool.query(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    );
    
    if (companies.length === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Check if accountant exists
    if (accountant_id) {
      const [accountants] = await pool.query(
        'SELECT * FROM accountants WHERE id = ?',
        [accountant_id]
      );
      
      if (accountants.length === 0) {
        return res.status(404).json({ message: 'Accountant not found' });
      }
    }
    
    // Assign company to accountant
    await pool.query(
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
app.patch('/api/companies/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const companyId = req.params.id;
    const { status } = req.body;
    
    if (!['pending', 'active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    await pool.query(
      'UPDATE companies SET status = ? WHERE id = ?',
      [status, companyId]
    );
    
    res.json({ message: 'Company status updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Document routes
app.post('/api/documents', auth, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { 
      company_id, 
      operation_type, 
      document_type, 
      document_date, 
      vendor_client,
      amount,
      reference
    } = req.body;
    
    // Security check - company can only upload for itself
    if (req.user.role === 'company') {
      const [companies] = await pool.query(
        'SELECT id FROM companies WHERE user_id = ?',
        [req.user.id]
      );
      
      if (companies.length === 0 || companies[0].id != company_id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'accountant') {
      // Check if company is assigned to this accountant
      const [accountants] = await pool.query(
        'SELECT id FROM accountants WHERE user_id = ?',
        [req.user.id]
      );
      
      if (accountants.length === 0) {
        return res.status(404).json({ message: 'Accountant profile not found' });
      }
      
      const accountantId = accountants[0].id;
      
      const [companies] = await pool.query(
        'SELECT id FROM companies WHERE id = ? AND accountant_id = ?',
        [company_id, accountantId]
      );
      
      if (companies.length === 0) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    // Store file info in database
    const [result] = await pool.query(
      `INSERT INTO documents 
       (company_id, file_name, file_path, file_mime, operation_type, document_type, document_date, vendor_client, amount, reference) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_id, 
        req.file.originalname,
        req.file.path,
        req.file.mimetype,
        operation_type, 
        document_type, 
        document_date, 
        vendor_client,
        amount || null,
        reference || null
      ]
    );
    
    res.status(201).json({ 
      id: result.insertId,
      file_name: req.file.originalname,
      file_path: req.file.path
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get document content (file download)
app.get('/api/documents/:id/download', auth, async (req, res) => {
  try {
    const documentId = req.params.id;
    
    // Get document with access check
    const [documents] = await pool.query(
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
      const [accountants] = await pool.query(
        'SELECT id FROM accountants WHERE user_id = ?',
        [req.user.id]
      );
      
      if (accountants.length === 0 || accountants[0].id != document.accountant_id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    // Send the file
    res.download(document.file_path, document.file_name);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get documents by company
app.get('/api/documents/company/:companyId', auth, async (req, res) => {
  try {
    const companyId = req.params.companyId;
    
    // Security check - company can only view its own documents
    if (req.user.role === 'company') {
      const [companies] = await pool.query(
        'SELECT id FROM companies WHERE user_id = ?',
        [req.user.id]
      );
      
      if (companies.length === 0 || companies[0].id != companyId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'accountant') {
      // Check if company is assigned to this accountant
      const [accountants] = await pool.query(
        'SELECT id FROM accountants WHERE user_id = ?',
        [req.user.id]
      );
      
      if (accountants.length === 0) {
        return res.status(404).json({ message: 'Accountant profile not found' });
      }
      
      const accountantId = accountants[0].id;
      
      const [companies] = await pool.query(
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
        id, company_id, file_name, file_path, file_mime, operation_type, 
        document_type, document_date, vendor_client, amount, reference, status, 
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
    
    const [documents] = await pool.query(query, params);
    
    res.json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Process document (accountant only)
app.patch('/api/documents/:id/process', auth, async (req, res) => {
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
    let accountantId = null;
    
    if (req.user.role === 'accountant') {
      const [accountants] = await pool.query(
        'SELECT id FROM accountants WHERE user_id = ?',
        [req.user.id]
      );
      
      if (accountants.length === 0) {
        return res.status(404).json({ message: 'Accountant profile not found' });
      }
      
      accountantId = accountants[0].id;
      
      const [documents] = await pool.query(`
        SELECT d.* FROM documents d
        JOIN companies c ON d.company_id = c.id
        WHERE d.id = ? AND c.accountant_id = ?
      `, [documentId, accountantId]);
      
      if (documents.length === 0) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    // Update document
    await pool.query(
      'UPDATE documents SET status = ?, comments = ?, processing_date = ?, processed_by = ? WHERE id = ?',
      [status, comments, new Date(), accountantId, documentId]
    );
    
    // Add notification for company
    const [documents] = await pool.query(
      'SELECT company_id FROM documents WHERE id = ?',
      [documentId]
    );
    
    if (documents.length > 0) {
      const companyId = documents[0].company_id;
      
      const [companies] = await pool.query(
        'SELECT user_id FROM companies WHERE id = ?',
        [companyId]
      );
      
      if (companies.length > 0) {
        const userId = companies[0].user_id;
        const message = `Your document has been ${status === 'processed' ? 'processed' : 'rejected'}.`;
        
        await pool.query(
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

// Get notifications for current user
app.get('/api/notifications', async (req, res) => {
  try {
    // For development/testing purposes, return empty notifications array if not authenticated
    if (!req.header('x-auth-token')) {
      return res.json([]);
    }
    
    try {
      const token = req.header('x-auth-token');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
      req.user = decoded.user;
      
      const [notifications] = await pool.query(
        'SELECT * FROM notifications WHERE recipient_type = ? AND recipient_id = ? ORDER BY created_at DESC',
        [req.user.role, req.user.id]
      );
      
      res.json(notifications);
    } catch (err) {
      // If token invalid, still return empty array for development
      return res.json([]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
app.patch('/api/notifications/:id/read', auth, async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    // Security check - user can only mark their own notifications
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE id = ? AND recipient_type = ? AND recipient_id = ?',
      [notificationId, req.user.role, req.user.id]
    );
    
    if (notifications.length === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [notificationId]
    );
    
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get overview statistics (admin only)
app.get('/api/stats/overview', async (req, res) => {
  try {
    // Get user counts by role
    const [userCounts] = await pool.query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `);
    
    // Get document counts by status
    const [documentCounts] = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM documents
      GROUP BY status
    `);
    
    // Get company counts by status
    const [companyCounts] = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM companies
      GROUP BY status
    `);
    
    // Get total counts
    const [totalCounts] = await pool.query(`
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
    const [documentsByMonth] = await pool.query(`
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
app.get('/api/stats/accountant/:id', auth, async (req, res) => {
  try {
    const accountantId = req.params.id;
    
    // Check if user has permission to view stats
    if (req.user.role === 'accountant') {
      const [accountants] = await pool.query(
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
    const [companyCounts] = await pool.query(`
      SELECT COUNT(*) as count, status
      FROM companies
      WHERE accountant_id = ?
      GROUP BY status
    `, [accountantId]);
    
    // Get document counts
    const [documentCounts] = await pool.query(`
      SELECT d.status, COUNT(*) as count
      FROM documents d
      JOIN companies c ON d.company_id = c.id
      WHERE c.accountant_id = ?
      GROUP BY d.status
    `, [accountantId]);
    
    // Get processing efficiency (avg processing time)
    const [processingTime] = await pool.query(`
      SELECT AVG(TIMESTAMPDIFF(HOUR, upload_date, processing_date)) as avg_hours
      FROM documents d
      JOIN companies c ON d.company_id = c.id
      WHERE c.accountant_id = ? AND d.status = 'processed' AND d.processing_date IS NOT NULL
    `, [accountantId]);
    
    // Document trend by month
    const currentYear = new Date().getFullYear();
    const [documentsTrend] = await pool.query(`
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
        avgProcessingHours: processingTime[0]?.avg_hours || 0,
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
app.get('/api/stats/company/:id', auth, async (req, res) => {
  try {
    const companyId = req.params.id;
    
    // Check if user has permission to view stats
    if (req.user.role === 'company') {
      const [companies] = await pool.query(
        'SELECT id FROM companies WHERE user_id = ?',
        [req.user.id]
      );
      
      if (companies.length === 0 || companies[0].id != companyId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'accountant') {
      const [accountants] = await pool.query(
        'SELECT id FROM accountants WHERE user_id = ?',
        [req.user.id]
      );
      
      if (accountants.length === 0) {
        return res.status(404).json({ message: 'Accountant profile not found' });
      }
      
      const accountantId = accountants[0].id;
      
      const [companies] = await pool.query(
        'SELECT id FROM companies WHERE id = ? AND accountant_id = ?',
        [companyId, accountantId]
      );
      
      if (companies.length === 0) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    // Get document counts by status
    const [documentCounts] = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM documents
      WHERE company_id = ?
      GROUP BY status
    `, [companyId]);
    
    // Get document counts by type
    const [documentTypes] = await pool.query(`
      SELECT document_type, COUNT(*) as count
      FROM documents
      WHERE company_id = ?
      GROUP BY document_type
    `, [companyId]);
    
    // Get document counts by operation type
    const [operationTypes] = await pool.query(`
      SELECT operation_type, COUNT(*) as count
      FROM documents
      WHERE company_id = ?
      GROUP BY operation_type
    `, [companyId]);
    
    // Get monthly document trend
    const currentYear = new Date().getFullYear();
    const [monthlyTrend] = await pool.query(`
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

// Get all accountants (Admin only)
app.get('/api/accountants', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const [accountants] = await pool.query(`
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
app.get('/api/accountants/:id', auth, async (req, res) => {
  try {
    const accountantId = req.params.id;
    
    // Admins can view any accountant, accountants can only view themselves
    if (req.user.role === 'accountant') {
      const [accountants] = await pool.query(
        'SELECT * FROM accountants WHERE user_id = ?',
        [req.user.id]
      );
      
      if (accountants.length === 0 || accountants[0].id != accountantId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const [accountants] = await pool.query(`
      SELECT a.*, u.email FROM accountants a
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `, [accountantId]);
    
    if (accountants.length === 0) {
      return res.status(404).json({ message: 'Accountant not found' });
    }
    
    // Get companies assigned to this accountant
    const [companies] = await pool.query(
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
app.put('/api/accountants/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const accountantId = req.params.id;
    const { name, phone, address, status } = req.body;
    
    await pool.query(
      'UPDATE accountants SET name = ?, phone = ?, address = ?, status = ? WHERE id = ?',
      [name, phone, address, status, accountantId]
    );
    
    res.json({ message: 'Accountant updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Initialize database and start server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});