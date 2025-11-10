/**
 * Seeder for table: roles
 * Generated: 2025-11-10T06:26:43.310Z
 * Records: 5
 */

module.exports = {
  tableName: 'roles',
  
  async up(connection) {
    console.log('Seeding roles...');
    
    const data = [
  {
    "id": 1,
    "name": "superadmin",
    "guard_name": "web",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 2,
    "name": "admin bidang",
    "guard_name": "web",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 3,
    "name": "admin kecamatan",
    "guard_name": "web",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 4,
    "name": "admin desa",
    "guard_name": "web",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 5,
    "name": "admin dinas",
    "guard_name": "web",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  }
];
    
    for (const row of data) {
      // Convert dates
      if (row.created_at) row.created_at = new Date(row.created_at);
      if (row.updated_at) row.updated_at = new Date(row.updated_at);
      
      try {
        await connection.query(
          'INSERT INTO `roles` SET ? ON DUPLICATE KEY UPDATE ?',
          [row, row]
        );
      } catch (err) {
        console.warn('Skip duplicate:', err.message);
      }
    }
    
    console.log('✅ Seeded 5 records into roles');
  },
  
  async down(connection) {
    console.log('Clearing roles...');
    await connection.query('DELETE FROM `roles`');
    console.log('✅ Cleared roles');
  }
};
