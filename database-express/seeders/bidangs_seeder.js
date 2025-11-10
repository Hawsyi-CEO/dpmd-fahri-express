/**
 * Seeder for table: bidangs
 * Generated: 2025-11-10T06:26:43.233Z
 * Records: 8
 */

module.exports = {
  tableName: 'bidangs',
  
  async up(connection) {
    console.log('Seeding bidangs...');
    
    const data = [
  {
    "id": 2,
    "nama": "Sekretariat",
    "created_at": "2025-10-01T23:44:16.000Z",
    "updated_at": "2025-10-01T23:44:16.000Z"
  },
  {
    "id": 3,
    "nama": "Sarana Prasarana Kewilayahan dan Ekonomi Desa",
    "created_at": "2025-10-01T23:44:16.000Z",
    "updated_at": "2025-10-01T23:44:16.000Z"
  },
  {
    "id": 4,
    "nama": "Kekayaan dan Keuangan Desa",
    "created_at": "2025-10-01T23:44:16.000Z",
    "updated_at": "2025-10-01T23:44:16.000Z"
  },
  {
    "id": 5,
    "nama": "Pemberdayaan Masyarakat Desa",
    "created_at": "2025-10-01T23:44:16.000Z",
    "updated_at": "2025-10-01T23:44:16.000Z"
  },
  {
    "id": 6,
    "nama": "Pemerintahan Desa",
    "created_at": "2025-10-01T23:44:16.000Z",
    "updated_at": "2025-10-01T23:44:16.000Z"
  },
  {
    "id": 7,
    "nama": "Tenaga Alih Daya",
    "created_at": "2025-10-01T23:44:16.000Z",
    "updated_at": "2025-10-01T23:44:16.000Z"
  },
  {
    "id": 8,
    "nama": "Tenaga Keamanan",
    "created_at": "2025-10-01T23:44:16.000Z",
    "updated_at": "2025-10-01T23:44:16.000Z"
  },
  {
    "id": 9,
    "nama": "Tenaga Kebersihan",
    "created_at": "2025-10-01T23:44:16.000Z",
    "updated_at": "2025-10-01T23:44:16.000Z"
  }
];
    
    for (const row of data) {
      // Convert dates
      if (row.created_at) row.created_at = new Date(row.created_at);
      if (row.updated_at) row.updated_at = new Date(row.updated_at);
      
      try {
        await connection.query(
          'INSERT INTO `bidangs` SET ? ON DUPLICATE KEY UPDATE ?',
          [row, row]
        );
      } catch (err) {
        console.warn('Skip duplicate:', err.message);
      }
    }
    
    console.log('✅ Seeded 8 records into bidangs');
  },
  
  async down(connection) {
    console.log('Clearing bidangs...');
    await connection.query('DELETE FROM `bidangs`');
    console.log('✅ Cleared bidangs');
  }
};
