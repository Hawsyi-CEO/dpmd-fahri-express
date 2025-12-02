// Script to migrate legacy TEXT pegawai data to JSON format
// Run: node scripts/migrate-pegawai-text-to-json.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migratePegawaiData() {
  console.log('🔄 Starting migration of pegawai data from TEXT to JSON...\n');

  try {
    // Get all kegiatan_bidang with TEXT format (not starting with [)
    const records = await prisma.$queryRaw`
      SELECT id_kegiatan_bidang, id_bidang, pegawai 
      FROM kegiatan_bidang 
      WHERE pegawai NOT LIKE '[%'
    `;

    console.log(`📊 Found ${records.length} records with TEXT format\n`);

    let successCount = 0;
    let skipCount = 0;

    for (const record of records) {
      try {
        const pegawaiText = record.pegawai?.trim();
        
        if (!pegawaiText) {
          console.log(`⏭️  Skipping ID ${record.id_kegiatan_bidang}: Empty pegawai field`);
          skipCount++;
          continue;
        }

        console.log(`\n📝 Processing ID ${record.id_kegiatan_bidang}:`);
        console.log(`   Raw data: ${pegawaiText.substring(0, 80)}...`);

        // Get all pegawai for this bidang
        const allPegawai = await prisma.pegawai.findMany({
          where: { id_bidang: record.id_bidang },
          select: { id_pegawai: true, nama_pegawai: true }
        });

        // Smart parsing: try to match full names with titles
        const pegawaiArray = [];
        const textLower = pegawaiText.toLowerCase();
        
        for (const p of allPegawai) {
          const namaLower = p.nama_pegawai.toLowerCase();
          
          // Check if this pegawai name exists in the text
          if (textLower.includes(namaLower)) {
            pegawaiArray.push({
              id_pegawai: Number(p.id_pegawai),
              nama_pegawai: p.nama_pegawai
            });
            console.log(`   ✅ Matched: ${p.nama_pegawai}`);
          }
        }

        if (pegawaiArray.length === 0) {
          console.log(`   ⚠️  No matches found in database, keeping as TEXT`);
          skipCount++;
          continue;
        }

        // Convert to JSON
        const jsonData = JSON.stringify(pegawaiArray);
        
        // Update database
        await prisma.$executeRaw`
          UPDATE kegiatan_bidang 
          SET pegawai = ${jsonData}
          WHERE id_kegiatan_bidang = ${record.id_kegiatan_bidang}
        `;

        console.log(`   ✅ Updated to JSON: ${pegawaiArray.length} pegawai`);
        successCount++;

      } catch (error) {
        console.error(`   ❌ Error processing ID ${record.id_kegiatan_bidang}:`, error.message);
        skipCount++;
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Migration completed!`);
    console.log(`   - Successfully migrated: ${successCount} records`);
    console.log(`   - Skipped: ${skipCount} records`);
    console.log(`   - Total processed: ${records.length} records`);
    console.log(`${'='.repeat(60)}\n`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migratePegawaiData()
  .then(() => {
    console.log('✅ Migration script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
