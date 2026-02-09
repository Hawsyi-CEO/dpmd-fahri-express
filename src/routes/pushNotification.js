const express = require('express');
const router = express.Router();
const { vapidKeys } = require('../config/push-notification');
const PushSubscription = require('../models/pushSubscription');
const PushNotificationService = require('../services/pushNotification.service');
const { auth } = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
 * Send push notification
 * Accessible by: superadmin and pegawai with Sekretariat bidang
 */
router.post('/send', auth, async (req, res) => {
  try {
    console.log('\n📨 [Push] Send notification request');
    console.log('   User:', req.user.name, '- Role:', req.user.role, '- Bidang:', req.user.bidang_id);
    console.log('   Request body:', JSON.stringify(req.body, null, 2));
    
    // Check if user has permission
    // Only superadmin and pegawai with Sekretariat bidang (bidang_id = 2) can send notifications
    const SEKRETARIAT_BIDANG_ID = 2;
    const isSuperadmin = req.user.role === 'superadmin';
    const isSekretariatPegawai = req.user.bidang_id === SEKRETARIAT_BIDANG_ID;
    
    if (!isSuperadmin && !isSekretariatPegawai) {
      console.log('   ❌ Permission denied');
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Hanya Superadmin dan Pegawai Sekretariat yang dapat mengirim notifikasi'
      });
    }
    
    console.log('   ✅ Permission granted');

    const { userId, userIds, broadcast, roles, title, body, data, payload } = req.body;

    let result;
    
    if (roles && Array.isArray(roles) && roles.length > 0) {
      // Send to specific roles using title, body, data
      const notification = {
        title: title || payload?.title,
        body: body || payload?.body,
        icon: payload?.icon || '/logo-192.png',
        badge: payload?.badge || '/logo-96.png',
        data: data || payload?.data || {},
        actions: payload?.actions || []
      };
      
      console.log('   📝 Notification object:', JSON.stringify(notification, null, 2));
      
      // Extract path from URL if present (e.g., '/pegawai/jadwal-kegiatan' -> 'jadwal-kegiatan')
      // This makes the URL role-aware
      if (notification.data && notification.data.url && !notification.path) {
        console.log('   🔗 Processing URL:', notification.data.url);
        const urlPath = notification.data.url.replace(/^\/[^/]+\//, ''); // Remove role prefix
        if (urlPath !== notification.data.url) {
          // URL had a role prefix, use the path for role-aware routing
          notification.path = urlPath;
          delete notification.data.url; // Remove fixed URL, will be generated per-role
          console.log('   ✅ Converted to path:', notification.path);
        }
        // If URL doesn't have role prefix (like '/jadwal-kegiatan'), treat it as a path
        else if (notification.data.url.startsWith('/') && !notification.data.url.includes('//')) {
          notification.path = notification.data.url.replace(/^\//, ''); // Remove leading slash
          delete notification.data.url;
          console.log('   ✅ Converted simple URL to path:', notification.path);
        }
      }
      
      console.log('   📤 Sending to roles:', roles.join(', '));
      result = await PushNotificationService.sendToRoles(roles, notification);
      console.log('   ✅ Send result:', result);
    } else if (broadcast) {
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
        message: 'roles, userId, userIds, or broadcast flag is required'
      });
    }

    console.log('   ✅ Notification sent successfully to', result.sentTo || 0, 'users');

    res.json({
      success: true,
      message: 'Push notification sent',
      sentTo: result.sentTo || 0,
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
    
    let notifications = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    try {
      // For superadmin: get recent activity logs from all bidang
      if (userRole === 'superadmin') {
        const activityLogs = await prisma.activity_logs.findMany({
          where: {
            created_at: { gte: sevenDaysAgo }
          },
          include: {
            users: { select: { name: true } },
            bidangs: { select: { nama: true } }
          },
          orderBy: { created_at: 'desc' },
          take: parseInt(limit)
        });
        
        notifications = activityLogs.map(log => ({
          id: log.id,
          title: `${log.action_type || 'Activity'} - ${log.bidangs?.nama || 'System'}`,
          message: log.description || `${log.users?.name} melakukan aktivitas`,
          time: formatTimeAgo(log.created_at),
          read: false,
          type: log.action_type || 'activity',
          timestamp: log.created_at
        }));
      } 
      // For bidang users: get activity logs from their bidang
      else if (['kepala_bidang', 'ketua_tim', 'pegawai'].includes(userRole)) {
        const user = await prisma.users.findUnique({
          where: { id: parseInt(userId) },
          select: { bidang_id: true }
        });
        
        if (user?.bidang_id) {
          const activityLogs = await prisma.activity_logs.findMany({
            where: {
              bidang_id: user.bidang_id,
              created_at: { gte: sevenDaysAgo }
            },
            include: {
              users: { select: { name: true } }
            },
            orderBy: { created_at: 'desc' },
            take: parseInt(limit)
          });
          
          notifications = activityLogs.map(log => ({
            id: log.id,
            title: log.action_type || 'Activity',
            message: log.description || `${log.users?.name} melakukan aktivitas`,
            time: formatTimeAgo(log.created_at),
            read: false,
            type: log.action_type || 'activity',
            timestamp: log.created_at
          }));
        }
      }
      // For kepala_dinas and sekretaris_dinas: get from disposisi
      else if (['kepala_dinas', 'sekretaris_dinas'].includes(userRole)) {
        const disposisi = await prisma.surat_masuk.findMany({
          where: {
            created_at: { gte: sevenDaysAgo }
          },
          orderBy: { created_at: 'desc' },
          take: Math.floor(parseInt(limit) / 2)
        });
        
        notifications = disposisi.map(d => ({
          id: `disposisi-${d.id}`,
          title: 'Disposisi Baru',
          message: `${d.nomor_surat || ''} - ${d.perihal || ''}`,
          time: formatTimeAgo(d.created_at),
          read: false,
          type: 'disposisi',
          timestamp: d.created_at
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
