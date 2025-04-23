const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getContacts,
  addContact,
  updateContact,
  deleteContact,
} = require('../controllers/contactController');

// Contact routes
router.route('/')
  .get(protect, getContacts)
  .post(protect, addContact);

router.route('/:id')
  .put(protect, updateContact)
  .delete(protect, deleteContact);

module.exports = router; 