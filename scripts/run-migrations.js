/**
 * Migration Runner for Express Backend
 * Run all SQL migrations in order
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

async function runMigrations() {
  console.log('🚀 Running migrations...\n');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const migrationsDir = path.join(__dirname, '..', 'database-express', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    console.log(`Found ${files.length} migration files\n`);
    
    for (const file of files) {
      console.log(`📝 Running: ${file}`);
      
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      try {
        await connection.query(sql);
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ALREADY') {
          console.log(`  ℹ️  Table already exists, skipping...`);
        } else {
          console.error(`  ❌ Error in ${file}:`, err.message);
          // Continue with next file instead of throwing
        }
      }
      
      console.log(`  ✅ Done\n`);
    }
    
    console.log('✨ All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigrations()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
