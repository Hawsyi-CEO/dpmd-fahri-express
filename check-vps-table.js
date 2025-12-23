// Script untuk check table structure di VPS via SSH
// Run: ssh root@167.172.93.84 "cd /var/www/dpmd-backend && node check-table-structure.js"

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSuratMasukTable() {
  try {
    console.log('🔍 Checking surat_masuk table structure...\n');
    
    // Check table exists
    const tableCheck = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'surat_masuk'
    `;
    
    console.log('Table exists:', tableCheck[0].count > 0 ? '✅ YES' : '❌ NO');
    
    if (tableCheck[0].count === 0) {
      console.log('\n❌ Table surat_masuk tidak ditemukan di database!');
      console.log('Jalankan migration dulu: npx prisma db push');
      return;
    }
    
    // Get column details
    const columns = await prisma.$queryRaw`
      SELECT 
        COLUMN_NAME,
        COLUMN_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        COLUMN_KEY,
        EXTRA
      FROM 
        INFORMATION_SCHEMA.COLUMNS
      WHERE 
        TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'surat_masuk'
      ORDER BY 
        ORDINAL_POSITION
    `;
    
    console.log('\n📋 Column Structure:');
    console.table(columns);
    
    // Check required columns
    const requiredColumns = [
      'nomor_surat',
      'tanggal_surat',
      'pengirim',
      'perihal',
      'created_by'
    ];
    
    console.log('\n✅ Required Columns Check:');
    requiredColumns.forEach(col => {
      const found = columns.find(c => c.COLUMN_NAME === col);
      const isNullable = found?.IS_NULLABLE === 'YES';
      console.log(`  ${col}: ${found ? '✅' : '❌'} (Nullable: ${isNullable ? '⚠️ YES' : '✅ NO'})`);
    });
    
    // Count existing data
    const count = await prisma.surat_masuk.count();
    console.log(`\n📊 Total surat_masuk records: ${count}`);
    
    // Sample data
    if (count > 0) {
      const sample = await prisma.surat_masuk.findMany({
        take: 3,
        orderBy: { created_at: 'desc' },
        include: {
          users: {
            select: { name: true, role: true }
          }
        }
      });
      
      console.log('\n📄 Sample Data (latest 3):');
      sample.forEach((s, i) => {
        console.log(`\n  ${i + 1}. ${s.nomor_surat}`);
        console.log(`     Pengirim: ${s.pengirim}`);
        console.log(`     Status: ${s.status}`);
        console.log(`     Created by: ${s.users.name} (${s.users.role})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSuratMasukTable();
