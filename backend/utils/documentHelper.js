// utils/documentHelper.js
const { generateThumbnail } = require('./thumbnailGenerator');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');

/**
 * Process a document file - generate thumbnail and extract metadata
 * @param {Buffer} fileData - Raw file data
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File MIME type
 * @returns {Promise<Object>} - Processed document with thumbnail
 */
async function processDocument(fileData, fileName, mimeType) {
  try {
    // Create temp directory if it doesn't exist
    const tempDir = path.join(os.tmpdir(), 'docscompta');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Generate a random file name to avoid collisions
    const randomName = crypto.randomBytes(16).toString('hex');
    const fileExt = path.extname(fileName);
    const tempFileName = `${randomName}${fileExt}`;
    const tempFilePath = path.join(tempDir, tempFileName);
    
    // Write file to temp directory
    fs.writeFileSync(tempFilePath, fileData);
    
    // Generate thumbnail
    const thumbnailPath = await generateThumbnail(tempFilePath, mimeType, tempDir);
    let thumbnailData = null;
    
    if (thumbnailPath) {
      thumbnailData = fs.readFileSync(path.join(tempDir, thumbnailPath));
    }
    
    // Clean up temp files
    try {
      fs.unlinkSync(tempFilePath);
      if (thumbnailPath) {
        fs.unlinkSync(path.join(tempDir, thumbnailPath));
      }
    } catch (error) {
      console.warn('Failed to clean up temp files:', error);
    }
    
    return {
      fileData,
      thumbnail: thumbnailData,
      fileName,
      mimeType
    };
  } catch (error) {
    console.error('Error processing document:', error);
    // Return original file data without thumbnail
    return {
      fileData,
      thumbnail: null,
      fileName,
      mimeType
    };
  }
}

/**
 * Check if a file is a valid document
 * @param {string} mimeType - MIME type of the file
 * @param {number} fileSize - Size of the file in bytes
 * @returns {Object} - Validation result
 */
function validateDocument(mimeType, fileSize) {
  // Supported MIME types
  const supportedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  // Check file type
  if (!supportedTypes.includes(mimeType)) {
    return {
      valid: false,
      error: 'File type not supported. Please upload PDF, image, or Office documents.'
    };
  }
  
  // Check file size (10 MB max)
  const maxSize = 10 * 1024 * 1024; // 10 MB
  if (fileSize > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Maximum file size is 10 MB.'
    };
  }
  
  return { valid: true };
}

/**
 * Get a human-readable file size
 * @param {number} bytes - File size in bytes
 * @returns {string} - Human-readable file size
 */
function getReadableFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = {
  processDocument,
  validateDocument,
  getReadableFileSize
};