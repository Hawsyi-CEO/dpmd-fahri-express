const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function seedKepalaBidang() {
  try {
    console.log('🌱 Seeding Kepala Bidang users...\n');

    // Data kepala bidang berdasarkan bidangs yang ada
    const kepalaBidangData = [
      {
        nama: 'Kepala Bidang Pemerintahan Desa',
        email: 'kabid.pemdes@dpmd.bogorkab.go.id',
        role: 'kabid_pemerintahan_desa',
        bidang_nama: 'Pemerintahan Desa'
      },
      {
        nama: 'Kepala Bidang SPKED',
        email: 'kabid.spked@dpmd.bogorkab.go.id',
        role: 'kabid_spked',
        bidang_nama: 'Sarana Prasarana'
      },
      {
        nama: 'Kepala Bidang Kekayaan & Keuangan Desa',
        email: 'kabid.kkd@dpmd.bogorkab.go.id',
        role: 'kabid_kekayaan_keuangan_desa',
        bidang_nama: 'Kekayaan dan Keuangan'
      },
      {
        nama: 'Kepala Bidang Pemberdayaan Masyarakat',
        email: 'kabid.pm@dpmd.bogorkab.go.id',
        role: 'kabid_pemberdayaan_masyarakat_desa',
        bidang_nama: 'Pemberdayaan Masyarakat'
      },
      {
        nama: 'Kepala Sub Bagian Umum & Kepegawaian',
        email: 'subag.umpeg@dpmd.bogorkab.go.id',
        role: 'sekretaris_dinas',
        bidang_nama: 'Sekretariat'
      }
    ];

    const hashedPassword = await bcrypt.hash('password', 10);

    for (const data of kepalaBidangData) {
      // Cek apakah bidang ada
      const bidang = await prisma.bidangs.findFirst({
        where: {
          nama: {
            contains: data.bidang_nama.includes('SPKED') ? 'SPKED' : data.bidang_nama.split(' ')[1]
          }
        }
      });

      // Cek apakah user sudah ada
      const existingUser = await prisma.users.findFirst({
        where: {
          OR: [
            { email: data.email },
            { role: data.role }
          ]
        }
      });

      if (existingUser) {
        console.log(`⚠️  User ${data.nama} sudah ada (${existingUser.email})`);
        continue;
      }

      // Create user
      const user = await prisma.users.create({
        data: {
          name: data.nama,
          email: data.email,
          password: hashedPassword,
          role: data.role,
          bidang_id: bidang?.id ? Number(bidang.id) : null,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      console.log(`✅ Created: ${user.name} (${user.email}) - ${user.role}`);
    }

    console.log('\n✨ Seeding Kepala Bidang completed!\n');
    console.log('📝 Default Password untuk semua akun: password\n');
    console.log('📧 Email accounts:');
    kepalaBidangData.forEach(data => {
      console.log(`   - ${data.email} (${data.role})`);
    });

  } catch (error) {
    console.error('❌ Error seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeder
if (require.main === module) {
  seedKepalaBidang()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedKepalaBidang };
