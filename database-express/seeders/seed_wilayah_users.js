/**
 * Seeder Wilayah dan Users - Complete Version with Prisma
 * Menghapus data lama dan mengisi dengan data lengkap dari seeder existing
 * - 40 Kecamatan
 * - 435 Desa/Kelurahan
 * - Users untuk setiap desa dan kecamatan
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;

const prisma = new PrismaClient();

/**
 * Fungsi untuk membuat slug dari string
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function clearAndSeed() {
  try {
    console.log('🗑️  Menghapus data lama...');
    
    // Hapus data menggunakan Prisma (order matters - child first)
    await prisma.pengurus.deleteMany();
    await prisma.pkks.deleteMany();
    await prisma.satlinmas.deleteMany();
    await prisma.lpms.deleteMany();
    await prisma.karang_tarunas.deleteMany();
    await prisma.posyandus.deleteMany();
    await prisma.rts.deleteMany();
    await prisma.rws.deleteMany();
    console.log('✅ Data kelembagaan dihapus');
    
    await prisma.users.deleteMany({
      where: { role: { in: ['desa', 'kecamatan'] } }
    });
    console.log('✅ Users (desa & kecamatan) dihapus');
    
    await prisma.desas.deleteMany();
    await prisma.kecamatans.deleteMany();
    console.log('✅ Data desas & kecamatans dihapus');
    
    console.log('\n📥 Memasukkan data baru...\n');
    
    // --- INSERT KECAMATAN ---
    console.log('📍 Inserting kecamatans (40 records)...');
    
    const kecamatanData = [
      { id: 1, nama: 'Cibinong' },
      { id: 2, nama: 'Gunung Putri' },
      { id: 3, nama: 'Citeureup' },
      { id: 4, nama: 'Sukaraja' },
      { id: 5, nama: 'Babakan Madang' },
      { id: 6, nama: 'Jonggol' },
      { id: 7, nama: 'Cileungsi' },
      { id: 8, nama: 'Cariu' },
      { id: 9, nama: 'Sukamakmur' },
      { id: 10, nama: 'Parung' },
      { id: 11, nama: 'Gunung Sindur' },
      { id: 12, nama: 'Kemang' },
      { id: 13, nama: 'Bojong Gede' },
      { id: 14, nama: 'Leuwiliang' },
      { id: 15, nama: 'Ciampea' },
      { id: 16, nama: 'Cibungbulang' },
      { id: 17, nama: 'Pamijahan' },
      { id: 18, nama: 'Rumpin' },
      { id: 19, nama: 'Jasinga' },
      { id: 20, nama: 'Parung Panjang' },
      { id: 21, nama: 'Nanggung' },
      { id: 22, nama: 'Cigudeg' },
      { id: 23, nama: 'Tenjo' },
      { id: 24, nama: 'Ciawi' },
      { id: 25, nama: 'Cisarua' },
      { id: 26, nama: 'Megamendung' },
      { id: 27, nama: 'Caringin' },
      { id: 28, nama: 'Cijeruk' },
      { id: 29, nama: 'Ciomas' },
      { id: 30, nama: 'Dramaga' },
      { id: 31, nama: 'Tamansari' },
      { id: 32, nama: 'Klapanunggal' },
      { id: 33, nama: 'Ciseeng' },
      { id: 34, nama: 'Ranca Bungur' },
      { id: 35, nama: 'Sukajaya' },
      { id: 36, nama: 'Tanjungsari' },
      { id: 37, nama: 'Tajurhalang' },
      { id: 38, nama: 'Cigombong' },
      { id: 39, nama: 'Leuwisadeng' },
      { id: 40, nama: 'Tenjolaya' }
    ];
    
    for (const kec of kecamatanData) {
      await prisma.kecamatans.create({
        data: {
          id_kecamatan: kec.id,
          nama_kecamatan: kec.nama
        }
      });
    }
    console.log(`✅ ${kecamatanData.length} kecamatan berhasil ditambahkan\n`);
    
    // --- INSERT DESA dari desas_seeder.js ---
    console.log('🏘️  Loading desas data from seeder file...');
    
    const desaContent = await fs.readFile('./database-express/seeders/desas_seeder.js', 'utf-8');
    const dataMatch = desaContent.match(/const data = (\[[\s\S]*?\]);/);
    if (!dataMatch) {
      throw new Error('Cannot parse desas data from seeder file');
    }
    
    const desaData = eval(dataMatch[1]);
    console.log(`📥 Found ${desaData.length} desas to insert\n`);
    
    let insertedCount = 0;
    for (const desa of desaData) {
      await prisma.desas.create({
        data: {
          id_desa: desa.id,
          id_kecamatan: desa.kecamatan_id,
          kode_desa: desa.kode,
          nama_desa: desa.nama,
          status_pemerintahan: desa.status_pemerintahan || 'desa',
          musdesus_target: desa.is_musdesus_target || 0
        }
      });
      insertedCount++;
      
      if (insertedCount % 50 === 0) {
        process.stdout.write(`  Inserted ${insertedCount}/${desaData.length} desas...\r`);
      }
    }
    console.log(`\n✅ ${desaData.length} desa/kelurahan berhasil ditambahkan\n`);
    
    // --- INSERT USER ADMIN DESA ---
    console.log('👤 Creating admin desa users...');
    const hashedPassword = await bcrypt.hash('password', 10);
    
    let userDesaCount = 0;
    for (const desa of desaData) {
      const kecamatan = kecamatanData.find(k => k.id === desa.kecamatan_id);
      if (!kecamatan) continue;
      
      const desaSlug = slugify(desa.nama);
      const kecamatanSlug = slugify(kecamatan.nama);
      
      const email = `desa.${desaSlug}.${kecamatanSlug}@dpmd.bogorkab.go.id`;
      const name = `Admin Desa ${desa.nama}`;
      
      await prisma.users.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'desa',
          desa_id: desa.id
        }
      });
      
      userDesaCount++;
      if (userDesaCount % 50 === 0) {
        process.stdout.write(`  Created ${userDesaCount}/${desaData.length} admin desa users...\r`);
      }
    }
    console.log(`\n✅ ${userDesaCount} admin desa berhasil ditambahkan\n`);
    
    // --- INSERT USER ADMIN KECAMATAN ---
    console.log('👥 Creating admin kecamatan users...');
    
    for (const kec of kecamatanData) {
      const kecamatanSlug = slugify(kec.nama);
      const email = `kecamatan.${kecamatanSlug}@dpmd.bogorkab.go.id`;
      const name = `Admin Kecamatan ${kec.nama}`;
      
      await prisma.users.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'kecamatan',
          kecamatan_id: kec.id
        }
      });
      
      console.log(`  ✓ ${email}`);
    }
    console.log(`✅ ${kecamatanData.length} admin kecamatan berhasil ditambahkan\n`);
    
    // --- SUMMARY ---
    console.log('='.repeat(60));
    console.log('🎉 SEEDER BERHASIL DIJALANKAN!');
    console.log('='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   • Kecamatan: ${kecamatanData.length} data`);
    console.log(`   • Desa/Kelurahan: ${desaData.length} data`);
    console.log(`   • Admin Desa: ${userDesaCount} users`);
    console.log(`   • Admin Kecamatan: ${kecamatanData.length} users`);
    console.log(`   • Total Users: ${userDesaCount + kecamatanData.length} users`);
    console.log('');
    console.log('📝 Credential Login:');
    console.log('   Email: desa.[nama-desa].[nama-kecamatan]@dpmd.bogorkab.go.id');
    console.log('   Email: kecamatan.[nama-kecamatan]@dpmd.bogorkab.go.id');
    console.log('   Password: password');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error saat seeding:', error.message);
    console.error(error.stack);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeder
clearAndSeed()
  .then(() => {
    console.log('\n✅ Seeder completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeder failed:', error);
    process.exit(1);
  });
