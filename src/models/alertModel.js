const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
  },
  message: {
    type: String,
    required: [true, 'Please add a message'],
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'cancelled'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Alert', alertSchema); 