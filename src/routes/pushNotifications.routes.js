const express = require('express');
const router = express.Router();
const pushNotificationsController = require('../controllers/pushNotifications.controller');
const { auth, checkRole } = require('../middlewares/auth');

// Subscribe to push notifications
router.post('/subscribe', auth, pushNotificationsController.subscribe);

// Unsubscribe from push notifications
router.post('/unsubscribe', auth, pushNotificationsController.unsubscribe);

// Send notification to specific user (admin/sekretariat/kepala_dinas/kepala_bidang/ketua_tim)
router.post('/send', auth, checkRole(['superadmin', 'admin', 'sekretariat', 'kepala_dinas', 'kepala_bidang', 'ketua_tim']), pushNotificationsController.sendToUser);

// Send notification to multiple users (admin/sekretariat/kepala_dinas/kepala_bidang/ketua_tim)
router.post('/send-multiple', auth, checkRole(['superadmin', 'admin', 'sekretariat', 'kepala_dinas', 'kepala_bidang', 'ketua_tim']), pushNotificationsController.sendToMultipleUsers);

// Get user's subscriptions
router.get('/subscriptions', auth, pushNotificationsController.getUserSubscriptions);

module.exports = router;
