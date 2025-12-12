const prisma = require('../config/prisma');
const webpush = require('web-push');

// VAPID keys (generate with: npx web-push generate-vapid-keys)
// Store these in .env file
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BNxVXS4vaBi0sfwgQhqLN87pRF_9vn6mHOvrzs3LnktYkh84LOqrZbbgeXZ2PoKJ6MFnVDcpXD5fA3XAcPAU52o',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'eCleqcj2GhhQK1PtiSUElAQqh9EpmIGhoAZeunFVMFE'
};

// Configure web-push
webpush.setVapidDetails(
  'mailto:admin@dpmdbogorkab.id',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Subscribe user to push notifications
const subscribe = async (req, res) => {
  try {
    const { user_id, subscription } = req.body;

    if (!user_id || !subscription) {
      return res.status(400).json({
        success: false,
        message: 'User ID dan subscription required'
      });
    }

    // Parse subscription if it's a string
    const parsedSubscription = typeof subscription === 'string' 
      ? JSON.parse(subscription) 
      : subscription;

    // Check if subscription already exists
    const existingSubscription = await prisma.push_subscriptions.findFirst({
      where: {
        user_id: parseInt(user_id),
        endpoint: parsedSubscription.endpoint
      }
    });

    if (existingSubscription) {
      // Update existing subscription
      await prisma.push_subscriptions.update({
        where: { id: existingSubscription.id },
        data: {
          subscription: JSON.stringify(parsedSubscription),
          updated_at: new Date()
        }
      });

      return res.json({
        success: true,
        message: 'Subscription updated'
      });
    }

    // Create new subscription
    await prisma.push_subscriptions.create({
      data: {
        user_id: parseInt(user_id),
        endpoint: parsedSubscription.endpoint,
        subscription: JSON.stringify(parsedSubscription),
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Subscription created successfully'
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Error subscribing to push notifications',
      error: error.message
    });
  }
};

// Unsubscribe user from push notifications
const unsubscribe = async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!subscription) {
      return res.status(400).json({
        success: false,
        message: 'Subscription required'
      });
    }

    const parsedSubscription = typeof subscription === 'string' 
      ? JSON.parse(subscription) 
      : subscription;

    // Delete subscription
    await prisma.push_subscriptions.deleteMany({
      where: {
        endpoint: parsedSubscription.endpoint
      }
    });

    res.json({
      success: true,
      message: 'Unsubscribed successfully'
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unsubscribing from push notifications',
      error: error.message
    });
  }
};

// Send push notification to specific user
const sendToUser = async (req, res) => {
  try {
    const { user_id, title, body, data } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID required'
      });
    }

    // Get user subscriptions
    const subscriptions = await prisma.push_subscriptions.findMany({
      where: {
        user_id: parseInt(user_id)
      }
    });

    if (subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No subscriptions found for this user'
      });
    }

    const payload = JSON.stringify({
      title: title || 'DPMD - Notifikasi Baru',
      body: body || 'Anda memiliki notifikasi baru',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [200, 100, 200],
      tag: 'disposisi-notification',
      requireInteraction: true,
      data: data || { url: '/dashboard/disposisi' },
      actions: [
        { action: 'open', title: 'Buka', icon: '/icon-192x192.png' },
        { action: 'close', title: 'Tutup', icon: '/icon-192x192.png' }
      ]
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const subscription = JSON.parse(sub.subscription);
          await webpush.sendNotification(subscription, payload);
          return { success: true, endpoint: sub.endpoint };
        } catch (error) {
          // If subscription is invalid, delete it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.push_subscriptions.delete({
              where: { id: sub.id }
            });
          }
          return { success: false, endpoint: sub.endpoint, error: error.message };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    res.json({
      success: true,
      message: `Notifications sent: ${successful} successful, ${failed} failed`,
      results: results.map(r => r.value || r.reason)
    });

  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending push notification',
      error: error.message
    });
  }
};

// Send push notification to multiple users
const sendToMultipleUsers = async (req, res) => {
  try {
    const { user_ids, title, body, data } = req.body;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array required'
      });
    }

    // Get all subscriptions for these users
    const subscriptions = await prisma.push_subscriptions.findMany({
      where: {
        user_id: { in: user_ids.map(id => parseInt(id)) }
      }
    });

    if (subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No subscriptions found for these users'
      });
    }

    const payload = JSON.stringify({
      title: title || 'DPMD - Notifikasi Baru',
      body: body || 'Anda memiliki notifikasi baru',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [200, 100, 200],
      tag: 'disposisi-notification',
      requireInteraction: true,
      data: data || { url: '/dashboard/disposisi' },
      actions: [
        { action: 'open', title: 'Buka' },
        { action: 'close', title: 'Tutup' }
      ]
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const subscription = JSON.parse(sub.subscription);
          await webpush.sendNotification(subscription, payload);
          return { success: true, user_id: sub.user_id };
        } catch (error) {
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.push_subscriptions.delete({
              where: { id: sub.id }
            });
          }
          return { success: false, user_id: sub.user_id, error: error.message };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;

    res.json({
      success: true,
      message: `Notifications sent to ${successful} users`,
      total_subscriptions: subscriptions.length,
      successful,
      failed: subscriptions.length - successful
    });

  } catch (error) {
    console.error('Send multiple notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending push notifications',
      error: error.message
    });
  }
};

// Get user subscriptions
const getUserSubscriptions = async (req, res) => {
  try {
    const user_id = req.user.id;

    const subscriptions = await prisma.push_subscriptions.findMany({
      where: {
        user_id: parseInt(user_id)
      },
      select: {
        id: true,
        endpoint: true,
        created_at: true,
        updated_at: true
      }
    });

    res.json({
      success: true,
      data: subscriptions
    });

  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting subscriptions',
      error: error.message
    });
  }
};

// Helper function to send notification when disposisi is created
const sendDisposisiNotification = async (disposisi) => {
  try {
    const { ke_user_id, dari_user_id, id } = disposisi;

    // Get recipient user
    const recipient = await prisma.users.findUnique({
      where: { id: parseInt(ke_user_id) }
    });

    // Get sender user
    const sender = await prisma.users.findUnique({
      where: { id: parseInt(dari_user_id) }
    });

    if (!recipient) return;

    // Get surat info from disposisi or fetch from database
    let suratInfo = disposisi.surat;
    
    if (!suratInfo) {
      const disposisiDetail = await prisma.disposisi.findUnique({
        where: { id: parseInt(id) },
        include: {
          surat: true
        }
      });
      suratInfo = disposisiDetail?.surat;
    }

    const title = '🔔 Disposisi Surat Baru';
    const body = `${sender?.name || 'Admin'} mengirim disposisi: ${suratInfo?.perihal || 'Surat baru'}`;
    const data = {
      url: `/dashboard/disposisi/${id}`,
      disposisi_id: id.toString(),
      type: 'new_disposisi',
      timestamp: new Date().toISOString()
    };

    // Get recipient subscriptions
    const subscriptions = await prisma.push_subscriptions.findMany({
      where: {
        user_id: parseInt(ke_user_id)
      }
    });

    if (subscriptions.length === 0) {
      console.log('No subscriptions found for user:', ke_user_id);
      return;
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [200, 100, 200, 100, 200],
      tag: `disposisi-${id}`,
      requireInteraction: true,
      data,
      actions: [
        { action: 'open', title: 'Buka', icon: '/icon-192x192.png' },
        { action: 'close', title: 'Tutup', icon: '/icon-192x192.png' }
      ]
    });

    // Send to all user subscriptions
    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const subscription = JSON.parse(sub.subscription);
          await webpush.sendNotification(subscription, payload);
          console.log('Notification sent to:', sub.endpoint);
        } catch (error) {
          console.error('Error sending notification:', error);
          // Clean up invalid subscriptions
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.push_subscriptions.delete({
              where: { id: sub.id }
            });
          }
        }
      })
    );

  } catch (error) {
    console.error('Error sending disposisi notification:', error);
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  sendToUser,
  sendToMultipleUsers,
  getUserSubscriptions,
  sendDisposisiNotification
};
