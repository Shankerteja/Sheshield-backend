const Alert = require('../models/alertModel');
const Contact = require('../models/contactModel');
const User = require('../models/userModel');
const { sendEmergencyLocationMessage, sendEmergencyAlerts } = require('../utils/twilio');

// @desc    Create a new emergency alert
// @route   POST /api/emergency/alert
// @access  Private
const createAlert = async (req, res) => {
  try {
    const { location, message } = req.body;
    const user = await User.findById(req.user._id);
    const contacts = await Contact.find({ user: req.user._id });

    // Create the alert
    const alert = await Alert.create({
      user: req.user._id,
      location,
      message,
      status: 'active',
    });

    // Parse location string to get latitude and longitude
    let latitude, longitude;
    if (location && location.includes(',')) {
      [latitude, longitude] = location.split(',').map(coord => coord.trim());
    }

    // Send SMS to all emergency contacts
    const contactPhones = contacts.map(contact => contact.phone);
    const results = await sendEmergencyAlerts(
      user.name,
      latitude || 'unknown',
      longitude || 'unknown',
      contactPhones
    );

    res.status(201).json({
      success: true,
      message: 'Emergency alert created and sent',
      details: {
        totalContacts: results.total,
        successful: results.successful,
        failed: results.failed
      }
    });
  } catch (error) {
    console.error('Error creating emergency alert:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create emergency alert',
      error: error.message 
    });
  }
};

// @desc    Get all alerts for a user
// @route   GET /api/emergency/alerts
// @access  Private
const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    console.error('Error getting alerts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update alert status
// @route   PUT /api/emergency/alerts/:id
// @access  Private
const updateAlertStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    // Check if the alert belongs to the user
    if (alert.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    alert.status = status;
    await alert.save();

    res.json(alert);
  } catch (error) {
    console.error('Error updating alert status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete an alert
// @route   DELETE /api/emergency/alerts/:id
// @access  Private
const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    // Check if the alert belongs to the user
    if (alert.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await alert.remove();
    res.json({ message: 'Alert removed' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send emergency alert to a specific contact
// @route   POST /api/emergency/alert/:contactId
// @access  Private
const sendAlertToContact = async (req, res) => {
  try {
    const { message } = req.body;
    const contact = await Contact.findById(req.params.contactId);
    const user = await User.findById(req.user._id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Check if the contact belongs to the user
    if (contact.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Send SMS to the contact
    await sendEmergencyLocationMessage(
      contact.phone,
      user.name,
      'Location unavailable',
      message || 'This is a test message from SheShield'
    );

    res.json({ success: true, message: 'Test message sent successfully' });
  } catch (error) {
    console.error('Error sending test message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send test message',
      error: error.message 
    });
  }
};

module.exports = {
  createAlert,
  getAlerts,
  updateAlertStatus,
  deleteAlert,
  sendAlertToContact
}; 