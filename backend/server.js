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
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/usersRoutes'));
app.use('/api/accountants', require('./routes/accountantsRoutes'));
app.use('/api/companies', require('./routes/companiesRoutes'));
app.use('/api/documents', require('./routes/documentsRoutes'));
app.use('/api/notifications', require('./routes/notificationsRoutes'));


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});