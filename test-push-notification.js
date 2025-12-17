// Test Push Notification Script
// Run: node test-push-notification.js

const prisma = require('./src/config/prisma');
const webpush = require('web-push');
require('dotenv').config();

// VAPID keys from .env
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BAXYVr3NyrC2SSx6xr8zml7qI2xtgvJ0QzWbnQqdRO66czNvkSrGcv178lfoG0LHAPy_bL92i7uAmS193_Yer6U',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'ADOSXa-QeI4oCvfMIZVMEQt7Vo-9CySkch8GNbm7u9k'
};

webpush.setVapidDetails(
  'mailto:admin@dpmdbogorkab.id',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

async function testNotification() {
  try {
    console.log('\n========================================');
    console.log('🔔 PUSH NOTIFICATION TEST SCRIPT');
    console.log('========================================\n');

    // 1. Check all subscriptions
    console.log('1️⃣ Checking push subscriptions...\n');
    const subscriptions = await prisma.push_subscriptions.findMany({
      include: {
        users: true
      }
    });

    if (subscriptions.length === 0) {
      console.log('❌ NO SUBSCRIPTIONS FOUND!');
      console.log('\nTroubleshooting:');
      console.log('1. User sudah login di frontend?');
      console.log('2. User sudah klik "Izinkan Notifikasi"?');
      console.log('3. Browser permission = "granted"?');
      console.log('4. Check browser console untuk error subscription');
      console.log('\nRun di browser console (saat sudah login):');
      console.log('  await subscribeToPushNotifications()');
      await prisma.$disconnect();
      return;
    }

    console.log(`✅ Found ${subscriptions.length} subscription(s):\n`);
    subscriptions.forEach((sub, index) => {
      console.log(`${index + 1}. User: ${sub.users.name} (${sub.users.email})`);
      console.log(`   Role: ${sub.users.role}`);
      console.log(`   User ID: ${sub.user_id}`);
      console.log(`   Endpoint: ${sub.endpoint.substring(0, 60)}...`);
      console.log(`   Created: ${sub.created_at}`);
      console.log('');
    });

    // 2. Ask user to select which subscription to test
    console.log('2️⃣ Sending TEST notification to ALL subscriptions...\n');

    const payload = JSON.stringify({
      title: '🔔 TEST - Disposisi Surat Baru',
      body: 'Ini adalah TEST notification. Jika Anda menerima ini, push notification sudah WORKS! 🎉',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [200, 100, 200, 100, 200],
      tag: 'test-notification',
      requireInteraction: true,
      data: {
        url: '/dashboard/disposisi',
        type: 'test',
        timestamp: new Date().toISOString()
      },
      actions: [
        { action: 'open', title: 'Buka' },
        { action: 'close', title: 'Tutup' }
      ]
    });

    // Send to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const subscription = JSON.parse(sub.subscription);
          console.log(`📤 Sending to: ${sub.users.name} (${sub.users.email})`);
          console.log(`   Endpoint: ${sub.endpoint.substring(0, 60)}...`);
          
          await webpush.sendNotification(subscription, payload);
          
          console.log(`   ✅ SUCCESS!\n`);
          return { success: true, user: sub.users.name };
        } catch (error) {
          console.log(`   ❌ FAILED!`);
          console.log(`   Error: ${error.message}`);
          console.log(`   Status: ${error.statusCode}\n`);
          
          // Clean up invalid subscriptions
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`   🗑️ Removing invalid subscription...\n`);
            await prisma.push_subscriptions.delete({
              where: { id: sub.id }
            });
          }
          
          return { success: false, user: sub.users.name, error: error.message };
        }
      })
    );

    // Summary
    console.log('\n========================================');
    console.log('📊 SUMMARY:');
    console.log('========================================\n');
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
    const failed = results.filter(r => r.status === 'fulfilled' && !r.value.success);
    
    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    
    if (successful.length > 0) {
      console.log('\n🎉 Notification sent successfully to:');
      successful.forEach(r => {
        console.log(`   - ${r.value.user}`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n⚠️ Failed to send to:');
      failed.forEach(r => {
        console.log(`   - ${r.value.user}: ${r.value.error}`);
      });
    }

    console.log('\n========================================');
    console.log('📱 CHECK YOUR DEVICE FOR NOTIFICATION!');
    console.log('========================================\n');

    console.log('Expected notification:');
    console.log('  Title: "🔔 TEST - Disposisi Surat Baru"');
    console.log('  Body: "Ini adalah TEST notification..."');
    console.log('  Icon: DPMD logo');
    console.log('  Sound: Yes');
    console.log('  Actions: Buka / Tutup\n');

    console.log('If you see the notification → ✅ WORKS!');
    console.log('If NOT → Check troubleshooting steps below\n');

    if (failed.length > 0) {
      console.log('TROUBLESHOOTING:');
      console.log('1. Browser notification permission denied?');
      console.log('   → Go to browser settings → Allow notifications');
      console.log('');
      console.log('2. Subscription expired (410/404 error)?');
      console.log('   → User needs to logout & login again');
      console.log('   → Re-subscribe to push notifications');
      console.log('');
      console.log('3. VAPID keys mismatch (401 error)?');
      console.log('   → Check backend .env VAPID_PUBLIC_KEY');
      console.log('   → Check frontend .env VITE_VAPID_PUBLIC_KEY');
      console.log('   → Must be EXACTLY the same!');
      console.log('');
      console.log('4. Service Worker not registered?');
      console.log('   → Check browser console: navigator.serviceWorker.controller');
      console.log('   → Reload page and check sw.js loads');
      console.log('');
    }

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testNotification();
