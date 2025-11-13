// Database Seeder Runner for Express
// Run all seeders in order

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function runSeeders() {
  let connection;
  
  try {
    console.log('🌱 Running seeders...\n');

    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'dpmd'
    });

    console.log('✅ Database connected\n');

    const seedersDir = path.join(__dirname, 'seeders');
    const files = fs.readdirSync(seedersDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    for (const file of files) {
      console.log(`📄 Running seeder: ${file}`);
      const seeder = require(path.join(seedersDir, file));
      
      if (seeder.up && typeof seeder.up === 'function') {
        await seeder.up(connection);
      } else {
        console.warn(`⚠️  Seeder ${file} has no up() function`);
      }
      console.log('');
    }

    console.log('🎉 All seeders completed!');
  } catch (error) {
    console.error('❌ Seeder error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run if called directly
if (require.main === module) {
  runSeeders();
}

module.exports = runSeeders;
