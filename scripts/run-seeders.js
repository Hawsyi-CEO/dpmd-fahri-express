/**
 * Seeder Runner for Express Backend
 * Run all seeders in order
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dpmd',
  multipleStatements: true
};

async function runSeeders() {
  console.log('🌱 Running seeders...\n');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const seedersDir = path.join(__dirname, '..', 'database-express', 'seeders');
    
    if (!fs.existsSync(seedersDir)) {
      console.log('⚠️  No seeders directory found');
      return;
    }
    
    const files = fs.readdirSync(seedersDir)
      .filter(f => f.endsWith('.js'))
      .sort();
    
    console.log(`Found ${files.length} seeder files\n`);
    
    for (const file of files) {
      console.log(`📝 Running: ${file}`);
      
      const seeder = require(path.join(seedersDir, file));
      
      if (typeof seeder.up === 'function') {
        await seeder.up(connection);
      } else {
        console.log(`  ⚠️  No 'up' function found in ${file}`);
      }
      
      console.log(`  ✅ Done\n`);
    }
    
    console.log('✨ All seeders completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeder failed:', error.message);
    console.error(error);
    throw error;
  } finally {
    await connection.end();
  }
}

runSeeders()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
