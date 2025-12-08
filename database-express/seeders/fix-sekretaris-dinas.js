const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🔄 Starting seeder: Sekretaris Dinas & Fix Kabid Sekretariat...\n');

    // 1. Update existing user (subag.umpeg) role from sekretaris_dinas to kabid_sekretariat
    console.log('1️⃣ Updating Subag Umum & Kepegawaian role to kabid_sekretariat...');
    const updatedSubag = await prisma.users.update({
      where: { email: 'subag.umpeg@dpmd.bogorkab.go.id' },
      data: {
        role: 'kabid_sekretariat',
        bidang_id: 2 // Sekretariat
      }
    });
    console.log(`✅ Updated: ${updatedSubag.name} → kabid_sekretariat (Bidang: Sekretariat)\n`);

    // 2. Create new Sekretaris Dinas user
    console.log('2️⃣ Creating Sekretaris Dinas user...');
    
    const hashedPassword = await bcrypt.hash('password', 10);
    
    const sekretarisDinas = await prisma.users.create({
      data: {
        name: 'Sekretaris Dinas DPMD',
        email: 'sekretaris@dpmd.bogorkab.go.id',
        password: hashedPassword,
        role: 'sekretaris_dinas',
        bidang_id: null, // Sekretaris Dinas tidak terikat ke bidang tertentu
      }
    });

    console.log(`✅ Created: ${sekretarisDinas.name}`);
    console.log(`   Email: ${sekretarisDinas.email}`);
    console.log(`   Role: ${sekretarisDinas.role}`);
    console.log(`   Password: password\n`);

    console.log('✅ Seeder completed successfully!\n');
    console.log('📋 Summary of hierarchy:');
    console.log('   Level 1: Kepala Dinas (kepala_dinas)');
    console.log('   Level 2: Sekretaris Dinas (sekretaris_dinas) ← NEW USER');
    console.log('   Level 3: Kepala Bidang (kabid_*)');
    console.log('     - kabid_sekretariat (subag.umpeg)');
    console.log('     - kabid_pemerintahan_desas');
    console.log('     - kabid_spked');
    console.log('     - kabid_kekayaan_keuangan_desa');
    console.log('     - kabid_pemberdayaan_masyarakat_desa');
    console.log('   Level 4: Staff (pegawai, sekretariat)');

  } catch (error) {
    console.error('❌ Error seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
