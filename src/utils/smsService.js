const { sendSMS } = require('./twilio');

/**
 * Send an SMS message
 * @param {string} to - The recipient's phone number
 * @param {string} message - The message to send
 * @returns {Promise} - A promise that resolves when the message is sent
 */
const sendSMSMessage = async (to, message) => {
  try {
    return await sendSMS(to, message);
  } catch (error) {
    console.error('Error in smsService:', error);
    throw error;
  }
};

module.exports = {
  sendSMS: sendSMSMessage
}; 