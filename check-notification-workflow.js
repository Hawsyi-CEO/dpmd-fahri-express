// Check Push Notification Workflow
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function checkNotificationWorkflow() {
  let connection;
  
  try {
    console.log('🔍 Checking Push Notification Workflow...\n');
    
    // 1. Check database connection
    console.log('1️⃣  Checking database connection...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'dpmd'
    });
    console.log('✅ Database connected\n');
    
    // 2. Check if push_subscriptions table exists
    console.log('2️⃣  Checking push_subscriptions table...');
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'push_subscriptions'"
    );
    
    if (tables.length === 0) {
      console.log('❌ Table push_subscriptions NOT FOUND');
      console.log('📝 Run migration: dpmd-express-backend/migrations/create-push-subscriptions-table.sql');
      console.log('\n--- Migration SQL ---');
      const migrationPath = path.join(__dirname, 'migrations', 'create-push-subscriptions-table.sql');
      if (fs.existsSync(migrationPath)) {
        console.log(fs.readFileSync(migrationPath, 'utf-8'));
      }
    } else {
      console.log('✅ Table push_subscriptions exists');
      
      // Check table structure
      const [columns] = await connection.query(
        "DESCRIBE push_subscriptions"
      );
      console.log('   Columns:', columns.map(c => c.Field).join(', '));
      
      // Check subscription count
      const [count] = await connection.query(
        "SELECT COUNT(*) as total FROM push_subscriptions"
      );
      console.log(`   Total subscriptions: ${count[0].total}`);
      
      if (count[0].total > 0) {
        const [subs] = await connection.query(
          `SELECT ps.id, ps.user_id, u.name, u.email, u.role, 
           DATE_FORMAT(ps.created_at, '%Y-%m-%d %H:%i') as subscribed_at
           FROM push_subscriptions ps
           JOIN users u ON ps.user_id = u.id
           ORDER BY ps.created_at DESC
           LIMIT 5`
        );
        console.log('\n   Recent subscriptions:');
        subs.forEach(s => {
          console.log(`   - ${s.name} (${s.email}) [${s.role}] at ${s.subscribed_at}`);
        });
      }
    }
    console.log();
    
    // 3. Check VAPID keys in .env
    console.log('3️⃣  Checking VAPID configuration...');
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const hasVapidPublic = envContent.includes('VAPID_PUBLIC_KEY');
      const hasVapidPrivate = envContent.includes('VAPID_PRIVATE_KEY');
      
      if (hasVapidPublic && hasVapidPrivate) {
        console.log('✅ VAPID keys configured in .env');
      } else {
        console.log('⚠️  VAPID keys missing in .env');
        console.log('   Run: npx web-push generate-vapid-keys');
        console.log('   Add to .env:');
        console.log('   VAPID_PUBLIC_KEY=your_public_key');
        console.log('   VAPID_PRIVATE_KEY=your_private_key');
      }
    } else {
      console.log('❌ .env file not found');
    }
    console.log();
    
    // 4. Check required files
    console.log('4️⃣  Checking required files...');
    const requiredFiles = [
      { path: 'src/controllers/pushNotifications.controller.js', name: 'Push Controller' },
      { path: 'src/routes/pushNotifications.routes.js', name: 'Push Routes' },
      { path: '../dpmd-frontend/src/utils/pushNotifications.js', name: 'Frontend Utils' },
      { path: '../dpmd-frontend/src/components/NotificationSettings.jsx', name: 'Settings Component' },
      { path: '../dpmd-frontend/public/sw.js', name: 'Service Worker' },
      { path: '../dpmd-frontend/public/manifest.json', name: 'PWA Manifest' }
    ];
    
    let allFilesExist = true;
    for (const file of requiredFiles) {
      const fullPath = path.join(__dirname, file.path);
      const exists = fs.existsSync(fullPath);
      console.log(`   ${exists ? '✅' : '❌'} ${file.name}`);
      if (!exists) allFilesExist = false;
    }
    console.log();
    
    // 5. Check disposisi integration
    console.log('5️⃣  Checking disposisi integration...');
    const disposisiControllerPath = path.join(__dirname, 'src/controllers/disposisi.controller.js');
    if (fs.existsSync(disposisiControllerPath)) {
      const content = fs.readFileSync(disposisiControllerPath, 'utf-8');
      const hasImport = content.includes('sendDisposisiNotification');
      const hasCalling = content.includes('await sendDisposisiNotification');
      
      if (hasImport && hasCalling) {
        console.log('✅ Disposisi controller integrated with notifications');
      } else {
        console.log('⚠️  Disposisi controller missing notification integration');
        if (!hasImport) console.log('   Missing: import sendDisposisiNotification');
        if (!hasCalling) console.log('   Missing: call to sendDisposisiNotification');
      }
    } else {
      console.log('❌ Disposisi controller not found');
    }
    console.log();
    
    // 6. Check server routes registration
    console.log('6️⃣  Checking server routes...');
    const serverPath = path.join(__dirname, 'src/server.js');
    if (fs.existsSync(serverPath)) {
      const content = fs.readFileSync(serverPath, 'utf-8');
      const hasRoute = content.includes('/api/push-notifications');
      
      if (hasRoute) {
        console.log('✅ Push notification routes registered in server.js');
      } else {
        console.log('❌ Push notification routes NOT registered');
        console.log("   Add: app.use('/api/push-notifications', require('./routes/pushNotifications.routes'));");
      }
    }
    console.log();
    
    // 7. Summary
    console.log('📊 Workflow Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const issues = [];
    if (tables.length === 0) issues.push('push_subscriptions table not created');
    if (!allFilesExist) issues.push('Some required files missing');
    
    if (issues.length === 0) {
      console.log('✅ All checks passed!');
      console.log('\n🚀 Notification workflow ready to use');
      console.log('\n📝 Next steps:');
      console.log('   1. Start backend: npm run dev');
      console.log('   2. Start frontend: npm run dev');
      console.log('   3. Login and go to Settings → Notifications');
      console.log('   4. Click "Aktifkan Notifikasi"');
      console.log('   5. Create a disposisi to test notification');
    } else {
      console.log('⚠️  Issues found:');
      issues.forEach(issue => console.log(`   - ${issue}`));
      console.log('\nPlease fix the issues above before testing notifications.');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Database credentials incorrect. Check .env file:');
      console.log('   DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkNotificationWorkflow();
