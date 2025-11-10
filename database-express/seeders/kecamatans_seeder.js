/**
 * Seeder for table: kecamatans
 * Generated: 2025-11-10T17:06:16.826Z
 * Records: 40
 */

module.exports = {
  tableName: 'kecamatans',
  
  async up(connection) {
    console.log('Seeding kecamatans...');
    
    const data = [
  {
    "id": 1,
    "kode": "32.01.01",
    "nama": "Cibinong",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 2,
    "kode": "32.01.02",
    "nama": "Gunung Putri",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 3,
    "kode": "32.01.03",
    "nama": "Citeureup",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 4,
    "kode": "32.01.04",
    "nama": "Sukaraja",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 5,
    "kode": "32.01.05",
    "nama": "Babakan Madang",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 6,
    "kode": "32.01.06",
    "nama": "Jonggol",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 7,
    "kode": "32.01.07",
    "nama": "Cileungsi",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 8,
    "kode": "32.01.08",
    "nama": "Cariu",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 9,
    "kode": "32.01.09",
    "nama": "Sukamakmur",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 10,
    "kode": "32.01.10",
    "nama": "Parung",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 11,
    "kode": "32.01.11",
    "nama": "Gunung Sindur",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 12,
    "kode": "32.01.12",
    "nama": "Kemang",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 13,
    "kode": "32.01.13",
    "nama": "Bojong Gede",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 14,
    "kode": "32.01.14",
    "nama": "Leuwiliang",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 15,
    "kode": "32.01.15",
    "nama": "Ciampea",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 16,
    "kode": "32.01.16",
    "nama": "Cibungbulang",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 17,
    "kode": "32.01.17",
    "nama": "Pamijahan",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 18,
    "kode": "32.01.18",
    "nama": "Rumpin",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 19,
    "kode": "32.01.19",
    "nama": "Jasinga",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 20,
    "kode": "32.01.20",
    "nama": "Parung Panjang",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 21,
    "kode": "32.01.21",
    "nama": "Nanggung",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 22,
    "kode": "32.01.22",
    "nama": "Cigudeg",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 23,
    "kode": "32.01.23",
    "nama": "Tenjo",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 24,
    "kode": "32.01.24",
    "nama": "Ciawi",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 25,
    "kode": "32.01.25",
    "nama": "Cisarua",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 26,
    "kode": "32.01.26",
    "nama": "Megamendung",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 27,
    "kode": "32.01.27",
    "nama": "Caringin",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 28,
    "kode": "32.01.28",
    "nama": "Cijeruk",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 29,
    "kode": "32.01.29",
    "nama": "Ciomas",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 30,
    "kode": "32.01.30",
    "nama": "Dramaga",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 31,
    "kode": "32.01.31",
    "nama": "Tamansari",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 32,
    "kode": "32.01.32",
    "nama": "Klapanunggal",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 33,
    "kode": "32.01.33",
    "nama": "Ciseeng",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 34,
    "kode": "32.01.34",
    "nama": "Ranca Bungur",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 35,
    "kode": "32.01.35",
    "nama": "Sukajaya",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 36,
    "kode": "32.01.36",
    "nama": "Tanjungsari",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 37,
    "kode": "32.01.37",
    "nama": "Tajurhalang",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 38,
    "kode": "32.01.38",
    "nama": "Cigombong",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 39,
    "kode": "32.01.39",
    "nama": "Leuwisadeng",
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 40,
    "kode": "32.01.40",
    "nama": "Tenjolaya",
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
          'INSERT INTO `kecamatans` SET ? ON DUPLICATE KEY UPDATE ?',
          [row, row]
        );
      } catch (err) {
        console.warn('Skip duplicate:', err.message);
      }
    }
    
    console.log('✅ Seeded 40 records into kecamatans');
  },
  
  async down(connection) {
    console.log('Clearing kecamatans...');
    await connection.query('DELETE FROM `kecamatans`');
    console.log('✅ Cleared kecamatans');
  }
};
