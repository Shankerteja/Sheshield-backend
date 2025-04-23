const express = require('express');
const router = express.Router();
const { sendSMS } = require('../utils/twilio');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

console.log('Test Routes - Twilio Credentials:');
console.log('TWILIO_ACCOUNT_SID:', accountSid ? 'Set' : 'Not Set');
console.log('TWILIO_AUTH_TOKEN:', authToken ? 'Set' : 'Not Set');
console.log('TWILIO_PHONE_NUMBER:', twilioNumber ? 'Set' : 'Not Set');

// @route   POST /api/test/send-test-sms
// @desc    Send a test SMS message
// @access  Public
router.post('/send-test-sms', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const message = await sendSMS(
      phoneNumber,
      'This is a test message from SheShield. If you receive this, SMS sending is working correctly!'
    );

    res.json({ 
      success: true, 
      message: 'Test SMS sent successfully',
      sid: message.sid 
    });
  } catch (error) {
    console.error('Error sending test SMS:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send test SMS',
      error: error.message 
    });
  }
});

module.exports = router; 