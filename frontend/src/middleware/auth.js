const jwt = require('jsonwebtoken');

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admin privileges required' });
  }
};

// Check if user is accountant
const isAccountant = (req, res, next) => {
  if (req.user && req.user.role === 'accountant') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Accountant privileges required' });
  }
};

// Check if user is admin or accountant
const isAdminOrAccountant = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'accountant')) {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admin or Accountant privileges required' });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  isAccountant,
  isAdminOrAccountant
}; 