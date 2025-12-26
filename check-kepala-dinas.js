const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to convert BigInt to string
const convertBigInt = (obj) => {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

(async () => {
  try {
    console.log('\n=== CHECKING KEPALA DINAS USERS ===\n');
    
    // Check user with role 'kepala_dinas'
    const roleUsers = await prisma.users.findMany({
      where: { role: 'kepala_dinas' },
      select: {
        id: true,
        name: true,
        role: true,
        position_id: true,
        bidang_id: true,
        position: {
          select: {
            id: true,
            code: true,
            name: true,
            level: true
          }
        }
      }
    });
    
    console.log('Users with role "kepala_dinas":', JSON.stringify(convertBigInt(roleUsers), null, 2));
    
    // Check user with position_id = 2
    const positionUsers = await prisma.users.findMany({
      where: { position_id: 2 },
      select: {
        id: true,
        name: true,
        role: true,
        position_id: true,
        bidang_id: true,
        position: {
          select: {
            id: true,
            code: true,
            name: true,
            level: true
          }
        }
      }
    });
    
    console.log('\nUsers with position_id = 2:', JSON.stringify(convertBigInt(positionUsers), null, 2));
    
    // Check pegawai sekretariat
    const sekretariatPegawai = await prisma.users.findMany({
      where: {
        role: 'pegawai',
        bidang_id: 2
      },
      select: {
        id: true,
        name: true,
        role: true,
        position_id: true,
        bidang_id: true,
        position: {
          select: {
            id: true,
            code: true,
            name: true,
            level: true
          }
        }
      }
    });
    
    console.log('\nPegawai Sekretariat (bidang_id=2):', JSON.stringify(convertBigInt(sekretariatPegawai), null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
