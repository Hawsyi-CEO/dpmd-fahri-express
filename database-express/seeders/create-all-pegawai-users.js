// database-express/seeders/create-all-pegawai-users.js
/**
 * Buat user account untuk SEMUA pegawai yang belum punya akun
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Membuat user untuk semua pegawai...\n');

  try {
    // Get all pegawai
    const allPegawai = await prisma.pegawai.findMany({
      select: {
        id_pegawai: true,
        nama_pegawai: true,
        id_bidang: true,
      }
    });

    console.log(`📦 Total pegawai di database: ${allPegawai.length}\n`);

    // Get existing user pegawai emails
    const existingUsers = await prisma.users.findMany({
      where: { role: 'pegawai' },
      select: { pegawai_id: true, email: true, name: true }
    });

    console.log(`👥 Total user pegawai existing: ${existingUsers.length}\n`);

    // Find pegawai without user accounts
    const existingPegawaiIds = new Set(
      existingUsers.map(u => u.pegawai_id?.toString()).filter(Boolean)
    );

    const pegawaiWithoutUsers = allPegawai.filter(
      p => !existingPegawaiIds.has(p.id_pegawai.toString())
    );

    console.log(`🆕 Pegawai yang belum punya user: ${pegawaiWithoutUsers.length}\n`);

    if (pegawaiWithoutUsers.length === 0) {
      console.log('✅ Semua pegawai sudah punya user account!');
      return;
    }

    // Create users for pegawai without accounts
    const hashedPassword = await bcrypt.hash('password', 10);
    let created = 0;
    const errors = [];

    for (const peg of pegawaiWithoutUsers) {
      try {
        // Extract first name for email
        const cleanName = peg.nama_pegawai
          .replace(/^(Drs\.|Dr\.|Ir\.|H\.|Hj\.|R\.)\s*/gi, '')
          .replace(/,?\s*(S\.|M\.|A\.)\s*[A-Z][a-z]*\.?/gi, '')
          .replace(/,/g, '')
          .trim();
        
        const firstName = cleanName.split(/\s+/)[0].toLowerCase();
        let email = `${firstName}@dpmd.bogorkab.go.id`;

        // Check if email exists, add suffix if needed
        let suffix = 2;
        while (await prisma.users.findUnique({ where: { email } })) {
          email = `${firstName}${suffix}@dpmd.bogorkab.go.id`;
          suffix++;
        }

        // Create user
        await prisma.users.create({
          data: {
            name: peg.nama_pegawai,
            email: email,
            password: hashedPassword,
            role: 'pegawai',
            bidang_id: Number(peg.id_bidang),
            pegawai_id: peg.id_pegawai,
          }
        });

        console.log(`   ✅ Created user: ${peg.nama_pegawai} - ${email}`);
        created++;

      } catch (error) {
        console.error(`   ❌ Error creating user for ${peg.nama_pegawai}: ${error.message}`);
        errors.push({ name: peg.nama_pegawai, error: error.message });
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ❌ Errors: ${errors.length}\n`);

    if (errors.length > 0) {
      console.log('⚠️  Errors:');
      errors.forEach(e => console.log(`   - ${e.name}: ${e.error}`));
    }

    // Final count
    const finalCount = await prisma.users.count({ where: { role: 'pegawai' } });
    console.log(`\n🎉 Total user pegawai sekarang: ${finalCount} dari ${allPegawai.length} pegawai`);

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
