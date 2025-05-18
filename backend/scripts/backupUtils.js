// scripts/backupUtils.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);
require('dotenv').config();

// Get MySQL connection info from environment variables
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// Directory for backups
const BACKUP_DIR = path.join(__dirname, '../backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Create a database backup
 * @returns {Promise<string>} Path to the backup file
 */
async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `${DB_NAME}_${timestamp}.sql`);
  
  console.log(`Creating database backup: ${backupFile}`);
  
  try {
    const cmd = `mysqldump -h ${DB_HOST} -u ${DB_USER} ${DB_PASSWORD ? `-p${DB_PASSWORD}` : ''} ${DB_NAME} > ${backupFile}`;
    await execPromise(cmd);
    console.log('Backup created successfully');
    return backupFile;
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  }
}

/**
 * Restore database from backup file
 * @param {string} backupFile Path to the backup file
 * @returns {Promise<void>}
 */
async function restoreBackup(backupFile) {
  if (!fs.existsSync(backupFile)) {
    throw new Error(`Backup file not found: ${backupFile}`);
  }
  
  console.log(`Restoring database from backup: ${backupFile}`);
  
  try {
    const cmd = `mysql -h ${DB_HOST} -u ${DB_USER} ${DB_PASSWORD ? `-p${DB_PASSWORD}` : ''} ${DB_NAME} < ${backupFile}`;
    await execPromise(cmd);
    console.log('Database restored successfully');
  } catch (error) {
    console.error('Restore failed:', error);
    throw error;
  }
}

/**
 * List available backups
 * @returns {string[]} Array of backup file paths
 */
function listBackups() {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.endsWith('.sql'))
    .map(file => path.join(BACKUP_DIR, file));
  
  return files;
}

/**
 * Delete a backup file
 * @param {string} backupFile Path to the backup file
 * @returns {boolean} Whether the file was deleted
 */
function deleteBackup(backupFile) {
  if (!fs.existsSync(backupFile)) {
    return false;
  }
  
  try {
    fs.unlinkSync(backupFile);
    return true;
  } catch (error) {
    console.error(`Failed to delete backup: ${backupFile}`, error);
    return false;
  }
}

// Export functions
module.exports = {
  createBackup,
  restoreBackup,
  listBackups,
  deleteBackup
};

// Run backup if executed directly
if (require.main === module) {
  const [,, command, arg] = process.argv;
  
  switch (command) {
    case 'backup':
      createBackup()
        .then(file => console.log(`Backup created: ${file}`))
        .catch(err => {
          console.error('Backup failed:', err);
          process.exit(1);
        });
      break;
      
    case 'restore':
      if (!arg) {
        console.error('Please provide a backup file path');
        process.exit(1);
      }
      
      restoreBackup(arg)
        .then(() => console.log('Restore completed'))
        .catch(err => {
          console.error('Restore failed:', err);
          process.exit(1);
        });
      break;
      
    case 'list':
      console.log('Available backups:');
      listBackups().forEach(file => console.log(file));
      break;
      
    default:
      console.log('Usage:');
      console.log('  node backupUtils.js backup                   - Create a new backup');
      console.log('  node backupUtils.js restore [file_path]      - Restore from backup');
      console.log('  node backupUtils.js list                     - List available backups');
      break;
  }
}