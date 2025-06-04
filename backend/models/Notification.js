const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['success', 'warning', 'error', 'info'],
    default: 'info'
  },
  read: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema); 