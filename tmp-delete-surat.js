const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    // 1. Get all records with file paths
    const records = await prisma.desa_bankeu_surat.findMany({
      select: { id: true, surat_pengantar: true, surat_permohonan: true }
    });

    console.log(`Found ${records.length} records in desa_bankeu_surat`);

    // 2. Delete physical files
    const storageDir = path.join(__dirname, 'storage/uploads/bankeu');
    let deletedFiles = 0;
    let missingFiles = 0;

    for (const record of records) {
      for (const field of ['surat_pengantar', 'surat_permohonan']) {
        const fileName = record[field];
        if (fileName) {
          const filePath = path.join(storageDir, fileName);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            deletedFiles++;
          } else {
            missingFiles++;
          }
        }
      }
    }

    console.log(`Deleted ${deletedFiles} files, ${missingFiles} files not found on disk`);

    // 3. Delete all records from table
    const result = await prisma.desa_bankeu_surat.deleteMany({});
    console.log(`Deleted ${result.count} records from desa_bankeu_surat`);

    console.log('\nDone! All surat pengantar & permohonan have been cleared.');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
})();
