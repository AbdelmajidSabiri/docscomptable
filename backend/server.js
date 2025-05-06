require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = require('./config/db');

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'docscompta API is running' });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/accountants', require('./routes/accountants.routes'));
app.use('/api/companies', require('./routes/companies.routes'));
app.use('/api/documents', require('./routes/documents.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});