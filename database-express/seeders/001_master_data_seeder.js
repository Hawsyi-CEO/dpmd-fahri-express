// Seeder: Master Data Seeder
// Created: 2025-11-10
// Description: Seed master data for kecamatan, desa, and bidang

const mysql = require('mysql2/promise');
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
    console.log('🌱 Seeding master data...');

    // Seed Kecamatans
    const kecamatans = [
      { nama_kecamatan: 'Bogor Barat' },
      { nama_kecamatan: 'Bogor Selatan' },
      { nama_kecamatan: 'Bogor Tengah' },
      { nama_kecamatan: 'Bogor Timur' },
      { nama_kecamatan: 'Bogor Utara' },
      { nama_kecamatan: 'Tanah Sareal' }
    ];

    for (const kec of kecamatans) {
      await connection.query(
        'INSERT INTO kecamatans (nama_kecamatan) VALUES (?) ON DUPLICATE KEY UPDATE nama_kecamatan = nama_kecamatan',
        [kec.nama_kecamatan]
      );
    }
    console.log('✅ Kecamatans seeded');

    // Seed Bidangs (for Perjalanan Dinas)
    const bidangs = [
      { id_bidang: 1, nama: 'Pemerintahan' },
      { id_bidang: 2, nama: 'Pembangunan' },
      { id_bidang: 3, nama: 'Kemasyarakatan' },
      { id_bidang: 4, nama: 'Keuangan' },
      { id_bidang: 5, nama: 'Umum' }
    ];

    for (const bidang of bidangs) {
      await connection.query(
        'INSERT INTO bidangs (id_bidang, nama, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE nama = ?, status = ?',
        [bidang.id_bidang, bidang.nama, 'aktif', bidang.nama, 'aktif']
      );
    }
    console.log('✅ Bidangs seeded');

    console.log('🎉 Master data seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding master data:', error);
  } finally {
    await connection.end();
  }
}

// Run seeder if called directly
if (require.main === module) {
  seed();
}

module.exports = seed;
