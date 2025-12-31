const { webpush } = require('../config/push-notification');
const PushSubscription = require('../models/pushSubscription');
const logger = require('../utils/logger');

class PushNotificationService {
  /**
   * Send push notification ke user tertentu
   */
  static async sendToUser(userId, payload) {
    try {
      const subscriptions = await PushSubscription.getSubscriptionsByUser(userId);
      
      if (subscriptions.length === 0) {
        logger.warn(`No push subscriptions found for user ${userId}`);
        return { success: false, message: 'No subscriptions found' };
      }

      const results = await Promise.allSettled(
        subscriptions.map(sub => this.sendNotification(sub, payload))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      logger.info(`Push notification sent to user ${userId}: ${successful} successful, ${failed} failed`);

      return {
        success: true,
        sent: successful,
        failed: failed,
        total: subscriptions.length
      };
    } catch (error) {
      logger.error('Error sending push to user:', error);
      throw error;
    }
  }

  /**
   * Send push notification ke multiple users
   */
  static async sendToMultipleUsers(userIds, payload) {
    try {
      console.log('📤 [PUSH] Sending to multiple users:', {
        userIds: userIds,
        payloadType: payload.data?.type,
        title: payload.title
      });

      const subscriptions = await PushSubscription.getSubscriptionsByUsers(userIds);
      
      console.log('📋 [PUSH] Found subscriptions:', {
        count: subscriptions.length,
        userIds: userIds,
        endpoints: subscriptions.map(s => s.endpoint.substring(0, 50) + '...')
      });

      if (subscriptions.length === 0) {
        logger.warn(`No push subscriptions found for users: ${userIds.join(', ')}`);
        return { success: false, message: 'No subscriptions found' };
      }

      const results = await Promise.allSettled(
        subscriptions.map(sub => this.sendNotification(sub, payload))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log('✅ [PUSH] Send results:', {
        successful,
        failed,
        total: subscriptions.length
      });

      logger.info(`Push notification sent to ${userIds.length} users: ${successful} successful, ${failed} failed`);

      return {
        success: true,
        sent: successful,
        failed: failed,
        total: subscriptions.length
      };
    } catch (error) {
      console.error('❌ [PUSH] Error sending to multiple users:', error);
      logger.error('Error sending push to multiple users:', error);
      throw error;
    }
  }

  /**
   * Send push notification ke semua users
   */
  static async sendToAll(payload) {
    try {
      const subscriptions = await PushSubscription.getAllSubscriptions();
      
      if (subscriptions.length === 0) {
        logger.warn('No push subscriptions found');
        return { success: false, message: 'No subscriptions found' };
      }

      const results = await Promise.allSettled(
        subscriptions.map(sub => this.sendNotification(sub, payload))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      logger.info(`Broadcast push notification: ${successful} successful, ${failed} failed`);

      return {
        success: true,
        sent: successful,
        failed: failed,
        total: subscriptions.length
      };
    } catch (error) {
      logger.error('Error broadcasting push notification:', error);
      throw error;
    }
  }

  /**
   * Send notification ke satu subscription
   */
  static async sendNotification(subscription, payload) {
    try {
      console.log('🚀 [PUSH] Sending to subscription:', {
        endpoint: subscription.endpoint.substring(0, 50) + '...',
        hasKeys: !!subscription.keys,
        keysP256dh: subscription.keys?.p256dh?.substring(0, 20) + '...',
        keysAuth: subscription.keys?.auth?.substring(0, 20) + '...'
      });

      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        }
      };

      const notificationPayload = JSON.stringify(payload);

      await webpush.sendNotification(pushSubscription, notificationPayload);
      
      console.log('✅ [PUSH] Notification sent successfully to:', subscription.endpoint.substring(0, 50) + '...');
      
      return { success: true };
    } catch (error) {
      console.error('❌ [PUSH] Send error:', {
        endpoint: subscription.endpoint.substring(0, 50) + '...',
        statusCode: error.statusCode,
        message: error.message
      });

      // Handle expired/invalid subscriptions
      if (error.statusCode === 404 || error.statusCode === 410) {
        logger.warn(`Subscription expired/invalid, removing: ${subscription.id}`);
        await PushSubscription.removeInvalidSubscription(subscription.id);
      }
      
      throw error;
    }
  }

  /**
   * Trigger push notification untuk disposisi baru
   * WhatsApp-style: Pop-up di layar HP bahkan saat locked/minimize
   */
  static async notifyNewDisposisi(disposisiData, targetUserIds) {
    const payload = {
      title: '📨 Disposisi Baru - DPMD',
      body: `${disposisiData.dari_user}: ${disposisiData.perihal || 'Disposisi baru telah diterima'}`,
      icon: '/logo-192.png',
      badge: '/logo-96.png',
      vibrate: [300, 100, 300, 100, 300, 100, 300], // WhatsApp vibration pattern
      tag: `disposisi-${disposisiData.id}`,
      requireInteraction: true, // Stay on screen until clicked
      renotify: true, // Alert even if previous notification exists
      silent: false, // MUST make sound
      urgency: 'high', // High priority for Android
      timestamp: Date.now(),
      data: {
        type: 'new_disposisi',
        disposisi_id: disposisiData.id,
        url: '/disposisi',
        timestamp: Date.now(),
        perihal: disposisiData.perihal,
        dari_user: disposisiData.dari_user,
        nomor_surat: disposisiData.nomor_surat
      },
      actions: [
        { action: 'open', title: '📖 Buka Disposisi', icon: '/logo-96.png' },
        { action: 'later', title: '⏰ Nanti', icon: '/logo-96.png' }
      ]
    };

    return await this.sendToMultipleUsers(targetUserIds, payload);
  }

  /**
   * Trigger push notification untuk update disposisi
   */
  static async notifyDisposisiUpdate(disposisiData, targetUserIds) {
    const payload = {
      title: '🔔 Update Disposisi',
      body: `Disposisi "${disposisiData.perihal}" telah diupdate`,
      icon: '/logo-192.png',
      badge: '/logo-96.png',
      tag: `disposisi-update-${disposisiData.id}`,
      data: {
        type: 'disposisi_update',
        disposisi_id: disposisiData.id,
        url: '/disposisi',
        timestamp: Date.now()
      },
      vibrate: [100, 50, 100]
    };

    return await this.sendToMultipleUsers(targetUserIds, payload);
  }

  /**
   * Trigger push notification untuk berita baru
   */
  static async notifyNewBerita(beritaData) {
    const payload = {
      title: '📰 Berita Baru',
      body: beritaData.judul,
      icon: '/logo-192.png',
      badge: '/logo-96.png',
      image: beritaData.gambar || undefined,
      tag: `berita-${beritaData.id}`,
      data: {
        type: 'new_berita',
        berita_id: beritaData.id,
        url: `/berita/${beritaData.slug}`,
        timestamp: Date.now()
      }
    };

    return await this.sendToAll(payload);
  }

  /**
   * Trigger push notification untuk kegiatan/perjadin baru
   */
  static async notifyNewKegiatan(kegiatanData, targetUserIds) {
    const payload = {
      title: '📅 Kegiatan Baru',
      body: kegiatanData.nama_kegiatan,
      icon: '/logo-192.png',
      badge: '/logo-96.png',
      tag: `kegiatan-${kegiatanData.id}`,
      data: {
        type: 'new_kegiatan',
        kegiatan_id: kegiatanData.id,
        url: '/perjadin',
        timestamp: Date.now()
      }
    };

    return await this.sendToMultipleUsers(targetUserIds, payload);
  }

  /**
   * Alias method untuk backward compatibility
   * @deprecated Use sendToUser instead
   */
  static async sendNotificationToUser(userId, payload) {
    return await this.sendToUser(userId, payload);
  }

  /**
   * Send test notification ke user
   */
  static async sendTestNotification(userId) {
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

    return await this.sendToUser(userId, payload);
  }
}

module.exports = PushNotificationService;
