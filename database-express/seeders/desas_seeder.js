/**
 * Seeder for table: desas
 * Generated: 2025-11-10T06:26:43.216Z
 * Records: 100
 */

module.exports = {
  tableName: 'desas',
  
  async up(connection) {
    console.log('Seeding desas...');
    
    const data = [
  {
    "id": 1,
    "kecamatan_id": 1,
    "kode": "32.01.01.1001",
    "nama": "Pondok Rajeg",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-09T18:24:59.000Z"
  },
  {
    "id": 2,
    "kecamatan_id": 1,
    "kode": "32.01.01.1002",
    "nama": "Karadenan",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-09T18:24:59.000Z"
  },
  {
    "id": 3,
    "kecamatan_id": 1,
    "kode": "32.01.01.1003",
    "nama": "Harapan Jaya",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-09T18:24:59.000Z"
  },
  {
    "id": 4,
    "kecamatan_id": 1,
    "kode": "32.01.01.1004",
    "nama": "Nanggewer",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-09T18:24:59.000Z"
  },
  {
    "id": 5,
    "kecamatan_id": 1,
    "kode": "32.01.01.1005",
    "nama": "Nanggewer Mekar",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-09T18:24:59.000Z"
  },
  {
    "id": 6,
    "kecamatan_id": 1,
    "kode": "32.01.01.1006",
    "nama": "Cibinong",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-09T18:24:59.000Z"
  },
  {
    "id": 7,
    "kecamatan_id": 1,
    "kode": "32.01.01.1007",
    "nama": "Pakansari",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-09T18:24:59.000Z"
  },
  {
    "id": 8,
    "kecamatan_id": 1,
    "kode": "32.01.01.1008",
    "nama": "Tengah",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-09T18:24:59.000Z"
  },
  {
    "id": 9,
    "kecamatan_id": 1,
    "kode": "32.01.01.1009",
    "nama": "Sukahati",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-09T18:24:59.000Z"
  },
  {
    "id": 10,
    "kecamatan_id": 1,
    "kode": "32.01.01.1010",
    "nama": "Ciriung",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-09T18:24:59.000Z"
  },
  {
    "id": 11,
    "kecamatan_id": 1,
    "kode": "32.01.01.1011",
    "nama": "Cirimekar",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-09T18:24:59.000Z"
  },
  {
    "id": 12,
    "kecamatan_id": 1,
    "kode": "32.01.01.1012",
    "nama": "Pabuaran",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-09T18:24:59.000Z"
  },
  {
    "id": 13,
    "kecamatan_id": 1,
    "kode": "32.01.01.1013",
    "nama": "Pabuaran Mekar",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-09T18:24:59.000Z"
  },
  {
    "id": 14,
    "kecamatan_id": 2,
    "kode": "32.01.02.2001",
    "nama": "Wanaherang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 15,
    "kecamatan_id": 2,
    "kode": "32.01.02.2002",
    "nama": "Bojong Kulur",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 16,
    "kecamatan_id": 2,
    "kode": "32.01.02.2003",
    "nama": "Ciangsana",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 17,
    "kecamatan_id": 2,
    "kode": "32.01.02.2004",
    "nama": "Gunung Putri",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 18,
    "kecamatan_id": 2,
    "kode": "32.01.02.2005",
    "nama": "Bojong Nangka",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 19,
    "kecamatan_id": 2,
    "kode": "32.01.02.2006",
    "nama": "Tlajung Udik",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 20,
    "kecamatan_id": 2,
    "kode": "32.01.02.2007",
    "nama": "Cicadas",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 21,
    "kecamatan_id": 2,
    "kode": "32.01.02.2008",
    "nama": "Cikeas Udik",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 22,
    "kecamatan_id": 2,
    "kode": "32.01.02.2009",
    "nama": "Nagrak",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 23,
    "kecamatan_id": 2,
    "kode": "32.01.02.2010",
    "nama": "Karanggan",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 24,
    "kecamatan_id": 3,
    "kode": "32.01.03.1006",
    "nama": "Puspanegara",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-09T18:24:59.000Z"
  },
  {
    "id": 25,
    "kecamatan_id": 3,
    "kode": "32.01.03.1007",
    "nama": "Karang Asem Barat",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-09T18:24:59.000Z"
  },
  {
    "id": 26,
    "kecamatan_id": 3,
    "kode": "32.01.03.2001",
    "nama": "Puspasari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 27,
    "kecamatan_id": 3,
    "kode": "32.01.03.2002",
    "nama": "Citeureup",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 28,
    "kecamatan_id": 3,
    "kode": "32.01.03.2003",
    "nama": "Leuwinutug",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 29,
    "kecamatan_id": 3,
    "kode": "32.01.03.2004",
    "nama": "Tajur",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 30,
    "kecamatan_id": 3,
    "kode": "32.01.03.2005",
    "nama": "Sanja",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 31,
    "kecamatan_id": 3,
    "kode": "32.01.03.2008",
    "nama": "Karang Asem Timur",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 32,
    "kecamatan_id": 3,
    "kode": "32.01.03.2009",
    "nama": "Tarikolot",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 33,
    "kecamatan_id": 3,
    "kode": "32.01.03.2010",
    "nama": "Gunungsari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 34,
    "kecamatan_id": 3,
    "kode": "32.01.03.2011",
    "nama": "Tangkil",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 35,
    "kecamatan_id": 3,
    "kode": "32.01.03.2012",
    "nama": "Sukahati",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 36,
    "kecamatan_id": 3,
    "kode": "32.01.03.2013",
    "nama": "Hambalang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 37,
    "kecamatan_id": 3,
    "kode": "32.01.03.2014",
    "nama": "Pasirmukti",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 38,
    "kecamatan_id": 4,
    "kode": "32.01.04.2001",
    "nama": "Gununggeulis",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 39,
    "kecamatan_id": 4,
    "kode": "32.01.04.2002",
    "nama": "Cilebut Timur",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 40,
    "kecamatan_id": 4,
    "kode": "32.01.04.2003",
    "nama": "Cilebut Barat",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 41,
    "kecamatan_id": 4,
    "kode": "32.01.04.2004",
    "nama": "Cibanon",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 42,
    "kecamatan_id": 4,
    "kode": "32.01.04.2005",
    "nama": "Nagrak",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 43,
    "kecamatan_id": 4,
    "kode": "32.01.04.2006",
    "nama": "Sukatani",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 44,
    "kecamatan_id": 4,
    "kode": "32.01.04.2007",
    "nama": "Sukaraja",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 45,
    "kecamatan_id": 4,
    "kode": "32.01.04.2008",
    "nama": "Cikeas",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 46,
    "kecamatan_id": 4,
    "kode": "32.01.04.2009",
    "nama": "Pasir Jambu",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 47,
    "kecamatan_id": 4,
    "kode": "32.01.04.2010",
    "nama": "Cimandala",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 48,
    "kecamatan_id": 4,
    "kode": "32.01.04.2011",
    "nama": "Cijujung",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 49,
    "kecamatan_id": 4,
    "kode": "32.01.04.2012",
    "nama": "Cadasngampar",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 50,
    "kecamatan_id": 4,
    "kode": "32.01.04.2013",
    "nama": "Pasirlaja",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 51,
    "kecamatan_id": 5,
    "kode": "32.01.05.2001",
    "nama": "Cijayanti",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 52,
    "kecamatan_id": 5,
    "kode": "32.01.05.2002",
    "nama": "Sumurbatu",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 53,
    "kecamatan_id": 5,
    "kode": "32.01.05.2003",
    "nama": "Sentul",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 54,
    "kecamatan_id": 5,
    "kode": "32.01.05.2004",
    "nama": "Karangtengah",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 55,
    "kecamatan_id": 5,
    "kode": "32.01.05.2005",
    "nama": "Cipambuan",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 56,
    "kecamatan_id": 5,
    "kode": "32.01.05.2006",
    "nama": "Kadumanggu",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 57,
    "kecamatan_id": 5,
    "kode": "32.01.05.2007",
    "nama": "Citaringgul",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 58,
    "kecamatan_id": 5,
    "kode": "32.01.05.2008",
    "nama": "Babakan Madang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 59,
    "kecamatan_id": 5,
    "kode": "32.01.05.2009",
    "nama": "Bojong Koneng",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 60,
    "kecamatan_id": 6,
    "kode": "32.01.06.2001",
    "nama": "Sukamaju",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 61,
    "kecamatan_id": 6,
    "kode": "32.01.06.2002",
    "nama": "Sirnagalih",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 62,
    "kecamatan_id": 6,
    "kode": "32.01.06.2003",
    "nama": "Singajaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 63,
    "kecamatan_id": 6,
    "kode": "32.01.06.2004",
    "nama": "Sukasirna",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 64,
    "kecamatan_id": 6,
    "kode": "32.01.06.2005",
    "nama": "Sukanegara",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 65,
    "kecamatan_id": 6,
    "kode": "32.01.06.2006",
    "nama": "Sukamanah",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 66,
    "kecamatan_id": 6,
    "kode": "32.01.06.2007",
    "nama": "Weninggalih",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 67,
    "kecamatan_id": 6,
    "kode": "32.01.06.2008",
    "nama": "Cibodas",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 68,
    "kecamatan_id": 6,
    "kode": "32.01.06.2009",
    "nama": "Jonggol",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 69,
    "kecamatan_id": 6,
    "kode": "32.01.06.2010",
    "nama": "Bendungan",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 70,
    "kecamatan_id": 6,
    "kode": "32.01.06.2011",
    "nama": "Singasari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 71,
    "kecamatan_id": 6,
    "kode": "32.01.06.2012",
    "nama": "Balekambang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 72,
    "kecamatan_id": 6,
    "kode": "32.01.06.2013",
    "nama": "Sukajaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 73,
    "kecamatan_id": 6,
    "kode": "32.01.06.2014",
    "nama": "Sukagalih",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 74,
    "kecamatan_id": 7,
    "kode": "32.01.07.2001",
    "nama": "Pasirangin",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 75,
    "kecamatan_id": 7,
    "kode": "32.01.07.2002",
    "nama": "Mekarsari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 76,
    "kecamatan_id": 7,
    "kode": "32.01.07.2003",
    "nama": "Mampir",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 77,
    "kecamatan_id": 7,
    "kode": "32.01.07.2004",
    "nama": "Dayeuh",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 78,
    "kecamatan_id": 7,
    "kode": "32.01.07.2005",
    "nama": "Gandoang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 79,
    "kecamatan_id": 7,
    "kode": "32.01.07.2006",
    "nama": "Jatisari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 80,
    "kecamatan_id": 7,
    "kode": "32.01.07.2007",
    "nama": "Cileungsi Kidul",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 81,
    "kecamatan_id": 7,
    "kode": "32.01.07.2008",
    "nama": "Cipeucang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 82,
    "kecamatan_id": 7,
    "kode": "32.01.07.2009",
    "nama": "Situsari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 83,
    "kecamatan_id": 7,
    "kode": "32.01.07.2010",
    "nama": "Cipenjo",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 84,
    "kecamatan_id": 7,
    "kode": "32.01.07.2011",
    "nama": "Limusnunggal",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 85,
    "kecamatan_id": 7,
    "kode": "32.01.07.2012",
    "nama": "Cileungsi",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 86,
    "kecamatan_id": 8,
    "kode": "32.01.08.2001",
    "nama": "Karyamekar",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 87,
    "kecamatan_id": 8,
    "kode": "32.01.08.2002",
    "nama": "Babakanraden",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 88,
    "kecamatan_id": 8,
    "kode": "32.01.08.2003",
    "nama": "Cikutamahi",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 89,
    "kecamatan_id": 8,
    "kode": "32.01.08.2004",
    "nama": "Kutamekar",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 90,
    "kecamatan_id": 8,
    "kode": "32.01.08.2005",
    "nama": "Cariu",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 91,
    "kecamatan_id": 8,
    "kode": "32.01.08.2006",
    "nama": "Mekarwangi",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 92,
    "kecamatan_id": 8,
    "kode": "32.01.08.2007",
    "nama": "Bantarkuning",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 93,
    "kecamatan_id": 8,
    "kode": "32.01.08.2008",
    "nama": "Sukajadi",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 94,
    "kecamatan_id": 8,
    "kode": "32.01.08.2009",
    "nama": "Tegalpanjang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 95,
    "kecamatan_id": 8,
    "kode": "32.01.08.2010",
    "nama": "Cibatutiga",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 96,
    "kecamatan_id": 9,
    "kode": "32.01.09.2001",
    "nama": "Wargajaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 97,
    "kecamatan_id": 9,
    "kode": "32.01.09.2002",
    "nama": "Pabuaran",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 98,
    "kecamatan_id": 9,
    "kode": "32.01.09.2003",
    "nama": "Sukadamai",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 99,
    "kecamatan_id": 9,
    "kode": "32.01.09.2004",
    "nama": "Sukawangi",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T16:31:32.000Z",
    "updated_at": "2025-10-01T16:31:32.000Z"
  },
  {
    "id": 100,
    "kecamatan_id": 9,
    "kode": "32.01.09.2005",
    "nama": "Cibadak",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
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
          'INSERT INTO `desas` SET ? ON DUPLICATE KEY UPDATE ?',
          [row, row]
        );
      } catch (err) {
        console.warn('Skip duplicate:', err.message);
      }
    }
    
    console.log('✅ Seeded 100 records into desas');
  },
  
  async down(connection) {
    console.log('Clearing desas...');
    await connection.query('DELETE FROM `desas`');
    console.log('✅ Cleared desas');
  }
};
