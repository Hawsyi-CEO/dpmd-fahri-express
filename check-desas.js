const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'dpmd'
  });
  
  console.log('=== DESAS TABLE ===');
  const [desasCols] = await conn.query('DESCRIBE desas');
  console.log('Primary key field:', desasCols.find(c => c.Key === 'PRI')?.Field);
  console.log('\nAll columns:');
  desasCols.forEach(c => {
    if (c.Key) console.log(`  - ${c.Field} (${c.Type}) [${c.Key}]`);
    else console.log(`  - ${c.Field} (${c.Type})`);
  });
  
  console.log('\n=== BUMDES TABLE ===');
  const [bumdesCols] = await conn.query('DESCRIBE bumdes');
  const desaField = bumdesCols.find(c => c.Field.includes('desa') && c.Field !== 'desa' && c.Field !== 'kode_desa');
  console.log('Desa foreign key field:', desaField?.Field);
  
  console.log('\n=== RWS TABLE (Kelembagaan) ===');
  const [rwsCols] = await conn.query('DESCRIBE rws');
  const rwsDesaField = rwsCols.find(c => c.Field.includes('desa') && c.Field !== 'kode_desa');
  console.log('Desa foreign key field:', rwsDesaField?.Field);
  
  await conn.end();
})();
