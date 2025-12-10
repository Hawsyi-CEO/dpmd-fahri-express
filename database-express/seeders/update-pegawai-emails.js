// database-express/seeders/update-pegawai-emails.js
/**
 * Update email user pegawai menjadi format singkat
 * Contoh: "Mas Cecep Tino Noviandi, A. Md" → cecep@dpmd.bogorkab.go.id
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Memulai update email pegawai...\n');

  try {
    // Get all users with role pegawai
    const pegawaiUsers = await prisma.users.findMany({
      where: { role: 'pegawai' },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    console.log(`📦 Ditemukan ${pegawaiUsers.length} user pegawai\n`);

    let updated = 0;
    let skipped = 0;
    const errors = [];

    for (const user of pegawaiUsers) {
      try {
        // Extract first name (nama depan)
        // Remove titles, gelar, etc
        const cleanName = user.name
          .replace(/^(Drs\.|Dr\.|Ir\.|H\.|Hj\.|R\.)\s*/gi, '') // Remove title prefix
          .replace(/,?\s*(S\.|M\.|A\.)\s*[A-Z][a-z]*\.?/gi, '') // Remove gelar
          .replace(/,/g, '') // Remove commas
          .trim();
        
        // Get first word as username
        const firstName = cleanName.split(/\s+/)[0].toLowerCase();
        
        const newEmail = `${firstName}@dpmd.bogorkab.go.id`;

        // Check if email already exists (skip if same as current)
        if (user.email === newEmail) {
          console.log(`   ⏭️  ${user.name} - email sudah benar: ${newEmail}`);
          skipped++;
          continue;
        }

        // Check if new email already used by another user
        const existingUser = await prisma.users.findUnique({
          where: { email: newEmail }
        });

        if (existingUser && existingUser.id !== user.id) {
          // Add number suffix if duplicate
          let suffix = 2;
          let uniqueEmail = `${firstName}${suffix}@dpmd.bogorkab.go.id`;
          
          while (await prisma.users.findUnique({ where: { email: uniqueEmail } })) {
            suffix++;
            uniqueEmail = `${firstName}${suffix}@dpmd.bogorkab.go.id`;
          }
          
          await prisma.users.update({
            where: { id: user.id },
            data: { email: uniqueEmail }
          });
          
          console.log(`   ✅ ${user.name}`);
          console.log(`      Old: ${user.email}`);
          console.log(`      New: ${uniqueEmail} (duplicate, added suffix)\n`);
        } else {
          // Update email
          await prisma.users.update({
            where: { id: user.id },
            data: { email: newEmail }
          });
          
          console.log(`   ✅ ${user.name}`);
          console.log(`      Old: ${user.email}`);
          console.log(`      New: ${newEmail}\n`);
        }
        
        updated++;
      } catch (error) {
        console.error(`   ❌ Error updating ${user.name}: ${error.message}`);
        errors.push({ name: user.name, error: error.message });
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors.length}\n`);

    if (errors.length > 0) {
      console.log('⚠️  Errors:');
      errors.forEach(e => console.log(`   - ${e.name}: ${e.error}`));
    }

    console.log('🎉 Update email pegawai selesai!');

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
