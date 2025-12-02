/**
 * Script untuk migrasi data pegawai dari TEXT ke JSON format
 * Mengatasi masalah nama dengan koma (gelar) yang ter-split
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migratePegawaiData() {
  console.log('🚀 Starting migration: TEXT → JSON format for pegawai data...\n');

  try {
    // Get all kegiatan_bidang with pegawai data using raw SQL
    const kegiatanBidangs = await prisma.$queryRaw`
      SELECT id_kegiatan_bidang, id_kegiatan, id_bidang, pegawai 
      FROM kegiatan_bidang 
      WHERE pegawai IS NOT NULL 
        AND pegawai != '' 
        AND pegawai != '[]'
    `;

    console.log(`📊 Found ${kegiatanBidangs.length} records to process\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const kb of kegiatanBidangs) {
      try {
        // Check if already JSON
        const parsed = JSON.parse(kb.pegawai);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id_pegawai) {
          console.log(`⏭️  Skipping ID ${kb.id_kegiatan_bidang} - already in JSON format`);
          skipCount++;
          continue;
        }
      } catch (e) {
        // Not JSON, proceed with migration
      }

      console.log(`\n🔄 Processing kegiatan_bidang ID: ${kb.id_kegiatan_bidang}`);
      console.log(`   Original TEXT: ${kb.pegawai.substring(0, 80)}...`);

      // Get all pegawai from this bidang
      const allPegawai = await prisma.pegawai.findMany({
        where: { id_bidang: kb.id_bidang },
        select: {
          id_pegawai: true,
          nama_pegawai: true
        }
      });

      console.log(`   Found ${allPegawai.length} pegawai in bidang ${kb.id_bidang}`);

      // Try to match pegawai names from TEXT
      const matchedPegawai = [];
      const originalText = kb.pegawai.toLowerCase();

      for (const pegawai of allPegawai) {
        // Check if pegawai name exists in the TEXT (case insensitive)
        const nameLower = pegawai.nama_pegawai.toLowerCase();
        if (originalText.includes(nameLower)) {
          matchedPegawai.push({
            id_pegawai: Number(pegawai.id_pegawai),
            nama_pegawai: pegawai.nama_pegawai
          });
          console.log(`   ✓ Matched: ${pegawai.nama_pegawai}`);
        }
      }

      if (matchedPegawai.length > 0) {
        // Update to JSON format
        const jsonData = JSON.stringify(matchedPegawai);
        
        await prisma.kegiatan_bidang.update({
          where: { id_kegiatan_bidang: Number(kb.id_kegiatan_bidang) },
          data: { pegawai: jsonData }
        });

        console.log(`   ✅ Updated to JSON: ${matchedPegawai.length} pegawai`);
        successCount++;
      } else {
        console.log(`   ⚠️  No matches found - keeping original TEXT`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ⏭️  Already in JSON format: ${skipCount}`);
    console.log(`   ⚠️  No matches (kept TEXT): ${errorCount}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migratePegawaiData();
