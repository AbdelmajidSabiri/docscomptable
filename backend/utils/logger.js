// utils/logger.js
const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, json } = format;

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let log = `${timestamp} [${level}]: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    log += ` ${JSON.stringify(metadata)}`;
  }
  
  return log;
});

// Create logger instance
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Console transport
    new transports.Console({
      format: combine(
        colorize(),
        logFormat
      )
    }),
    
    // File transports
    new transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  exitOnError: false
});

// Add request logger middleware
const requestLogger = (req, res, next) => {
  // Skip logging for static assets
  if (req.path.startsWith('/public') || req.path.startsWith('/assets')) {
    return next();
  }
  
  const startTime = new Date();
  
  // Log when response is finished
  res.on('finish', () => {
    const duration = new Date() - startTime;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    
    // Log user ID if authenticated
    const userId = req.user ? req.user.id : 'unauthenticated';
    
    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error(message, { userId, ip: req.ip, body: req.body });
    } else if (res.statusCode >= 400) {
      logger.warn(message, { userId, ip: req.ip });
    } else {
      logger.info(message, { userId, ip: req.ip });
    }
  });
  
  next();
};

// Add error logger middleware
const errorLogger = (err, req, res, next) => {
  const userId = req.user ? req.user.id : 'unauthenticated';
  
  logger.error(`${err.name}: ${err.message}`, {
    userId,
    ip: req.ip,
    url: req.originalUrl,
    method: req.method,
    stack: err.stack
  });
  
  next(err);
};

module.exports = {
  logger,
  requestLogger,
  errorLogger
};