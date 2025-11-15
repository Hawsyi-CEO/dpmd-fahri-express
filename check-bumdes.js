const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'dpmd'
  });
  
  const [tables] = await conn.query("SHOW TABLES LIKE 'bumdes'");
  console.log('Bumdes table exists:', tables.length > 0);
  
  if (tables.length > 0) {
    const [cols] = await conn.query('DESCRIBE bumdes');
    console.log('\nTotal columns:', cols.length);
    console.log('\nFirst 10 columns:');
    cols.slice(0, 10).forEach(c => console.log(`  - ${c.Field} (${c.Type})`));
    
    // Check if id_desa or desa_id exists
    const hasIdDesa = cols.find(c => c.Field === 'id_desa');
    const hasDesaId = cols.find(c => c.Field === 'desa_id');
    console.log('\nField check:');
    console.log('  id_desa exists:', !!hasIdDesa);
    console.log('  desa_id exists:', !!hasDesaId);
  }
  
  await conn.end();
})();
