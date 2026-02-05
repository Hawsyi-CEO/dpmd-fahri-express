const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('dpmd', 'root', '', { 
  host: 'localhost', 
  dialect: 'mysql',
  logging: false
});

async function resetToPending() {
  try {
    await sequelize.query(`
      UPDATE desa_bankeu_surat 
      SET kecamatan_status = 'pending', 
          kecamatan_reviewed_by = NULL, 
          kecamatan_reviewed_at = NULL 
      WHERE id = 2
    `);
    
    console.log('✅ Surat dikembalikan ke status pending');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetToPending();
