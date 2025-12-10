// database-express/seeders/cleanup-duplicate-pegawai-users.js
/**
 * Hapus user pegawai duplikat, keep only the first one per pegawai_id
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Cleaning up duplicate pegawai users...\n');

  try {
    // Get all users with role pegawai
    const allPegawaiUsers = await prisma.users.findMany({
      where: { role: 'pegawai' },
      orderBy: { id: 'asc' }, // Keep oldest first
      select: {
        id: true,
        name: true,
        email: true,
        pegawai_id: true,
      }
    });

    console.log(`📦 Total user pegawai: ${allPegawaiUsers.length}\n`);

    // Group by pegawai_id
    const pegawaiMap = new Map();
    const duplicates = [];

    for (const user of allPegawaiUsers) {
      if (!user.pegawai_id) {
        console.log(`⚠️  User without pegawai_id: ${user.name} (${user.email})`);
        continue;
      }

      const pegawaiIdStr = user.pegawai_id.toString();
      
      if (pegawaiMap.has(pegawaiIdStr)) {
        // This is a duplicate
        duplicates.push(user);
      } else {
        // First occurrence, keep it
        pegawaiMap.set(pegawaiIdStr, user);
      }
    }

    console.log(`✅ Unique pegawai users: ${pegawaiMap.size}`);
    console.log(`🗑️  Duplicate users to delete: ${duplicates.length}\n`);

    if (duplicates.length === 0) {
      console.log('✨ No duplicates found!');
      return;
    }

    // Delete duplicates
    console.log('Deleting duplicates...\n');
    let deleted = 0;

    for (const dup of duplicates) {
      try {
        await prisma.users.delete({
          where: { id: dup.id }
        });
        console.log(`   🗑️  Deleted: ${dup.name} - ${dup.email} (ID: ${dup.id})`);
        deleted++;
      } catch (error) {
        console.error(`   ❌ Error deleting user ${dup.id}: ${error.message}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   🗑️  Deleted: ${deleted}`);
    console.log(`   ✅ Remaining: ${pegawaiMap.size}\n`);

    // Final verification
    const finalCount = await prisma.users.count({ where: { role: 'pegawai' } });
    const pegawaiCount = await prisma.pegawai.count();
    
    console.log(`🎉 Final count:`);
    console.log(`   Total pegawai: ${pegawaiCount}`);
    console.log(`   Total user pegawai: ${finalCount}`);
    
    if (finalCount === pegawaiCount) {
      console.log(`   ✅ Perfect! Every pegawai has exactly 1 user account`);
    } else if (finalCount < pegawaiCount) {
      console.log(`   ⚠️  Warning: ${pegawaiCount - finalCount} pegawai still missing user accounts`);
    } else {
      console.log(`   ⚠️  Warning: Still have ${finalCount - pegawaiCount} extra users`);
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
