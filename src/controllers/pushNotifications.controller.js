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
    console.log('\n[PUSH SUBSCRIBE] ========================================');
    console.log('[PUSH SUBSCRIBE] Request body:', JSON.stringify(req.body, null, 2));
    
    const { user_id, subscription } = req.body;

    if (!user_id || !subscription) {
      console.log('[PUSH SUBSCRIBE] ❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'User ID dan subscription required'
      });
    }

    console.log('[PUSH SUBSCRIBE] User ID:', user_id);
    console.log('[PUSH SUBSCRIBE] Subscription type:', typeof subscription);

    // Parse subscription if it's a string
    const parsedSubscription = typeof subscription === 'string' 
      ? JSON.parse(subscription) 
      : subscription;

    console.log('[PUSH SUBSCRIBE] Endpoint:', parsedSubscription.endpoint?.substring(0, 60) + '...');

    // Check if subscription already exists
    const existingSubscription = await prisma.push_subscriptions.findFirst({
      where: {
        user_id: BigInt(user_id),
        endpoint: parsedSubscription.endpoint
      }
    });

    if (existingSubscription) {
      console.log('[PUSH SUBSCRIBE] Existing subscription found, updating...');
      
      // Update existing subscription
      await prisma.push_subscriptions.update({
        where: { id: existingSubscription.id },
        data: {
          subscription: parsedSubscription,  // Store as JSON object, not string
          updated_at: new Date()
        }
      });

      console.log('[PUSH SUBSCRIBE] ✅ Subscription updated successfully');
      console.log('[PUSH SUBSCRIBE] ========================================\n');

      return res.json({
        success: true,
        message: 'Subscription updated'
      });
    }

    console.log('[PUSH SUBSCRIBE] Creating new subscription...');

    // Create new subscription
    const newSubscription = await prisma.push_subscriptions.create({
      data: {
        user_id: BigInt(user_id),
        endpoint: parsedSubscription.endpoint,
        subscription: parsedSubscription,  // Store as JSON object, not string
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log('[PUSH SUBSCRIBE] ✅ New subscription created with ID:', newSubscription.id.toString());
    console.log('[PUSH SUBSCRIBE] ========================================\n');

    res.json({
      success: true,
      message: 'Subscription created successfully'
    });

  } catch (error) {
    console.error('[PUSH SUBSCRIBE] ❌ Error:', error);
    console.error('[PUSH SUBSCRIBE] Error stack:', error.stack);
    console.log('[PUSH SUBSCRIBE] ========================================\n');
    
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
        user_id: BigInt(user_id)
      }
    });

    if (subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No subscriptions found for this user'
      });
    }

    const payload = JSON.stringify({
      title: title || 'DPMD Bogor',
      body: body || 'Anda memiliki notifikasi baru',
      icon: '/logo-bogor.png',
      badge: '/logo-bogor.png',
      image: '/logo-bogor.png',
      vibrate: [500, 200, 500, 200, 500, 200, 500],
      tag: 'dpmd-notification',
      requireInteraction: true,
      renotify: true,
      silent: false,
      data: data || { url: '/dashboard' },
      actions: [
        { action: 'open', title: 'BUKA DISPOSISI' },
        { action: 'mark_read', title: 'TANDAI DIBACA' }
      ]
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          // Parse subscription - handle both string and object
          const subscription = typeof sub.subscription === 'string' 
            ? JSON.parse(sub.subscription) 
            : sub.subscription;
          
          // Options untuk heads-up notification (priority tinggi)
          const options = {
            TTL: 86400, // 24 jam (lebih lama untuk retry)
            urgency: 'high', // CRITICAL: Wajib 'high' untuk heads-up di Android
            headers: {
              'Topic': 'disposisi',
              'Priority': 'high',
              'Urgency': 'high',
              'Content-Encoding': 'aes128gcm'
            }
          };
          
          await webpush.sendNotification(subscription, payload, options);
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
        user_id: { in: user_ids.map(id => BigInt(id)) }
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
      icon: '/logo-bogor.png',
      badge: '/logo-bogor.png',
      vibrate: [500, 200, 500, 200, 500],
      tag: 'disposisi-notification',
      requireInteraction: true,
      renotify: true,
      silent: false,
      data: data || { url: '/dashboard/disposisi' },
      actions: [
        { action: 'open', title: 'BUKA' },
        { action: 'close', title: 'TUTUP' }
      ]
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          // Subscription is already JSON object from Prisma
          const subscription = typeof sub.subscription === 'string' 
            ? JSON.parse(sub.subscription) 
            : sub.subscription;
          
          // Options untuk heads-up notification (priority tinggi)
          const options = {
            TTL: 86400, // 24 jam
            urgency: 'high', // CRITICAL: Wajib 'high' untuk heads-up di Android
            headers: { 
              'Topic': 'disposisi',
              'Priority': 'high',
              'Urgency': 'high',
              'Content-Encoding': 'aes128gcm'
            }
          };
          
          await webpush.sendNotification(subscription, payload, options);
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
    console.log('\n[PUSH NOTIFICATION] ========================================');
    console.log('[PUSH NOTIFICATION] Starting notification send process');
    console.log('[PUSH NOTIFICATION] Disposisi data:', {
      id: disposisi.id?.toString(),
      ke_user_id: disposisi.ke_user_id?.toString(),
      dari_user_id: disposisi.dari_user_id?.toString(),
      surat_id: disposisi.surat_id?.toString()
    });

    // Convert BigInt to number
    const ke_user_id = Number(disposisi.ke_user_id);
    const dari_user_id = Number(disposisi.dari_user_id);
    const id = Number(disposisi.id);

    console.log('[PUSH NOTIFICATION] Converted IDs:', { ke_user_id, dari_user_id, id });

    // Get recipient user
    const recipient = await prisma.users.findUnique({
      where: { id: BigInt(ke_user_id) }
    });

    // Get sender user
    const sender = await prisma.users.findUnique({
      where: { id: BigInt(dari_user_id) }
    });

    console.log('[PUSH NOTIFICATION] Recipient:', recipient?.email);
    console.log('[PUSH NOTIFICATION] Sender:', sender?.email);

    if (!recipient) {
      console.log('[PUSH NOTIFICATION] ❌ Recipient not found, aborting');
      return;
    }

    // Get surat info from disposisi or fetch from database
    let suratInfo = disposisi.surat_masuk || disposisi.surat;
    
    if (!suratInfo) {
      console.log('[PUSH NOTIFICATION] Surat info not in disposisi, fetching...');
      const disposisiDetail = await prisma.disposisi.findUnique({
        where: { id: BigInt(id) },
        include: {
          surat_masuk: true
        }
      });
      suratInfo = disposisiDetail?.surat_masuk;
    }

    console.log('[PUSH NOTIFICATION] Surat perihal:', suratInfo?.perihal);

    // Determine URL based on recipient role
    let notificationUrl = '/dashboard/disposisi';
    const recipientRole = recipient.role;
    
    if (recipientRole === 'kepala_dinas') {
      notificationUrl = `/kepala-dinas/disposisi/${id}`;
    } else if (recipientRole === 'sekretariat') {
      notificationUrl = `/sekretaris-dinas/disposisi/${id}`;
    } else if (recipientRole === 'kepala_bidang') {
      notificationUrl = `/kepala-bidang/disposisi/${id}`;
    } else if (recipientRole === 'pegawai') {
      notificationUrl = `/pegawai/disposisi/${id}`;
    } else if (recipientRole === 'desa') {
      notificationUrl = `/desa/disposisi/${id}`;
    } else {
      // Default for other roles (sarpras, superadmin, etc) - use core dashboard
      notificationUrl = `/core-dashboard/disposisi/${id}`;
    }
    
    // Format notification seperti WhatsApp
    const senderName = sender?.name || 'Admin DPMD';
    const perihal = suratInfo?.perihal || 'Disposisi Surat Baru';
    
    // Title: Nama pengirim saja (seperti WhatsApp)
    const title = senderName;
    
    // Body: Perihal surat (seperti preview pesan di WhatsApp)
    const body = perihal;
    
    const data = {
      url: notificationUrl,
      disposisi_id: id.toString(),
      type: 'new_disposisi',
      sender_name: senderName,
      perihal: perihal,
      timestamp: new Date().toISOString()
    };

    console.log('[PUSH NOTIFICATION] Notification content:', { title, body });

    // Get recipient subscriptions
    const subscriptions = await prisma.push_subscriptions.findMany({
      where: {
        user_id: BigInt(ke_user_id)
      }
    });

    console.log('[PUSH NOTIFICATION] Found', subscriptions.length, 'subscription(s) for user');

    if (subscriptions.length === 0) {
      console.log('[PUSH NOTIFICATION] ❌ No subscriptions found for user:', ke_user_id);
      return;
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/logo-bogor.png',
      badge: '/logo-bogor.png',
      image: '/logo-bogor.png',
      vibrate: [500, 200, 500, 200, 500, 200, 500],
      tag: `disposisi-${id}`,
      requireInteraction: true,
      silent: false,
      renotify: true,
      data,
      actions: [
        { action: 'open', title: 'BUKA DISPOSISI', icon: '/logo-bogor.png' },
        { action: 'mark_read', title: 'TANDAI DIBACA', icon: '/logo-bogor.png' }
      ]
    });

    console.log('[PUSH NOTIFICATION] Payload created, sending to', subscriptions.length, 'device(s)');

    // Send to all user subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          // Subscription is already JSON object from Prisma, no need to parse
          const subscription = typeof sub.subscription === 'string' 
            ? JSON.parse(sub.subscription) 
            : sub.subscription;
          
          // Options untuk heads-up notification (priority tinggi)
          const options = {
            TTL: 86400, // 24 jam untuk retry
            urgency: 'high', // CRITICAL: Wajib 'high' untuk heads-up di Android
            headers: { 
              'Topic': 'disposisi',
              'Priority': 'high',
              'Urgency': 'high',
              'Content-Encoding': 'aes128gcm'
            }
          };
            
          console.log('[PUSH NOTIFICATION] Sending to endpoint:', sub.endpoint.substring(0, 50) + '...');
          await webpush.sendNotification(subscription, payload, options);
          console.log('[PUSH NOTIFICATION] ✅ Notification sent successfully to:', sub.endpoint.substring(0, 50) + '...');
          return { success: true, endpoint: sub.endpoint };
        } catch (error) {
          console.error('[PUSH NOTIFICATION] ❌ Error sending to endpoint:', sub.endpoint.substring(0, 50) + '...');
          console.error('[PUSH NOTIFICATION] Error details:', error.message);
          // Clean up invalid subscriptions
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log('[PUSH NOTIFICATION] Removing invalid subscription');
            await prisma.push_subscriptions.delete({
              where: { id: sub.id }
            });
          }
          return { success: false, endpoint: sub.endpoint, error: error.message };
        }
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failCount = results.length - successCount;
    console.log('[PUSH NOTIFICATION] Summary: ✅', successCount, 'sent, ❌', failCount, 'failed');
    console.log('[PUSH NOTIFICATION] ========================================\n');

  } catch (error) {
    console.error('[PUSH NOTIFICATION] ❌ FATAL ERROR:', error);
    console.error('[PUSH NOTIFICATION] Stack trace:', error.stack);
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
