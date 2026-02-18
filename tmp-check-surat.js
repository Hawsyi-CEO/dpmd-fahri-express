const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const count = await prisma.desa_bankeu_surat.count();
    const records = await prisma.desa_bankeu_surat.findMany({
      select: {
        id: true, desa_id: true, tahun: true,
        surat_pengantar: true, surat_permohonan: true,
        submitted_to_kecamatan: true, kecamatan_status: true
      }
    });
    console.log('Total records:', count);
    console.log(JSON.stringify(records.slice(0, 15), (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));
    if (count > 15) console.log('... and', count - 15, 'more');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
