require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkDatabases() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'dpmd123'
  });

  console.log('\n📊 Checking available databases...\n');
  
  const [databases] = await connection.execute('SHOW DATABASES');
  
  console.log('All databases:');
  databases.forEach(db => {
    console.log(`  - ${db.Database}`);
  });

  console.log('\n📂 Databases containing "dpmd":');
  const dpmdDatabases = databases.filter(db => 
    db.Database.toLowerCase().includes('dpmd')
  );
  
  if (dpmdDatabases.length === 0) {
    console.log('  ❌ No database found with "dpmd" in name');
  } else {
    dpmdDatabases.forEach(db => {
      console.log(`  ✅ ${db.Database}`);
    });
  }

  console.log('\n🔧 Current configuration (.env):');
  console.log(`  DB_NAME: ${process.env.DB_NAME}`);
  console.log(`  DATABASE_URL: ${process.env.DATABASE_URL}`);

  // Check dpmd databases that exist
  console.log('\n📋 Checking activity logs table:\n');
  
  // Get only dpmd databases that actually exist
  const existingDpmdDbs = dpmdDatabases.map(db => db.Database);
  
  for (const dbName of existingDpmdDbs) {
    try {
      await connection.query(`USE \`${dbName}\``);
      const [tables] = await connection.query("SHOW TABLES");
      
      const tableNames = tables.map(t => Object.values(t)[0]);
      const hasActivityLogs = tableNames.includes('kelembagaan_activity_logs');
      
      console.log(`Database: ${dbName}`);
      if (hasActivityLogs) {
        console.log(`  ✅ Table 'kelembagaan_activity_logs' EXISTS`);
        
        // Count records
        const [count] = await connection.query(
          'SELECT COUNT(*) as total FROM kelembagaan_activity_logs'
        );
        console.log(`  📊 Total records: ${count[0].total}`);
        
        // Sample records
        const [sample] = await connection.query(
          'SELECT kelembagaan_type, activity_type, created_at FROM kelembagaan_activity_logs ORDER BY created_at DESC LIMIT 3'
        );
        if (sample.length > 0) {
          console.log('  📄 Latest activities:');
          sample.forEach(s => {
            console.log(`     - ${s.kelembagaan_type}: ${s.activity_type} (${s.created_at})`);
          });
        }
      } else {
        console.log(`  ❌ Table 'kelembagaan_activity_logs' NOT FOUND`);
      }
      console.log('');
    } catch (error) {
      console.log(`  ❌ Error checking database ${dbName}: ${error.message}\n`);
    }
  }
  
  console.log('🎯 Currently using database: ' + process.env.DB_NAME);

  await connection.end();
}

checkDatabases().catch(console.error);
