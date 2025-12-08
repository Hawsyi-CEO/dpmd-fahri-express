const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    // Cek users dengan role kepala bidang + sekretaris dinas
    const kabidUsers = await prisma.users.findMany({
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
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bidang_id: true
      }
    });

    console.log('=== USERS KEPALA BIDANG ===');
    console.log('Total:', kabidUsers.length);
    kabidUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role} - Bidang ID: ${user.bidang_id}`);
    });

    // Cek bidangs
    const bidangs = await prisma.bidangs.findMany({
      select: {
        id: true,
        nama: true
      }
    });

    console.log('\n=== BIDANGS ===');
    console.log('Total:', bidangs.length);
    bidangs.forEach(bidang => {
      console.log(`- ID: ${bidang.id} - ${bidang.nama}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
