const express = require('express');
const router = express.Router();
const pushNotificationsController = require('../controllers/pushNotifications.controller');
const { auth } = require('../middlewares/auth');

// Subscribe to push notifications
router.post('/subscribe', auth, pushNotificationsController.subscribe);

// Unsubscribe from push notifications
router.post('/unsubscribe', auth, pushNotificationsController.unsubscribe);

// Send notification to specific user (admin only)
router.post('/send', auth, pushNotificationsController.sendToUser);

// Send notification to multiple users (admin only)
router.post('/send-multiple', auth, pushNotificationsController.sendToMultipleUsers);

// Get user's subscriptions
router.get('/subscriptions', auth, pushNotificationsController.getUserSubscriptions);

module.exports = router;
