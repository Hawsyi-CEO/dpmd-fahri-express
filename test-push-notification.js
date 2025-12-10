// Test Push Notification Manually
const axios = require('axios');

const API_BASE = 'http://127.0.0.1:3001/api';

async function testPushNotification() {
  try {
    console.log('🧪 Testing Push Notification System\n');
    
    // 1. Login sebagai user
    console.log('1️⃣  Login as test user...');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@example.com', // Ganti dengan email test
      password: 'password123'      // Ganti dengan password test
    });
    
    const token = loginRes.data.data.token;
    const user = loginRes.data.data.user;
    console.log(`✅ Logged in as: ${user.name} (ID: ${user.id})`);
    
    // 2. Check subscriptions
    console.log('\n2️⃣  Checking push subscriptions...');
    const subsRes = await axios.get(`${API_BASE}/push-notifications/subscriptions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`   Found ${subsRes.data.data.length} subscription(s)`);
    
    if (subsRes.data.data.length === 0) {
      console.log('⚠️  No subscriptions found! User needs to enable notifications in browser.');
      console.log('\n💡 Steps to enable:');
      console.log('   1. Login to frontend app');
      console.log('   2. Click "Izinkan Notifikasi" button');
      console.log('   3. Allow browser permission dialog');
      console.log('   4. Run this test again\n');
      return;
    }
    
    // 3. Send test notification
    console.log('\n3️⃣  Sending test notification...');
    const notifRes = await axios.post(
      `${API_BASE}/push-notifications/send`,
      {
        user_id: user.id,
        title: '🧪 Test Notification',
        body: 'Ini adalah test notifikasi dari backend. Jika Anda melihat ini, push notification bekerja! 🎉',
        data: {
          url: '/dashboard',
          type: 'test',
          timestamp: new Date().toISOString()
        }
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('✅ Notification sent successfully!');
    console.log(`   Status: ${notifRes.data.success ? 'Success' : 'Failed'}`);
    console.log(`   Message: ${notifRes.data.message}`);
    
    console.log('\n📱 Check your browser/device for the notification!');
    console.log('   The notification should appear even if browser is in background.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Login credentials incorrect. Update email/password in this script.');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Backend server not running. Start with: npm run dev');
    }
  }
}

// Run test
testPushNotification();
