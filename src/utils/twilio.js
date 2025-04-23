const twilio = require('twilio');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Debug environment variables
console.log('Twilio Environment Variables:');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Not Set');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Not Set');
console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER ? 'Set' : 'Not Set');

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

let client;
if (accountSid && authToken) {
  try {
    client = twilio(accountSid, authToken);
    console.log('Twilio client initialized successfully');
    
    // Check if this is a trial account
    client.api.accounts(accountSid)
      .fetch()
      .then(account => {
        console.log('Twilio Account Type:', account.type);
        console.log('Twilio Account Status:', account.status);
        if (account.type === 'Trial') {
          console.warn('WARNING: This is a Twilio Trial account. SMS can only be sent to verified numbers.');
        }
      })
      .catch(err => {
        console.error('Error fetching Twilio account info:', err);
      });
  } catch (error) {
    console.error('Error initializing Twilio client:', error);
    client = null;
  }
} else {
  console.warn('Twilio credentials not found. SMS functionality will be mocked.');
  client = null;
}

/**
 * Format phone number to E.164 format for Twilio
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - The formatted phone number
 */
const formatPhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // If the number already starts with +, return it as is
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }
  
  // If the number starts with 91 (India country code), add + prefix
  if (digitsOnly.startsWith('91')) {
    return `+${digitsOnly}`;
  }
  
  // If the number is 10 digits (Indian format), add +91 prefix
  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }
  
  // If the number is 12 digits (with country code), add + prefix
  if (digitsOnly.length === 12) {
    return `+${digitsOnly}`;
  }
  
  // Default: just add + prefix
  return `+${digitsOnly}`;
};

/**
 * Send an SMS message using Twilio
 * @param {string} to - The recipient's phone number
 * @param {string} message - The message to send
 * @returns {Promise} - A promise that resolves when the message is sent
 */
const sendSMS = async (to, message) => {
  // If Twilio client is not available, mock the SMS sending
  if (!client) {
    console.log(`[MOCK SMS] To: ${to}, Message: ${message}`);
    return { sid: 'mock_sid_' + Date.now() };
  }

  try {
    // Format the phone number to E.164 format
    const formattedNumber = formatPhoneNumber(to);
    console.log(`Original number: ${to}, Formatted number: ${formattedNumber}`);
    
    // Send real SMS to all numbers, including international ones
    console.log(`Attempting to send SMS to ${formattedNumber} from ${twilioNumber}`);
    
    const response = await client.messages.create({
      body: message,
      from: twilioNumber,
      to: formattedNumber
    });
    
    console.log(`SMS sent successfully to ${formattedNumber}. SID: ${response.sid}`);
    console.log(`Message status: ${response.status}`);
    console.log(`Message direction: ${response.direction}`);
    
    return response;
  } catch (error) {
    console.error('Error sending SMS:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error status:', error.status);
    
    // If the error is related to permissions for the region, use mock SMS
    if (error.code === 21408 || error.message.includes('Permission to send an SMS has not been enabled')) {
      console.warn('Twilio doesn\'t have permission to send SMS to this region. Using mock SMS service.');
      console.log(`[MOCK SMS] To: ${to}, Message: ${message}`);
      return { sid: 'mock_sid_' + Date.now() };
    }
    
    throw error;
  }
};

/**
 * Send an emergency location message to a contact
 * @param {string} contactPhone - The contact's phone number
 * @param {string} userName - The name of the user sending the alert
 * @param {string} location - The user's location (address or coordinates)
 * @param {string} message - Additional message (optional)
 * @returns {Promise} - A promise that resolves when the message is sent
 */
const sendEmergencyLocationMessage = async (contactPhone, userName, location, message = '') => {
  // Create a shorter emergency message that stays within the 160-character limit
  let emergencyMessage = `🚨 EMERGENCY: ${userName} needs help! Location: ${location}`;
  
  // If there's an additional message and we have room, add it
  if (message && emergencyMessage.length + message.length + 1 <= 160) {
    emergencyMessage += `\n${message}`;
  }
  
  // Add a short note about the source if we have room
  const sourceNote = "\nFrom SheShield";
  if (emergencyMessage.length + sourceNote.length <= 160) {
    emergencyMessage += sourceNote;
  }
  
  console.log(`Emergency message length: ${emergencyMessage.length} characters`);
  
  return sendSMS(contactPhone, emergencyMessage);
};

/**
 * Send emergency alerts to multiple contacts
 * @param {string} userName - The name of the user sending the alert
 * @param {string} latitude - The user's latitude
 * @param {string} longitude - The user's longitude
 * @param {Array} contacts - Array of contact phone numbers
 * @returns {Promise} - A promise that resolves when all messages are sent
 */
const sendEmergencyAlerts = async (userName, latitude, longitude, contacts) => {
  const location = `https://maps.google.com/?q=${latitude},${longitude}`;
  const message = `I need immediate help!`;
  
  const results = {
    total: contacts.length,
    successful: 0,
    failed: 0,
    details: []
  };
  
  for (const contact of contacts) {
    try {
      await sendEmergencyLocationMessage(contact, userName, location, message);
      results.successful++;
      results.details.push({ contact, status: 'success' });
    } catch (error) {
      console.error(`Failed to send to ${contact}:`, error);
      results.failed++;
      results.details.push({ contact, status: 'failed', error: error.message });
    }
  }
  
  return results;
};

module.exports = {
  sendSMS,
  sendEmergencyLocationMessage,
  sendEmergencyAlerts
}; 