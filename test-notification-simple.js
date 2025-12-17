// Simple Push Notification Test
require('dotenv').config();
const mysql = require('mysql2/promise');
const webpush = require('web-push');

// VAPID setup
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

webpush.setVapidDetails(
  'mailto:admin@dpmdbogorkab.id',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

async function test() {
  let connection;
  
  try {
    console.log('\n🔔 PUSH NOTIFICATION DEBUG\n');
    console.log('========================================');
    
    // Connect to MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'dpmd'
    });
    
    console.log('✅ Connected to MySQL\n');
    
    // Get all subscriptions
    const [subscriptions] = await connection.execute(`
      SELECT 
        ps.id,
        ps.user_id,
        ps.endpoint,
        ps.subscription,
        ps.created_at,
        u.name,
        u.email,
        u.role
      FROM push_subscriptions ps
      JOIN users u ON ps.user_id = u.id
      ORDER BY ps.created_at DESC
    `);
    
    console.log(`Found ${subscriptions.length} subscription(s):\n`);
    
    if (subscriptions.length === 0) {
      console.log('❌ NO SUBSCRIPTIONS!');
      console.log('\nUser belum subscribe. Lakukan ini:');
      console.log('1. Login di frontend (http://localhost:5173)');
      console.log('2. Klik "Izinkan Notifikasi"');
      console.log('3. Allow notification permission');
      console.log('4. Check console log: "✅ Push notification subscription successful"');
      console.log('5. Run script ini lagi\n');
      return;
    }
    
    // Show all subscriptions
    subscriptions.forEach((sub, i) => {
      console.log(`${i + 1}. ${sub.name} (${sub.email})`);
      console.log(`   Role: ${sub.role}`);
      console.log(`   User ID: ${sub.user_id}`);
      console.log(`   Created: ${sub.created_at}`);
      console.log(`   Endpoint: ${sub.endpoint.substring(0, 60)}...`);
      console.log('');
    });
    
    console.log('========================================');
    console.log('📤 SENDING TEST NOTIFICATIONS...\n');
    
    // Send test notification to each
    for (const sub of subscriptions) {
      try {
        const subscription = JSON.parse(sub.subscription);
        
        const payload = JSON.stringify({
          title: '🔔 TEST - Push Notification',
          body: `Test untuk ${sub.name}. Jika muncul, notifikasi WORKS! 🎉`,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          vibrate: [200, 100, 200],
          tag: 'test-notification',
          requireInteraction: true,
          data: {
            url: '/dashboard',
            type: 'test',
            timestamp: new Date().toISOString()
          }
        });
        
        console.log(`Sending to: ${sub.name} (${sub.email})...`);
        await webpush.sendNotification(subscription, payload);
        console.log('✅ SUCCESS!\n');
        
      } catch (error) {
        console.log('❌ FAILED!');
        console.log(`Error: ${error.message}`);
        console.log(`Status Code: ${error.statusCode || 'N/A'}\n`);
        
        // Remove invalid subscriptions
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log('Removing invalid subscription...\n');
          await connection.execute('DELETE FROM push_subscriptions WHERE id = ?', [sub.id]);
        }
      }
    }
    
    console.log('========================================');
    console.log('✅ DONE! Check your device for notifications!\n');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error);
  } finally {
    if (connection) await connection.end();
  }
}

test();
