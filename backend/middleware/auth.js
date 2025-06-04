const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    token = req.header('x-auth-token');
  }

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
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
  auth,
  isAdmin,
  isAccountant,
  isAdminOrAccountant
};