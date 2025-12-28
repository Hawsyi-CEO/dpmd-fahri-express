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
 * GET /api/push-notification/check
 * Check if user has active subscription
 */
router.get('/check', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const subscriptions = await PushSubscription.getSubscriptionsByUser(userId);

    res.json({
      success: true,
      subscribed: subscriptions.length > 0,
      count: subscriptions.length
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check subscription',
      error: error.message
    });
  }
});

/**
 * GET /api/push-notification/statistics
 * Get notification statistics
 */
router.get('/statistics', auth, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Count total subscriptions
    const totalSubscribers = await prisma.push_subscriptions.count();

    // Count today's schedules
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySchedules = await prisma.jadwal_kegiatan.count({
      where: {
        tanggal_mulai: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Count tomorrow's schedules
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const tomorrowSchedules = await prisma.jadwal_kegiatan.count({
      where: {
        tanggal_mulai: {
          gte: tomorrow,
          lt: dayAfterTomorrow
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalSent: 0, // TODO: Implement notification log
        totalSubscribers,
        todaySchedules,
        tomorrowSchedules
      }
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
});

/**
 * GET /api/push-notification/history
 * Get notification history
 */
router.get('/history', auth, async (req, res) => {
  try {
    // TODO: Implement notification history from database
    // For now, return empty array
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get history',
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

/**
 * GET /api/push-notification/notifications
 * Get notifications for current user (based on activity logs)
 */
router.get('/notifications', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { limit = 10 } = req.query;

    const db = require('../config/database');
    
    let notifications = [];
    
    try {
      // For superadmin: get recent activity logs from all bidang
      if (userRole === 'superadmin') {
        const [activityLogs] = await db.query(`
          SELECT 
            al.id,
            al.action_type as type,
            al.description as message,
            al.created_at as time,
            u.name as user_name,
            b.nama_bidang as bidang_name
          FROM activity_logs al
          LEFT JOIN users u ON al.user_id = u.id
          LEFT JOIN bidang b ON al.bidang_id = b.id
          WHERE al.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          ORDER BY al.created_at DESC
          LIMIT ?
        `, [parseInt(limit)]);
        
        notifications = activityLogs.map(log => ({
          id: log.id,
          title: `${log.type || 'Activity'} - ${log.bidang_name || 'System'}`,
          message: log.message || `${log.user_name} melakukan aktivitas`,
          time: formatTimeAgo(log.time),
          read: false,
          type: log.type || 'activity',
          timestamp: log.time
        }));
      } 
      // For bidang users: get activity logs from their bidang
      else if (['kepala_bidang', 'ketua_tim', 'pegawai'].includes(userRole)) {
        const [userBidang] = await db.query(
          'SELECT bidang_id FROM users WHERE id = ?',
          [userId]
        );
        
        if (userBidang.length > 0 && userBidang[0].bidang_id) {
          const [activityLogs] = await db.query(`
            SELECT 
              al.id,
              al.action_type as type,
              al.description as message,
              al.created_at as time,
              u.name as user_name
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.id
            WHERE al.bidang_id = ?
              AND al.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY al.created_at DESC
            LIMIT ?
          `, [userBidang[0].bidang_id, parseInt(limit)]);
          
          notifications = activityLogs.map(log => ({
            id: log.id,
            title: log.type || 'Activity',
            message: log.message || `${log.user_name} melakukan aktivitas`,
            time: formatTimeAgo(log.time),
            read: false,
            type: log.type || 'activity',
            timestamp: log.time
          }));
        }
      }
      // For kepala_dinas and sekretaris_dinas: get from disposisi & kegiatan
      else if (['kepala_dinas', 'sekretaris_dinas'].includes(userRole)) {
        // Get recent disposisi
        const [disposisi] = await db.query(`
          SELECT 
            id,
            nomor_surat,
            perihal,
            created_at as time,
            'disposisi' as type
          FROM surat_masuk
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          ORDER BY created_at DESC
          LIMIT ?
        `, [parseInt(limit) / 2]);
        
        notifications = disposisi.map(d => ({
          id: `disposisi-${d.id}`,
          title: 'Disposisi Baru',
          message: `${d.nomor_surat} - ${d.perihal}`,
          time: formatTimeAgo(d.time),
          read: false,
          type: 'disposisi',
          timestamp: d.time
        }));
      }
    } catch (dbError) {
      console.error('Database query error:', dbError);
      // Return empty notifications if table doesn't exist or query fails
      notifications = [];
    }

    res.json({
      success: true,
      data: notifications,
      unreadCount: notifications.length
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message
    });
  }
});

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} hari lalu`;
  if (hours > 0) return `${hours} jam lalu`;
  if (minutes > 0) return `${minutes} menit lalu`;
  return 'Baru saja';
}

module.exports = router;
