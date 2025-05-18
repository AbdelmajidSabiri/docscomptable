// scripts/maintenanceUtils.js
const db = require('../config/db');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Clean up old notifications
 * @param {number} daysOld - Delete notifications older than this many days
 * @returns {Promise<number>} - Number of notifications deleted
 */
async function cleanupOldNotifications(daysOld = 30) {
  console.log(`Cleaning up notifications older than ${daysOld} days...`);
  
  try {
    const [result] = await db.query(
      'DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
      [daysOld]
    );
    
    console.log(`Deleted ${result.affectedRows} old notifications`);
    return result.affectedRows;
  } catch (error) {
    console.error('Failed to clean up notifications:', error);
    throw error;
  }
}

/**
 * Optimize database tables
 * @returns {Promise<boolean>} - Whether optimization was successful
 */
async function optimizeTables() {
  console.log('Optimizing database tables...');
  
  try {
    // Get list of tables
    const [tables] = await db.query('SHOW TABLES');
    const tableNames = tables.map(table => Object.values(table)[0]);
    
    // Optimize each table
    for (const tableName of tableNames) {
      console.log(`Optimizing table: ${tableName}`);
      await db.query(`OPTIMIZE TABLE ${tableName}`);
    }
    
    console.log('Table optimization completed');
    return true;
  } catch (error) {
    console.error('Failed to optimize tables:', error);
    throw error;
  }
}

/**
 * Clean up unused document files
 * @returns {Promise<number>} - Number of files cleaned up
 */
async function cleanupUnusedDocuments() {
  console.log('Cleaning up unused document files...');
  
  try {
    // Find documents with file content but no references
    const [orphanedDocs] = await db.query(`
      SELECT d.id, d.file_name 
      FROM documents d
      LEFT JOIN companies c ON d.company_id = c.id
      WHERE c.id IS NULL AND d.file_content IS NOT NULL
    `);
    
    console.log(`Found ${orphanedDocs.length} orphaned documents`);
    
    // Delete orphaned documents
    for (const doc of orphanedDocs) {
      await db.query('DELETE FROM documents WHERE id = ?', [doc.id]);
      console.log(`Deleted orphaned document: ${doc.file_name} (ID: ${doc.id})`);
    }
    
    return orphanedDocs.length;
  } catch (error) {
    console.error('Failed to clean up unused documents:', error);
    throw error;
  }
}

/**
 * Run all maintenance tasks
 * @returns {Promise<void>}
 */
async function runMaintenance() {
  try {
    await cleanupOldNotifications();
    await optimizeTables();
    await cleanupUnusedDocuments();
    console.log('All maintenance tasks completed successfully');
  } catch (error) {
    console.error('Maintenance failed:', error);
    throw error;
  }
}

// Export functions
module.exports = {
  cleanupOldNotifications,
  optimizeTables,
  cleanupUnusedDocuments,
  runMaintenance
};

// Run maintenance if executed directly
if (require.main === module) {
  const [,, command, arg] = process.argv;
  
  switch (command) {
    case 'notifications':
      cleanupOldNotifications(arg ? parseInt(arg) : 30)
        .then(count => console.log(`Deleted ${count} notifications`))
        .catch(console.error);
      break;
      
    case 'optimize':
      optimizeTables()
        .then(() => console.log('Optimization completed'))
        .catch(console.error);
      break;
      
    case 'documents':
      cleanupUnusedDocuments()
        .then(count => console.log(`Deleted ${count} unused documents`))
        .catch(console.error);
      break;
      
    case 'all':
      runMaintenance()
        .then(() => console.log('Maintenance completed'))
        .catch(console.error);
      break;
      
    default:
      console.log('Usage:');
      console.log('  node maintenanceUtils.js notifications [days]  - Clean up old notifications');
      console.log('  node maintenanceUtils.js optimize              - Optimize database tables');
      console.log('  node maintenanceUtils.js documents             - Clean up unused documents');
      console.log('  node maintenanceUtils.js all                   - Run all maintenance tasks');
      break;
  }
}