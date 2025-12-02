const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * Seeder untuk membuat akun user untuk 8 pegawai yang belum memiliki akun
 * Password default: password
 */

async function main() {
  console.log('🔍 Mencari pegawai yang belum memiliki akun...\n');

  // Ambil pegawai yang belum punya akun
  const pegawaiWithoutAccount = await prisma.pegawai.findMany({
    where: {
      users: {
        none: {}
      }
    },
    include: {
      bidangs: {
        select: {
          id: true,
          nama: true
        }
      }
    }
  });

  console.log(`📊 Ditemukan ${pegawaiWithoutAccount.length} pegawai tanpa akun\n`);

  if (pegawaiWithoutAccount.length === 0) {
    console.log('✅ Semua pegawai sudah memiliki akun!');
    return;
  }

  // Password default
  const defaultPassword = 'password';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  console.log('🚀 Memulai pembuatan akun...\n');

  for (const pegawai of pegawaiWithoutAccount) {
    try {
      // Generate email yang unik dengan menambahkan nomor jika perlu
      const baseEmail = generateEmail(pegawai.nama_pegawai);
      let email = baseEmail;
      let counter = 1;

      // Cek apakah email sudah ada, jika ya tambahkan counter
      while (true) {
        const existingUser = await prisma.users.findUnique({
          where: { email }
        });

        if (!existingUser) break;
        
        email = baseEmail.replace('@', `${counter}@`);
        counter++;
      }

      // Buat user baru
      const newUser = await prisma.users.create({
        data: {
          name: pegawai.nama_pegawai,
          email: email,
          password: hashedPassword,
          role: 'pegawai',
          is_active: true,
          pegawai_id: pegawai.id_pegawai
        }
      });

      successCount++;
      console.log(`✅ [${successCount}/${pegawaiWithoutAccount.length}] Akun berhasil dibuat:`);
      console.log(`   Nama    : ${pegawai.nama_pegawai}`);
      console.log(`   Email   : ${email}`);
      console.log(`   Bidang  : ${pegawai.bidangs?.nama || 'N/A'}`);
      console.log(`   User ID : ${newUser.id}`);
      console.log('');

    } catch (error) {
      errorCount++;
      errors.push({
        pegawai: pegawai.nama_pegawai,
        error: error.message
      });
      console.log(`❌ [${errorCount}] Gagal membuat akun untuk ${pegawai.nama_pegawai}`);
      console.log(`   Error: ${error.message}\n`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Berhasil: ${successCount} akun`);
  console.log(`❌ Gagal   : ${errorCount} akun`);
  console.log(`📧 Password default: ${defaultPassword}`);
  console.log('='.repeat(60));

  if (errors.length > 0) {
    console.log('\n⚠️  Detail Error:');
    errors.forEach((err, idx) => {
      console.log(`${idx + 1}. ${err.pegawai}: ${err.error}`);
    });
  }
}

/**
 * Generate email dari nama pegawai
 * Mengambil nama depan, hilangkan gelar, konversi ke lowercase
 * Jika nama depan duplikat, gunakan nama belakang
 */
function generateEmail(fullName) {
  // Hapus gelar akademik dan professional
  const nameWithoutTitle = fullName
    .replace(/\b(Drs\.|Dr\.|Ir\.|H\.|Hj\.|Prof\.|S\.Kom|S\.E\.|S\.Sos|S\.IP|S\.AP|S\.Pd|S\.H\.|S\.Si|S\.T\.|M\.Kom|M\.E\.|M\.Sos|M\.IP|M\.AP|M\.Pd|M\.H\.|M\.Si|M\.T\.|M\.M\.|MBA|Ph\.D)\b/gi, '')
    .trim();

  const nameParts = nameWithoutTitle.split(' ').filter(part => part.length > 0);
  
  // Jika hanya 1 kata, gunakan itu
  if (nameParts.length === 1) {
    const cleanName = nameParts[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${cleanName}@dpmd.bogorkab.go.id`;
  }
  
  // Jika lebih dari 1 kata, coba nama depan dulu
  const firstName = nameParts[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Jika nama depan pendek (< 4 huruf) atau umum, gunakan nama belakang
  const lastName = nameParts[nameParts.length - 1].toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Nama-nama yang umum/pendek, gunakan nama belakang
  const commonFirstNames = ['tri', 'siti', 'moch', 'dian', 'wawan', 'ade', 'dwi', 'eko', 'sri', 'nur'];
  
  if (commonFirstNames.includes(firstName) || firstName.length < 4) {
    return `${lastName}@dpmd.bogorkab.go.id`;
  }

  return `${firstName}@dpmd.bogorkab.go.id`;
}

main()
  .catch((e) => {
    console.error('❌ Fatal Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
