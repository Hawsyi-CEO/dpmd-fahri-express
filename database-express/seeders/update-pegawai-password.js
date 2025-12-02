const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * Update semua password pegawai menjadi "password"
 */

async function main() {
  console.log('🔄 Updating password untuk semua akun pegawai...\n');

  const newPassword = 'password';
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    // Update semua user dengan role pegawai
    const result = await prisma.users.updateMany({
      where: {
        role: 'pegawai'
      },
      data: {
        password: hashedPassword
      }
    });

    console.log('✅ Berhasil update password!');
    console.log(`📊 Total akun yang diupdate: ${result.count}`);
    console.log(`🔑 Password baru: ${newPassword}`);
    console.log('\n' + '='.repeat(60));
    console.log('Semua akun pegawai sekarang menggunakan password: password');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
