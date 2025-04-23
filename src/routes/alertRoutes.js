const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createAlert,
  getAlerts,
  updateAlertStatus,
  deleteAlert,
} = require('../controllers/alertController');

// Alert routes
router.route('/')
  .post(protect, createAlert)
  .get(protect, getAlerts);

router.route('/:id')
  .put(protect, updateAlertStatus)
  .delete(protect, deleteAlert);

module.exports = router; 