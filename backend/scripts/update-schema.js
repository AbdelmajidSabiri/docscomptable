require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'docscomptable',
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0
};

const updateSchema = async () => {
  console.log('Starting schema update...');
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'accountant', 'company', 'comptable', 'user') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        name VARCHAR(255) NOT NULL
      )
    `);
    console.log('Created/Updated users table');

    // Create administrators table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS administrators (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        user_id INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Created/Updated administrators table');

    // Create accountants table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS accountants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        user_id INT NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        admission_date DATE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Created/Updated accountants table');

    // Create companies table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        user_id INT NOT NULL,
        siret VARCHAR(20) NOT NULL UNIQUE,
        address TEXT,
        contact_name VARCHAR(100),
        contact_email VARCHAR(100),
        contact_phone VARCHAR(20),
        activation_date TIMESTAMP NULL,
        status ENUM('pending', 'active', 'inactive') DEFAULT 'pending',
        accountant_id INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (accountant_id) REFERENCES accountants(id) ON DELETE RESTRICT
      )
    `);
    console.log('Created/Updated companies table');

    // Create documents table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        file_path VARCHAR(255),
        operation_type VARCHAR(50),
        document_type VARCHAR(50),
        document_date DATE,
        vendor_client VARCHAR(100),
        status ENUM('new', 'processed', 'rejected') DEFAULT 'new',
        comments TEXT,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processing_date TIMESTAMP NULL,
        file_content LONGBLOB,
        file_name VARCHAR(255),
        file_mime VARCHAR(100),
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);
    console.log('Created/Updated documents table');

    // Create notifications table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipient_type ENUM('admin', 'accountant', 'company') NOT NULL,
        recipient_id INT NOT NULL,
        message TEXT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created/Updated notifications table');

    console.log('Schema update completed successfully');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
};

updateSchema(); 