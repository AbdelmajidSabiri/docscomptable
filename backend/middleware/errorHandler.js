// middleware/errorHandler.js

/**
 * Global error handling middleware
 * Catches all errors thrown in routes and provides a standardized response
 */
module.exports = (err, req, res, next) => {
  console.error('Error:', err.message);
  console.error(err.stack);

  // Database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(500).json({
      status: 'error',
      message: 'Database connection error. Please try again later.',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token. Please log in again.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired. Please log in again.',
    });
  }

  // Default to 500 server error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong on the server';
  
  res.status(statusCode).json({
    status: 'error',
    message,
    // Include stack trace in development environment only
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};