// config/db.js

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

// Initialize database tables if they don't exist
const initTables = async () => {
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
        admission_date DATE,
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
        taxId VARCHAR(50) NOT NULL,
        address TEXT,
        contact_name VARCHAR(255),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        status ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'pending',
        activation_date DATE,
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
        file_mime VARCHAR(100) NOT NULL,
        file_content LONGBLOB,
        thumbnail LONGBLOB,
        operation_type VARCHAR(50) NOT NULL,
        document_type VARCHAR(50) NOT NULL,
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

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error.message);
    process.exit(1);
  }
};

module.exports = {
  query: pool.query.bind(pool),
  getConnection: pool.getConnection.bind(pool),
  testConnection,
  initTables
};