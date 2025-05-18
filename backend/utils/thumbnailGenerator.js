// utils/thumbnailGenerator.js
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const pdf = require('pdf-parse');

/**
 * Generate a thumbnail for a document
 * @param {string} filePath Path to the original file
 * @param {string} mimeType MIME type of the file
 * @param {string} outputDir Directory to save the thumbnail
 * @param {number} width Thumbnail width
 * @param {number} height Thumbnail height
 * @returns {Promise<string>} Path to the generated thumbnail
 */
async function generateThumbnail(filePath, mimeType, outputDir, width = 300, height = 300) {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const thumbnailFilename = path.basename(filePath, path.extname(filePath)) + '_thumb.png';
  const thumbnailPath = path.join(outputDir, thumbnailFilename);
  
  // Create a canvas for the thumbnail
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Fill with white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);
  
  try {
    if (mimeType.startsWith('image/')) {
      // For images, resize the image to fit the thumbnail
      const image = await loadImage(filePath);
      
      // Calculate dimensions to maintain aspect ratio
      const aspectRatio = image.width / image.height;
      let drawWidth = width;
      let drawHeight = height;
      
      if (aspectRatio > 1) {
        // Landscape
        drawHeight = width / aspectRatio;
      } else {
        // Portrait
        drawWidth = height * aspectRatio;
      }
      
      // Center the image
      const offsetX = (width - drawWidth) / 2;
      const offsetY = (height - drawHeight) / 2;
      
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    } else if (mimeType === 'application/pdf') {
      // For PDFs, render the first page
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer, { max: 1 }); // Only parse first page
      
      // Draw PDF info
      ctx.font = '16px Arial';
      ctx.fillStyle = '#333';
      ctx.fillText('PDF Document', 20, 30);
      
      // Draw a PDF icon
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(20, 50, 50, 60);
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText('PDF', 25, 85);
      
      // Add some page info
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      const title = pdfData.info?.Title || path.basename(filePath, '.pdf');
      ctx.fillText(title.slice(0, 30) + (title.length > 30 ? '...' : ''), 20, 130);
      ctx.fillText(`Pages: ${pdfData.numpages}`, 20, 150);
    } else {
      // For other document types, create a generic icon
      const docType = mimeType.split('/')[1].toUpperCase();
      
      ctx.fillStyle = '#3498db';
      ctx.fillRect(width/2 - 50, height/2 - 60, 100, 120);
      
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText(docType, width/2 - 30, height/2 + 10);
      
      ctx.font = '14px Arial';
      ctx.fillText('Document', width/2 - 35, height/2 + 30);
    }
    
    // Save the thumbnail
    const thumbnailBuffer = canvas.toBuffer('image/png');
    fs.writeFileSync(thumbnailPath, thumbnailBuffer);
    
    return path.relative(path.dirname(outputDir), thumbnailPath);
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    
    // Create a fallback thumbnail with error message
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText('Preview', width/2 - 30, height/2 - 10);
    ctx.fillText('Unavailable', width/2 - 40, height/2 + 10);
    
    const thumbnailBuffer = canvas.toBuffer('image/png');
    fs.writeFileSync(thumbnailPath, thumbnailBuffer);
    
    return path.relative(path.dirname(outputDir), thumbnailPath);
  }
}

module.exports = { generateThumbnail };