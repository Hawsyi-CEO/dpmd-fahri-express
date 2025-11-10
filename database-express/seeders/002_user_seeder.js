// Seeder: User Seeder
// Created: 2025-11-10
// Description: Seed default users for different roles

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('🌱 Seeding users...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        name: 'Super Admin',
        email: 'superadmin@dpmd.com',
        password: hashedPassword,
        role: 'superadmin'
      },
      {
        name: 'Admin DPMD',
        email: 'admin@dpmd.com',
        password: hashedPassword,
        role: 'admin'
      },
      {
        name: 'Sarpras DPMD',
        email: 'sarpras@dpmd.com',
        password: hashedPassword,
        role: 'sarpras'
      },
      {
        name: 'Desa Test',
        email: 'desa@test.com',
        password: hashedPassword,
        role: 'desa'
      }
    ];

    for (const user of users) {
      const [existing] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [user.email]
      );

      if (existing.length === 0) {
        await connection.query(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          [user.name, user.email, user.password, user.role]
        );
        console.log(`✅ User ${user.email} created`);
      } else {
        console.log(`⏭️  User ${user.email} already exists`);
      }
    }

    console.log('🎉 User seeding completed!');
    console.log('\n📝 Default credentials:');
    console.log('   Email: superadmin@dpmd.com | Password: password123');
    console.log('   Email: admin@dpmd.com | Password: password123');
    console.log('   Email: sarpras@dpmd.com | Password: password123');
    console.log('   Email: desa@test.com | Password: password123');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await connection.end();
  }
}

// Run seeder if called directly
if (require.main === module) {
  seed();
}

module.exports = seed;
