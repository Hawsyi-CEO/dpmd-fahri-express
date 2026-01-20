// Script untuk membuat 40 user kecamatan
require('dotenv').config();
const sequelize = require('./src/config/database');
const bcrypt = require('bcrypt');

async function createKecamatanUsers() {
  try {
    // Ambil semua kecamatan
    const [kecamatans] = await sequelize.query(`
      SELECT id, nama FROM kecamatans ORDER BY id
    `);

    console.log(`Ditemukan ${kecamatans.length} kecamatan`);

    // Hash password default
    const hashedPassword = await bcrypt.hash('password', 10);

    // Loop untuk setiap kecamatan
    for (const kecamatan of kecamatans) {
      // Buat email dari nama kecamatan (lowercase, tanpa spasi)
      const emailPrefix = kecamatan.nama.toLowerCase().replace(/\s+/g, '');
      const email = `${emailPrefix}@dpmd.bogorkab.go.id`;
      const name = `Admin Kecamatan ${kecamatan.nama}`;

      // Cek apakah user sudah ada
      const [existing] = await sequelize.query(`
        SELECT id FROM users WHERE email = ?
      `, { replacements: [email] });

      if (existing.length > 0) {
        console.log(`⚠️  User ${email} sudah ada, skip...`);
        continue;
      }

      // Insert user
      await sequelize.query(`
        INSERT INTO users (name, email, password, role, kecamatan_id, created_at, updated_at)
        VALUES (?, ?, ?, 'kecamatan', ?, NOW(), NOW())
      `, {
        replacements: [name, email, hashedPassword, kecamatan.id]
      });

      console.log(`✅ Berhasil membuat user: ${email} (${name})`);
    }

    console.log(`\n✨ Selesai! Total ${kecamatans.length} user kecamatan dibuat`);
    console.log(`📧 Password default: password`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createKecamatanUsers();
