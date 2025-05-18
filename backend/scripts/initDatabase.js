// scripts/initDatabase.js
const db = require('../config/db');
const bcrypt = require('bcrypt');

/**
 * Initialize the database with tables and default admin user
 */
async function initializeDatabase() {
  try {
    // Test database connection
    await db.testConnection();
    
    // Create tables if they don't exist
    await db.initTables();
    
    // Check if admin user exists
    const [admins] = await db.query('SELECT * FROM users WHERE role = "admin" LIMIT 1');
    
    // If no admin exists, create default admin
    if (admins.length === 0) {
      console.log('Creating default admin user...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Insert admin user
      const [result] = await db.query(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        ['admin@docscompta.com', hashedPassword, 'admin']
      );
      
      const userId = result.insertId;
      
      // Insert admin profile
      await db.query(
        'INSERT INTO administrators (name, user_id) VALUES (?, ?)',
        ['System Administrator', userId]
      );
      
      console.log('Default admin user created successfully');
    } else {
      console.log('Admin user already exists, skipping creation');
    }
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = initializeDatabase;