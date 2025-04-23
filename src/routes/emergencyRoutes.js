const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getContacts,
  addContact,
  updateContact,
  deleteContact
} = require('../controllers/contactController');
const {
  createAlert,
  getAlerts,
  updateAlertStatus,
  deleteAlert,
  sendAlertToContact
} = require('../controllers/alertController');

// All routes are protected and require authentication
router.use(protect);

// Emergency contact routes
router.route('/contacts')
  .get(getContacts)
  .post(addContact);

router.route('/contacts/:id')
  .put(updateContact)
  .delete(deleteContact);

// Emergency alert routes
router.post('/alert', createAlert);
router.get('/alerts', getAlerts);
router.put('/alerts/:id', updateAlertStatus);
router.delete('/alerts/:id', deleteAlert);
router.post('/alert/:contactId', sendAlertToContact);

module.exports = router; 