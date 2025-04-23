const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: [true, 'Please add a contact name'],
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
  },
  relationship: {
    type: String,
    default: 'Emergency Contact',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Contact', contactSchema); 