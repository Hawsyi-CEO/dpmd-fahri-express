const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBidang() {
  try {
    console.log('📋 Checking bidangs data...\n');
    
    const bidangs = await prisma.bidangs.findMany({
      orderBy: { id: 'asc' }
    });

    console.log(`Found ${bidangs.length} bidang(s):\n`);
    bidangs.forEach(bidang => {
      console.log(`ID: ${bidang.id} | Nama: ${bidang.nama}`);
    });

    console.log('\n📋 Checking users with bidang roles...\n');
    
    const users = await prisma.users.findMany({
      where: {
        role: {
          in: [
            'sekretaris_dinas',
            'kabid_sekretariat',
            'kabid_pemerintahan_desa',
            'kabid_spked',
            'kabid_kekayaan_keuangan_desa',
            'kabid_pemberdayaan_masyarakat_desa'
          ]
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bidang_id: true
      },
      orderBy: { id: 'asc' }
    });

    console.log(`Found ${users.length} user(s) with bidang roles:\n`);
    users.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Bidang ID: ${user.bidang_id || 'NULL'}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBidang();
