const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const appSettingsController = require('../controllers/appSettings.controller');

// GET routes - no authentication required (public read)
router.get('/', appSettingsController.getAllSettings.bind(appSettingsController));
router.get('/:key', appSettingsController.getSetting.bind(appSettingsController));

// UPDATE routes - require authentication
router.put('/:key', auth, appSettingsController.updateSetting.bind(appSettingsController));

module.exports = router;
