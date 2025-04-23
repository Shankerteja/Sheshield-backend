const Contact = require('../models/contactModel');
const User = require('../models/userModel');
const { sendEmergencyLocationMessage } = require('../utils/twilio');

// @desc    Send emergency alert to all contacts
// @route   POST /api/emergency/alert
// @access  Private
const sendEmergencyAlert = async (req, res) => {
  try {
    const { location, message } = req.body;
    const userId = req.user._id;

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all emergency contacts for the user
    const contacts = await Contact.find({ user: userId });
    
    if (contacts.length === 0) {
      return res.status(400).json({ message: 'No emergency contacts found. Please add contacts first.' });
    }

    // Send SMS to each contact
    const results = await Promise.allSettled(
      contacts.map(contact => 
        sendEmergencyLocationMessage(
          contact.phone,
          user.name,
          location,
          message
        )
      )
    );

    // Count successful and failed messages
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    res.json({
      message: 'Emergency alert sent',
      details: {
        totalContacts: contacts.length,
        successful,
        failed
      }
    });
  } catch (error) {
    console.error('Error sending emergency alert:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// @desc    Send emergency alert to a specific contact
// @route   POST /api/emergency/alert/:contactId
// @access  Private
const sendEmergencyAlertToContact = async (req, res) => {
  try {
    const { location, message } = req.body;
    const { contactId } = req.params;
    const userId = req.user._id;

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the specific contact
    const contact = await Contact.findOne({ _id: contactId, user: userId });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Send SMS to the contact
    await sendEmergencyLocationMessage(
      contact.phone,
      user.name,
      location,
      message
    );

    res.json({
      message: 'Emergency alert sent',
      contact: {
        name: contact.name,
        phone: contact.phone
      }
    });
  } catch (error) {
    console.error('Error sending emergency alert:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

module.exports = {
  sendEmergencyAlert,
  sendEmergencyAlertToContact
}; 