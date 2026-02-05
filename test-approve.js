const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('dpmd', 'root', '', { 
  host: 'localhost', 
  dialect: 'mysql',
  logging: false
});

async function testApprove() {
  try {
    // Update surat jadi approved
    await sequelize.query(`
      UPDATE desa_bankeu_surat 
      SET kecamatan_status = 'approved', 
          kecamatan_reviewed_by = 1, 
          kecamatan_reviewed_at = NOW() 
      WHERE id = 2
    `);
    
    console.log('✅ Surat ID 2 di-set jadi approved');
    
    // Check result
    const result = await sequelize.query(
      `SELECT * FROM desa_bankeu_surat WHERE id = 2`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    console.log('\nResult:');
    console.log(JSON.stringify(result, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testApprove();
