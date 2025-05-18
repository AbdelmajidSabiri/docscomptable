// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { logger, requestLogger, errorLogger } = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const db = require('./config/db');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3000;

// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('combined')); // HTTP request logging
app.use(requestLogger); // Custom request logger
app.use('/api/', limiter); // Apply rate limiting to API routes

// Static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'docscompta API is running' });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/usersRoutes'));
app.use('/api/accountants', require('./routes/accountantsRoutes'));
app.use('/api/companies', require('./routes/companiesRoutes'));
app.use('/api/documents', require('./routes/documentsRoutes'));
app.use('/api/notifications', require('./routes/notificationsRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

// Error handling
app.use(errorLogger);
app.use(errorHandler);

// Initialize and start server
async function startServer() {
  try {
    // Test database connection
    await db.testConnection();
    
    // Initialize database tables
    await db.initTables();
    
    // Start listening
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  console.error('Unhandled Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});