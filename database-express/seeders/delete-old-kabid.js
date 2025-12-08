const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteOldKabidUsers() {
  try {
    console.log('🗑️  Deleting old kepala bidang users...\n');

    const deleted = await prisma.users.deleteMany({
      where: {
        role: {
          in: [
            'kabid_pemerintahan_desa',
            'kabid_spked',
            'kabid_kekayaan_keuangan_desa',
            'kabid_pemberdayaan_masyarakat_desa',
            'sekretaris_dinas'
          ]
        }
      }
    });

    console.log(`✅ Deleted ${deleted.count} users\n`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteOldKabidUsers();
