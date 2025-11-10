/**
 * Script to generate migrations and seeders from existing database
 * Run: node scripts/generate-from-db.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dpmd'
};

async function generateMigrations() {
  console.log('🔍 Connecting to database:', dbConfig.database);
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Get all tables
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    
    console.log(`📊 Found ${tableNames.length} tables:`);
    tableNames.forEach(table => console.log(`  - ${table}`));
    
    // Create migrations directory
    const migrationsDir = path.join(__dirname, '..', 'database-express', 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    // Generate migration for each table
    for (const tableName of tableNames) {
      console.log(`\n📝 Generating migration for: ${tableName}`);
      
      // Get CREATE TABLE statement
      const [createTable] = await connection.query(`SHOW CREATE TABLE \`${tableName}\``);
      const createStatement = createTable[0]['Create Table'];
      
      // Format and save migration file
      const migrationContent = `-- Migration for table: ${tableName}
-- Generated: ${new Date().toISOString()}

${createStatement};
`;
      
      const fileName = `create_${tableName}_table.sql`;
      const filePath = path.join(migrationsDir, fileName);
      fs.writeFileSync(filePath, migrationContent);
      
      console.log(`  ✅ Created: ${fileName}`);
    }
    
    console.log('\n✨ All migrations generated successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

async function generateSeeders() {
  console.log('\n\n🌱 Generating seeders...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Tables to seed (master data only)
    const tablesToSeed = [
      'kecamatans',
      'desas',
      'bidangs',
      'users',
      'roles',
      'permissions'
    ];
    
    const seedersDir = path.join(__dirname, '..', 'database-express', 'seeders');
    if (!fs.existsSync(seedersDir)) {
      fs.mkdirSync(seedersDir, { recursive: true });
    }
    
    for (const tableName of tablesToSeed) {
      try {
        console.log(`\n📝 Generating seeder for: ${tableName}`);
        
        // Check if table exists
        const [tableExists] = await connection.query(
          `SELECT COUNT(*) as count FROM information_schema.tables 
           WHERE table_schema = ? AND table_name = ?`,
          [dbConfig.database, tableName]
        );
        
        if (tableExists[0].count === 0) {
          console.log(`  ⚠️  Table ${tableName} not found, skipping...`);
          continue;
        }
        
        // Get data - no limit for desas and kecamatans (master data)
        const limit = (tableName === 'desas' || tableName === 'kecamatans') ? '' : ' LIMIT 100';
        const [rows] = await connection.query(`SELECT * FROM \`${tableName}\`${limit}`);
        
        if (rows.length === 0) {
          console.log(`  ℹ️  No data in ${tableName}, skipping...`);
          continue;
        }
        
        // Get column info
        const [columns] = await connection.query(`DESCRIBE \`${tableName}\``);
        
        // Generate seeder file
        const seederContent = `/**
 * Seeder for table: ${tableName}
 * Generated: ${new Date().toISOString()}
 * Records: ${rows.length}
 */

module.exports = {
  tableName: '${tableName}',
  
  async up(connection) {
    console.log('Seeding ${tableName}...');
    
    const data = ${JSON.stringify(rows, null, 2)};
    
    for (const row of data) {
      // Convert dates
      ${columns.filter(col => col.Type.includes('timestamp') || col.Type.includes('datetime')).map(col => 
        `if (row.${col.Field}) row.${col.Field} = new Date(row.${col.Field});`
      ).join('\n      ')}
      
      try {
        await connection.query(
          'INSERT INTO \`${tableName}\` SET ? ON DUPLICATE KEY UPDATE ?',
          [row, row]
        );
      } catch (err) {
        console.warn('Skip duplicate:', err.message);
      }
    }
    
    console.log('✅ Seeded ${rows.length} records into ${tableName}');
  },
  
  async down(connection) {
    console.log('Clearing ${tableName}...');
    await connection.query('DELETE FROM \`${tableName}\`');
    console.log('✅ Cleared ${tableName}');
  }
};
`;
        
        const fileName = `${tableName}_seeder.js`;
        const filePath = path.join(seedersDir, fileName);
        fs.writeFileSync(filePath, seederContent);
        
        console.log(`  ✅ Created: ${fileName} (${rows.length} records)`);
        
      } catch (error) {
        console.error(`  ❌ Error seeding ${tableName}:`, error.message);
      }
    }
    
    console.log('\n✨ All seeders generated successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

async function main() {
  console.log('🚀 Starting database migration and seeder generation...\n');
  console.log('Database:', dbConfig.database);
  console.log('Host:', dbConfig.host);
  console.log('User:', dbConfig.user);
  console.log('=====================================\n');
  
  try {
    await generateMigrations();
    await generateSeeders();
    
    console.log('\n\n✅ DONE! All migrations and seeders generated.');
    console.log('\nNext steps:');
    console.log('1. Review generated files in database-express/');
    console.log('2. Run migrations: npm run db:migrate');
    console.log('3. Run seeders: npm run db:seed');
    
  } catch (error) {
    console.error('\n❌ Generation failed:', error.message);
    process.exit(1);
  }
}

main();
