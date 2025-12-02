/**
 * Seeder: Create User Accounts for All Pegawai
 * 
 * Rules:
 * - Email: [nama_depan]@dpmd.bogorkab.go.id
 * - Password: dpmd2025 (hashed with bcrypt)
 * - Role: pegawai
 * - is_active: true
 * - Extract first name only (remove titles and middle/last names)
 */

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Extract first name from full name
 * Removes titles (Drs., S.Sos, M.Si, etc.) and gets first word
 */
function extractFirstName(fullName) {
  // Remove common titles and degrees
  let cleaned = fullName
    .replace(/\b(Drs\.|Dr\.|Ir\.|Prof\.|Hj\.|H\.|S\.Kom|S\.E\.|S\.Sos|S\.IP|S\.Si|S\.T|M\.Si|M\.PA|M\.Kom|M\.M|SE|MM)\b/gi, '')
    .trim();
  
  // Remove dots and extra spaces
  cleaned = cleaned.replace(/\./g, ' ').replace(/\s+/g, ' ').trim();
  
  // Get first word (first name)
  const firstName = cleaned.split(' ')[0];
  
  // Convert to lowercase
  return firstName.toLowerCase();
}

/**
 * Generate email from name
 */
function generateEmail(fullName) {
  const firstName = extractFirstName(fullName);
  return `${firstName}@dpmd.bogorkab.go.id`;
}

/**
 * Main seeder function
 */
async function seedPegawaiUsers() {
  try {
    console.log('🌱 Starting pegawai users seeder...\n');

    // Get all pegawai without user accounts
    const allPegawai = await prisma.pegawai.findMany({
      include: {
        users: true,
        bidangs: {
          select: {
            id: true,
            nama: true
          }
        }
      },
      orderBy: {
        id_pegawai: 'asc'
      }
    });

    console.log(`📊 Total pegawai in database: ${allPegawai.length}`);
    
    // Filter pegawai that don't have user accounts yet
    const pegawaiWithoutUsers = allPegawai.filter(p => p.users.length === 0);
    console.log(`👤 Pegawai without user accounts: ${pegawaiWithoutUsers.length}\n`);

    if (pegawaiWithoutUsers.length === 0) {
      console.log('✅ All pegawai already have user accounts!');
      return;
    }

    // Default password for all users
    const defaultPassword = 'dpmd2025';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Create user accounts for each pegawai
    for (const pegawai of pegawaiWithoutUsers) {
      try {
        const email = generateEmail(pegawai.nama_pegawai);
        const firstName = extractFirstName(pegawai.nama_pegawai);
        
        // Check if email already exists
        const existingUser = await prisma.users.findUnique({
          where: { email }
        });

        if (existingUser) {
          console.log(`⚠️  Email ${email} already exists (ID: ${existingUser.id}), skipping...`);
          errorCount++;
          errors.push({
            pegawai: pegawai.nama_pegawai,
            error: 'Email already exists'
          });
          continue;
        }

        // Create user account
        const user = await prisma.users.create({
          data: {
            name: pegawai.nama_pegawai,
            email: email,
            password: hashedPassword,
            role: 'pegawai',
            is_active: true,
            pegawai_id: pegawai.id_pegawai,
            bidang_id: Number(pegawai.id_bidang)
          }
        });

        console.log(`✅ Created user for: ${pegawai.nama_pegawai}`);
        console.log(`   📧 Email: ${email}`);
        console.log(`   🏢 Bidang: ${pegawai.bidangs?.nama || 'N/A'}`);
        console.log(`   🔑 User ID: ${user.id}\n`);
        
        successCount++;
      } catch (error) {
        console.error(`❌ Error creating user for ${pegawai.nama_pegawai}:`, error.message);
        errorCount++;
        errors.push({
          pegawai: pegawai.nama_pegawai,
          error: error.message
        });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SEEDER SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully created: ${successCount} user accounts`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📧 Default password for all accounts: ${defaultPassword}`);
    console.log('='.repeat(60));

    if (errors.length > 0) {
      console.log('\n❌ ERRORS:');
      errors.forEach((err, idx) => {
        console.log(`${idx + 1}. ${err.pegawai}: ${err.error}`);
      });
    }

    console.log('\n✅ Seeder completed!');

  } catch (error) {
    console.error('❌ Seeder failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeder
seedPegawaiUsers()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
