const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Cek apakah sudah ada data Desa Siaga
  console.log('=== Cek data Desa Siaga yang ada ===');
  const existing = await prisma.bankeu_master_kegiatan.findMany({
    where: { 
      nama_kegiatan: { contains: 'Desa Siaga' }
    }
  });
  console.log('Data existing:', existing.length);
  
  if (existing.length > 0) {
    console.log('Data Desa Siaga sudah ada:');
    existing.forEach(x => console.log(`- ${x.nama_kegiatan} -> ${x.dinas_terkait}`));
    console.log('\nTidak perlu menambah data baru.');
    return;
  }

  // Tambah 3 kegiatan baru
  console.log('\n=== Menambah 3 kegiatan Desa Siaga ===');
  
  const kegiatan1 = await prisma.bankeu_master_kegiatan.create({
    data: {
      jenis_kegiatan: 'non_infrastruktur',
      urutan: 5,
      nama_kegiatan: 'Desa Siaga: TBC',
      dinas_terkait: 'DINKES',
      is_active: true,
      created_at: new Date(),
    }
  });
  console.log('Created:', kegiatan1.nama_kegiatan, '->', kegiatan1.dinas_terkait);

  const kegiatan2 = await prisma.bankeu_master_kegiatan.create({
    data: {
      jenis_kegiatan: 'non_infrastruktur',
      urutan: 14,
      nama_kegiatan: 'Desa Siaga: Kampung Siaga Bencana',
      dinas_terkait: 'DINSOS',
      is_active: true,
      created_at: new Date(),
    }
  });
  console.log('Created:', kegiatan2.nama_kegiatan, '->', kegiatan2.dinas_terkait);

  const kegiatan3 = await prisma.bankeu_master_kegiatan.create({
    data: {
      jenis_kegiatan: 'non_infrastruktur',
      urutan: 15,
      nama_kegiatan: 'Desa Siaga: DESTANA',
      dinas_terkait: 'BPBD',
      is_active: true,
      created_at: new Date(),
    }
  });
  console.log('Created:', kegiatan3.nama_kegiatan, '->', kegiatan3.dinas_terkait);

  console.log('\n=== Hasil akhir ===');
  const result = await prisma.bankeu_master_kegiatan.findMany({
    where: { nama_kegiatan: { contains: 'Desa Siaga' } }
  });
  result.forEach(x => console.log(`${x.id}. ${x.nama_kegiatan} -> ${x.dinas_terkait}`));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
