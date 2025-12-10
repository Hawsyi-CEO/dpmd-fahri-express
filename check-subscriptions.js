// Check push notification subscriptions in database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSubscriptions() {
  try {
    console.log('🔍 Checking push notification subscriptions...\n');

    // Get all subscriptions
    const subscriptions = await prisma.push_subscriptions.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (subscriptions.length === 0) {
      console.log('❌ No subscriptions found in database!');
      console.log('\nUsers need to:');
      console.log('1. Open the app on their mobile device');
      console.log('2. Allow notification permission when prompted');
      console.log('3. Login successfully (auto-subscribe will trigger)');
      return;
    }

    console.log(`✅ Found ${subscriptions.length} subscription(s):\n`);

    subscriptions.forEach((sub, index) => {
      console.log(`${index + 1}. User: ${sub.users.name} (${sub.users.email})`);
      console.log(`   Role: ${sub.users.role}`);
      console.log(`   User ID: ${sub.users.id}`);
      console.log(`   Endpoint: ${sub.endpoint.substring(0, 50)}...`);
      console.log(`   Created: ${sub.created_at}`);
      console.log(`   Updated: ${sub.updated_at}\n`);
    });

    // Check Kepala Dinas subscriptions specifically
    const kepalaDinasSubscriptions = subscriptions.filter(
      sub => sub.users.role === 'kepala_dinas'
    );

    if (kepalaDinasSubscriptions.length === 0) {
      console.log('⚠️  WARNING: No Kepala Dinas subscriptions found!');
      console.log('Kepala Dinas needs to open the app and allow notifications.\n');
    } else {
      console.log(`✅ Kepala Dinas has ${kepalaDinasSubscriptions.length} active subscription(s)\n`);
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error checking subscriptions:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkSubscriptions();
