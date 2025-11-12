const sequelize = require('./src/config/database');

async function testQuery() {
  try {
    console.log('Testing BUMDes query...');
    
    const [results] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Aktif' OR status = 'aktif' THEN 1 ELSE 0 END) as aktif,
        SUM(CASE WHEN status = 'Non-Aktif' OR status = 'tidak aktif' OR status IS NULL THEN 1 ELSE 0 END) as non_aktif
      FROM bumdes
      WHERE deleted_at IS NULL
    `);
    
    console.log('\nQuery Result:');
    console.log(JSON.stringify(results, null, 2));
    
    // Get sample data
    const [samples] = await sequelize.query(`
      SELECT id, namabumdesa, status, kecamatan, desa
      FROM bumdes
      WHERE deleted_at IS NULL
      LIMIT 5
    `);
    
    console.log('\nSample BUMDes data:');
    console.log(JSON.stringify(samples, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testQuery();
