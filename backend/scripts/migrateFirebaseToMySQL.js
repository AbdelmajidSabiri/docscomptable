// scripts/migrateFirebaseToMySQL.js
const db = require('../config/db');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin SDK
const serviceAccountPath = path.resolve(__dirname, '../firebase-credentials.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('Firebase credentials file not found. Please add firebase-credentials.json to the root directory.');
  process.exit(1);
}

try {
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
} catch (error) {
  console.error('Firebase initialization failed:', error);
  process.exit(1);
}

const firestore = admin.firestore();
const bucket = admin.storage().bucket();

/**
 * Migrate users and associated data from Firebase to MySQL
 */
async function migrateUsers() {
  console.log('Starting user migration...');
  
  try {
    const usersSnapshot = await firestore.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('No users found in Firebase');
      return;
    }
    
    console.log(`Found ${usersSnapshot.size} users to migrate`);
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      
      // Check if user already exists in MySQL
      const [existingUsers] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [userData.email]
      );
      
      if (existingUsers.length > 0) {
        console.log(`User already exists: ${userData.email}`);
        continue;
      }
      
      // Create user in MySQL
      const [result] = await db.query(
        'INSERT INTO users (email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?)',
        [
          userData.email,
          userData.password || 'FIREBASE_AUTH', // Firebase auth may have no password
          userData.role || 'company',
          userData.status || 'active',
          userData.createdAt ? new Date(userData.createdAt._seconds * 1000) : new Date()
        ]
      );
      
      const userId = result.insertId;
      
      // Create profile based on role
      if (userData.role === 'admin') {
        await db.query(
          'INSERT INTO administrators (name, user_id, phone, address) VALUES (?, ?, ?, ?)',
          [userData.name || 'Admin', userId, userData.phone, userData.address]
        );
      } else if (userData.role === 'accountant') {
        await db.query(
          'INSERT INTO accountants (name, user_id, phone, address, admission_date, status) VALUES (?, ?, ?, ?, ?, ?)',
          [
            userData.name || 'Accountant',
            userId,
            userData.phone,
            userData.address,
            userData.admissionDate ? new Date(userData.admissionDate._seconds * 1000) : null,
            userData.status || 'active'
          ]
        );
      } else {
        // Company
        await db.query(
          'INSERT INTO companies (name, user_id, taxId, address, contact_name, contact_email, contact_phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            userData.companyName || userData.name || 'Company',
            userId,
            userData.taxId || 'UNKNOWN',
            userData.address,
            userData.contactName || userData.name,
            userData.contactEmail || userData.email,
            userData.contactPhone || userData.phone,
            userData.status || 'pending'
          ]
        );
      }
      
      console.log(`Migrated user: ${userData.email}`);
    }
    
    console.log('User migration completed');
  } catch (error) {
    console.error('User migration failed:', error);
    throw error;
  }
}

/**
 * Migrate documents from Firebase Storage to MySQL
 */
async function migrateDocuments() {
  console.log('Starting document migration...');
  
  try {
    const documentsSnapshot = await firestore.collection('documents').get();
    
    if (documentsSnapshot.empty) {
      console.log('No documents found in Firebase');
      return;
    }
    
    console.log(`Found ${documentsSnapshot.size} documents to migrate`);
    
    for (const doc of documentsSnapshot.docs) {
      const documentData = doc.data();
      
      // Skip if no company info
      if (!documentData.companyId) {
        console.log(`Skipping document with no company ID: ${doc.id}`);
        continue;
      }
      
      // Get company ID in MySQL
      const [companies] = await db.query(
        'SELECT c.id FROM companies c JOIN users u ON c.user_id = u.id WHERE u.email = ?',
        [documentData.companyEmail || '']
      );
      
      if (companies.length === 0) {
        console.log(`Company not found for document: ${doc.id}`);
        continue;
      }
      
      const companyId = companies[0].id;
      
      // Download file from Firebase Storage
      let fileContent = null;
      let fileType = 'application/pdf'; // Default
      
      if (documentData.filePath) {
        try {
          const tempFilePath = path.join(__dirname, `../temp/${doc.id}`);
          await bucket.file(documentData.filePath).download({ destination: tempFilePath });
          
          fileContent = fs.readFileSync(tempFilePath);
          fs.unlinkSync(tempFilePath); // Clean up
          
          // Determine file type
          const fileName = path.basename(documentData.filePath);
          const ext = path.extname(fileName).toLowerCase();
          
          if (['.jpg', '.jpeg'].includes(ext)) {
            fileType = 'image/jpeg';
          } else if (ext === '.png') {
            fileType = 'image/png';
          } else if (ext === '.pdf') {
            fileType = 'application/pdf';
          }
        } catch (error) {
          console.error(`Failed to download file: ${documentData.filePath}`, error);
        }
      }
      
      // Check if document already exists in MySQL
      const [existingDocs] = await db.query(
        'SELECT * FROM documents WHERE company_id = ? AND document_date = ? AND document_type = ?',
        [
          companyId,
          documentData.documentDate ? new Date(documentData.documentDate._seconds * 1000) : new Date(),
          documentData.documentType || 'Unknown'
        ]
      );
      
      if (existingDocs.length > 0) {
        console.log(`Document already exists: ${doc.id}`);
        continue;
      }
      
      // Create document in MySQL
      await db.query(
        `INSERT INTO documents 
         (company_id, file_name, file_mime, file_content, operation_type, document_type, document_date, 
          vendor_client, amount, reference, status, comments, upload_date, processing_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          companyId,
          documentData.fileName || `document_${doc.id}`,
          fileType,
          fileContent,
          documentData.operationType || 'Unknown',
          documentData.documentType || 'Unknown',
          documentData.documentDate ? new Date(documentData.documentDate._seconds * 1000) : new Date(),
          documentData.vendorClient,
          documentData.amount || null,
          documentData.reference || null,
          documentData.status || 'new',
          documentData.comments || null,
          documentData.uploadDate ? new Date(documentData.uploadDate._seconds * 1000) : new Date(),
          documentData.processingDate ? new Date(documentData.processingDate._seconds * 1000) : null
        ]
      );
      
      console.log(`Migrated document: ${doc.id}`);
    }
    
    console.log('Document migration completed');
  } catch (error) {
    console.error('Document migration failed:', error);
    throw error;
  }
}

/**
 * Main migration function
 */
async function migrate() {
  try {
    // Create temporary directory for file downloads if it doesn't exist
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Test database connection
    await db.testConnection();
    
    // Ensure tables exist
    await db.initTables();
    
    // Migrate users first (needed for company references)
    await migrateUsers();
    
    // Then migrate documents
    await migrateDocuments();
    
    console.log('Migration completed successfully');
    
    // Clean up temporary directory
    fs.rmdirSync(tempDir, { recursive: true });
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = migrate;