// Test subscribe endpoint manually
const prisma = require('./src/config/prisma');

async function testSubscribe() {
  try {
    console.log('🧪 Testing subscribe endpoint...\n');

    // Test data
    const testSubscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint-' + Date.now(),
      keys: {
        p256dh: 'test-p256dh-key',
        auth: 'test-auth-key'
      }
    };

    const userId = 439; // Kepala Dinas

    console.log('1. Checking if user exists...');
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log(`✅ User found: ${user.name} (${user.email})`);

    console.log('\n2. Checking existing subscriptions...');
    const existing = await prisma.push_subscriptions.findFirst({
      where: {
        user_id: userId,
        endpoint: testSubscription.endpoint
      }
    });

    if (existing) {
      console.log('ℹ️  Subscription already exists, will update');
    } else {
      console.log('✅ No existing subscription, will create new');
    }

    console.log('\n3. Creating/updating subscription...');
    const result = existing
      ? await prisma.push_subscriptions.update({
          where: { id: existing.id },
          data: {
            subscription: JSON.stringify(testSubscription),
            updated_at: new Date()
          }
        })
      : await prisma.push_subscriptions.create({
          data: {
            user_id: userId,
            endpoint: testSubscription.endpoint,
            subscription: JSON.stringify(testSubscription),
            created_at: new Date(),
            updated_at: new Date()
          }
        });

    console.log('✅ Subscription saved successfully!');
    console.log('   ID:', result.id);
    console.log('   User ID:', result.user_id);
    console.log('   Endpoint:', result.endpoint.substring(0, 50) + '...');

    console.log('\n4. Verifying in database...');
    const count = await prisma.push_subscriptions.count({
      where: { user_id: userId }
    });

    console.log(`✅ User has ${count} subscription(s) in database`);

    console.log('\n🎉 Test completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Upload new frontend dist/ to Hostinger');
    console.log('   2. Clear browser cache on mobile');
    console.log('   3. Login again to trigger real subscription');
    console.log('   4. Send surat from Sekretariat to Kepala Dinas');
    console.log('   5. DING! 🔔 Notification should appear\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

testSubscribe();
