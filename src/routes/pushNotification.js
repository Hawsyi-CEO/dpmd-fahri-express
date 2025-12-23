const express = require('express');
const router = express.Router();
const { vapidKeys } = require('../config/push-notification');
const PushSubscription = require('../models/pushSubscription');
const PushNotificationService = require('../services/pushNotificationService');
const { auth } = require('../middlewares/auth');

/**
 * GET /api/push-notification/vapid-public-key
 * Get VAPID public key untuk client subscription
 */
router.get('/vapid-public-key', (req, res) => {
  res.json({
    success: true,
    publicKey: vapidKeys.publicKey
  });
});

/**
 * POST /api/push-notification/subscribe
 * Subscribe user ke push notifications
 */
router.post('/subscribe', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription data'
      });
    }

    await PushSubscription.saveSubscription(userId, subscription);

    res.json({
      success: true,
      message: 'Successfully subscribed to push notifications'
    });
  } catch (error) {
    console.error('Error subscribing to push:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe',
      error: error.message
    });
  }
});

/**
 * POST /api/push-notification/unsubscribe
 * Unsubscribe user dari push notifications
 */
router.post('/unsubscribe', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Endpoint is required'
      });
    }

    await PushSubscription.removeSubscription(userId, endpoint);

    res.json({
      success: true,
      message: 'Successfully unsubscribed from push notifications'
    });
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe',
      error: error.message
    });
  }
});

/**
 * GET /api/push-notification/subscriptions
 * Get user's active subscriptions
 */
router.get('/subscriptions', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const subscriptions = await PushSubscription.getSubscriptionsByUser(userId);

    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscriptions',
      error: error.message
    });
  }
});

/**
 * POST /api/push-notification/send
 * Send test push notification (admin only)
 */
router.post('/send', auth, async (req, res) => {
  try {
    // Check if user is admin/superadmin
    if (!['superadmin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required'
      });
    }

    const { userId, userIds, broadcast, payload } = req.body;

    let result;
    
    if (broadcast) {
      // Broadcast ke semua users
      result = await PushNotificationService.sendToAll(payload);
    } else if (userIds && Array.isArray(userIds)) {
      // Send ke multiple users
      result = await PushNotificationService.sendToMultipleUsers(userIds, payload);
    } else if (userId) {
      // Send ke single user
      result = await PushNotificationService.sendToUser(userId, payload);
    } else {
      return res.status(400).json({
        success: false,
        message: 'userId, userIds, or broadcast flag is required'
      });
    }

    res.json({
      success: true,
      message: 'Push notification sent',
      data: result
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send push notification',
      error: error.message
    });
  }
});

/**
 * POST /api/push-notification/test
 * Send test notification to current user
 */
router.post('/test', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const payload = {
      title: '🎉 Test Notification',
      body: 'Push notification berhasil! Sistem bekerja dengan baik.',
      icon: '/logo-192.png',
      badge: '/logo-96.png',
      tag: 'test-notification',
      data: {
        type: 'test',
        timestamp: Date.now(),
        url: '/'
      },
      vibrate: [200, 100, 200],
      requireInteraction: false
    };

    const result = await PushNotificationService.sendToUser(userId, payload);

    res.json({
      success: true,
      message: 'Test notification sent',
      data: result
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: error.message
    });
  }
});

module.exports = router;
