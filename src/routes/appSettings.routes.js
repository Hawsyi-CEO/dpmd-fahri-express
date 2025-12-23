const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const appSettingsController = require('../controllers/appSettings.controller');

// All routes require authentication
router.use(auth);

// Get all settings
router.get('/', appSettingsController.getAllSettings.bind(appSettingsController));

// Get specific setting by key
router.get('/:key', appSettingsController.getSetting.bind(appSettingsController));

// Update specific setting by key (only for superadmin/pemberdayaan_masyarakat)
router.put('/:key', appSettingsController.updateSetting.bind(appSettingsController));

module.exports = router;
