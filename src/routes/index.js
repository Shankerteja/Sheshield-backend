const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const contactRoutes = require('./contactRoutes');
const emergencyRoutes = require('./emergencyRoutes');
const testRoutes = require('./testRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/contacts', contactRoutes);
router.use('/emergency', emergencyRoutes);
router.use('/test', testRoutes);

module.exports = router; 