// database-express/seeders/fix-pegawai-id-and-cleanup.js
/**
 * 1. Update pegawai_id untuk user yang belum punya (match by name)
 * 2. Hapus duplikat setelah semua punya pegawai_id
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Step 1: Update missing pegawai_id...\n');

  try {
    // Get all users without pegawai_id
    const usersWithoutPegawaiId = await prisma.users.findMany({
      where: { 
        role: 'pegawai',
        pegawai_id: null
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    console.log(`📦 Users without pegawai_id: ${usersWithoutPegawaiId.length}\n`);

    let updated = 0;
    let notFound = 0;

    for (const user of usersWithoutPegawaiId) {
      try {
        // Find matching pegawai by name (exact match)
        const pegawai = await prisma.pegawai.findFirst({
          where: { nama_pegawai: user.name },
          select: { id_pegawai: true }
        });

        if (pegawai) {
          await prisma.users.update({
            where: { id: user.id },
            data: { pegawai_id: pegawai.id_pegawai }
          });
          console.log(`   ✅ Updated: ${user.name} → pegawai_id: ${pegawai.id_pegawai}`);
          updated++;
        } else {
          console.log(`   ⚠️  Not found in pegawai table: ${user.name}`);
          notFound++;
        }
      } catch (error) {
        console.error(`   ❌ Error updating ${user.name}: ${error.message}`);
      }
    }

    console.log(`\n📊 Step 1 Summary:`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⚠️  Not found: ${notFound}\n`);

    // Step 2: Delete duplicates
    console.log('🔄 Step 2: Delete duplicate users...\n');

    const allPegawaiUsers = await prisma.users.findMany({
      where: { role: 'pegawai' },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        pegawai_id: true,
      }
    });

    const pegawaiMap = new Map();
    const duplicates = [];

    for (const user of allPegawaiUsers) {
      if (!user.pegawai_id) {
        console.log(`⚠️  User still without pegawai_id: ${user.name} (will be deleted)`);
        duplicates.push(user);
        continue;
      }

      const pegawaiIdStr = user.pegawai_id.toString();
      
      if (pegawaiMap.has(pegawaiIdStr)) {
        duplicates.push(user);
      } else {
        pegawaiMap.set(pegawaiIdStr, user);
      }
    }

    console.log(`\n✅ Unique pegawai users: ${pegawaiMap.size}`);
    console.log(`🗑️  Duplicate/orphan users to delete: ${duplicates.length}\n`);

    if (duplicates.length === 0) {
      console.log('✨ No duplicates to clean!');
    } else {
      let deleted = 0;

      for (const dup of duplicates) {
        try {
          await prisma.users.delete({
            where: { id: dup.id }
          });
          console.log(`   🗑️  Deleted: ${dup.name} - ${dup.email}`);
          deleted++;
        } catch (error) {
          console.error(`   ❌ Error deleting user ${dup.id}: ${error.message}`);
        }
      }

      console.log(`\n📊 Step 2 Summary:`);
      console.log(`   🗑️  Deleted: ${deleted}`);
    }

    // Final verification
    const finalUserCount = await prisma.users.count({ where: { role: 'pegawai' } });
    const pegawaiCount = await prisma.pegawai.count();
    
    console.log(`\n🎉 Final Result:`);
    console.log(`   Total pegawai: ${pegawaiCount}`);
    console.log(`   Total user pegawai: ${finalUserCount}`);
    
    if (finalUserCount === pegawaiCount) {
      console.log(`   ✅ PERFECT! Every pegawai has exactly 1 user account`);
    } else {
      console.log(`   ⚠️  Difference: ${Math.abs(finalUserCount - pegawaiCount)} users`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
