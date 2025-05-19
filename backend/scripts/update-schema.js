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

    // Modify users table to support 'admin', 'comptable', and 'user' roles
    await connection.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('admin', 'accountant', 'company', 'comptable', 'user') 
      NOT NULL DEFAULT 'user'
    `);
    console.log('Updated users table role column');

    // Add name column if it doesn't exist
    try {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN name VARCHAR(255) NOT NULL
      `);
      console.log('Added name column to users table');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('Name column already exists in users table');
      } else {
        throw err;
      }
    }

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