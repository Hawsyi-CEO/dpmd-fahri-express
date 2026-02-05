const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dpmd'
  });
  
  // Update file_proposal path to existing file
  const [result] = await conn.query(
    "UPDATE bankeu_proposals SET file_proposal = ? WHERE id = ?",
    ['1770139577804_PBB_SMA_LAKARAJA.pdf', 63]
  );
  
  console.log('Updated rows:', result.affectedRows);
  
  // Verify
  const [rows] = await conn.query('SELECT id, file_proposal FROM bankeu_proposals WHERE id = 63');
  console.log('Result:', rows);
  
  await conn.end();
})();
