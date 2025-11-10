/**
 * Seeder for table: desas
 * Generated: 2025-11-10T17:06:16.830Z
 * Records: 435
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
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-09T11:24:59.000Z"
  },
  {
    "id": 2,
    "kecamatan_id": 1,
    "kode": "32.01.01.1002",
    "nama": "Karadenan",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-09T11:24:59.000Z"
  },
  {
    "id": 3,
    "kecamatan_id": 1,
    "kode": "32.01.01.1003",
    "nama": "Harapan Jaya",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-09T11:24:59.000Z"
  },
  {
    "id": 4,
    "kecamatan_id": 1,
    "kode": "32.01.01.1004",
    "nama": "Nanggewer",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-09T11:24:59.000Z"
  },
  {
    "id": 5,
    "kecamatan_id": 1,
    "kode": "32.01.01.1005",
    "nama": "Nanggewer Mekar",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-09T11:24:59.000Z"
  },
  {
    "id": 6,
    "kecamatan_id": 1,
    "kode": "32.01.01.1006",
    "nama": "Cibinong",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-09T11:24:59.000Z"
  },
  {
    "id": 7,
    "kecamatan_id": 1,
    "kode": "32.01.01.1007",
    "nama": "Pakansari",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-09T11:24:59.000Z"
  },
  {
    "id": 8,
    "kecamatan_id": 1,
    "kode": "32.01.01.1008",
    "nama": "Tengah",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-09T11:24:59.000Z"
  },
  {
    "id": 9,
    "kecamatan_id": 1,
    "kode": "32.01.01.1009",
    "nama": "Sukahati",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-09T11:24:59.000Z"
  },
  {
    "id": 10,
    "kecamatan_id": 1,
    "kode": "32.01.01.1010",
    "nama": "Ciriung",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-09T11:24:59.000Z"
  },
  {
    "id": 11,
    "kecamatan_id": 1,
    "kode": "32.01.01.1011",
    "nama": "Cirimekar",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-09T11:24:59.000Z"
  },
  {
    "id": 12,
    "kecamatan_id": 1,
    "kode": "32.01.01.1012",
    "nama": "Pabuaran",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-09T11:24:59.000Z"
  },
  {
    "id": 13,
    "kecamatan_id": 1,
    "kode": "32.01.01.1013",
    "nama": "Pabuaran Mekar",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-09T11:24:59.000Z"
  },
  {
    "id": 14,
    "kecamatan_id": 2,
    "kode": "32.01.02.2001",
    "nama": "Wanaherang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 15,
    "kecamatan_id": 2,
    "kode": "32.01.02.2002",
    "nama": "Bojong Kulur",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 16,
    "kecamatan_id": 2,
    "kode": "32.01.02.2003",
    "nama": "Ciangsana",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 17,
    "kecamatan_id": 2,
    "kode": "32.01.02.2004",
    "nama": "Gunung Putri",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 18,
    "kecamatan_id": 2,
    "kode": "32.01.02.2005",
    "nama": "Bojong Nangka",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 19,
    "kecamatan_id": 2,
    "kode": "32.01.02.2006",
    "nama": "Tlajung Udik",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 20,
    "kecamatan_id": 2,
    "kode": "32.01.02.2007",
    "nama": "Cicadas",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 21,
    "kecamatan_id": 2,
    "kode": "32.01.02.2008",
    "nama": "Cikeas Udik",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 22,
    "kecamatan_id": 2,
    "kode": "32.01.02.2009",
    "nama": "Nagrak",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 23,
    "kecamatan_id": 2,
    "kode": "32.01.02.2010",
    "nama": "Karanggan",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 24,
    "kecamatan_id": 3,
    "kode": "32.01.03.1006",
    "nama": "Puspanegara",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-09T11:24:59.000Z"
  },
  {
    "id": 25,
    "kecamatan_id": 3,
    "kode": "32.01.03.1007",
    "nama": "Karang Asem Barat",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-09T11:24:59.000Z"
  },
  {
    "id": 26,
    "kecamatan_id": 3,
    "kode": "32.01.03.2001",
    "nama": "Puspasari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 27,
    "kecamatan_id": 3,
    "kode": "32.01.03.2002",
    "nama": "Citeureup",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 28,
    "kecamatan_id": 3,
    "kode": "32.01.03.2003",
    "nama": "Leuwinutug",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 29,
    "kecamatan_id": 3,
    "kode": "32.01.03.2004",
    "nama": "Tajur",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 30,
    "kecamatan_id": 3,
    "kode": "32.01.03.2005",
    "nama": "Sanja",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 31,
    "kecamatan_id": 3,
    "kode": "32.01.03.2008",
    "nama": "Karang Asem Timur",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 32,
    "kecamatan_id": 3,
    "kode": "32.01.03.2009",
    "nama": "Tarikolot",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 33,
    "kecamatan_id": 3,
    "kode": "32.01.03.2010",
    "nama": "Gunungsari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 34,
    "kecamatan_id": 3,
    "kode": "32.01.03.2011",
    "nama": "Tangkil",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 35,
    "kecamatan_id": 3,
    "kode": "32.01.03.2012",
    "nama": "Sukahati",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 36,
    "kecamatan_id": 3,
    "kode": "32.01.03.2013",
    "nama": "Hambalang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 37,
    "kecamatan_id": 3,
    "kode": "32.01.03.2014",
    "nama": "Pasirmukti",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 38,
    "kecamatan_id": 4,
    "kode": "32.01.04.2001",
    "nama": "Gununggeulis",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 39,
    "kecamatan_id": 4,
    "kode": "32.01.04.2002",
    "nama": "Cilebut Timur",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 40,
    "kecamatan_id": 4,
    "kode": "32.01.04.2003",
    "nama": "Cilebut Barat",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 41,
    "kecamatan_id": 4,
    "kode": "32.01.04.2004",
    "nama": "Cibanon",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 42,
    "kecamatan_id": 4,
    "kode": "32.01.04.2005",
    "nama": "Nagrak",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 43,
    "kecamatan_id": 4,
    "kode": "32.01.04.2006",
    "nama": "Sukatani",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 44,
    "kecamatan_id": 4,
    "kode": "32.01.04.2007",
    "nama": "Sukaraja",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 45,
    "kecamatan_id": 4,
    "kode": "32.01.04.2008",
    "nama": "Cikeas",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 46,
    "kecamatan_id": 4,
    "kode": "32.01.04.2009",
    "nama": "Pasir Jambu",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 47,
    "kecamatan_id": 4,
    "kode": "32.01.04.2010",
    "nama": "Cimandala",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 48,
    "kecamatan_id": 4,
    "kode": "32.01.04.2011",
    "nama": "Cijujung",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 49,
    "kecamatan_id": 4,
    "kode": "32.01.04.2012",
    "nama": "Cadasngampar",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 50,
    "kecamatan_id": 4,
    "kode": "32.01.04.2013",
    "nama": "Pasirlaja",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 51,
    "kecamatan_id": 5,
    "kode": "32.01.05.2001",
    "nama": "Cijayanti",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 52,
    "kecamatan_id": 5,
    "kode": "32.01.05.2002",
    "nama": "Sumurbatu",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 53,
    "kecamatan_id": 5,
    "kode": "32.01.05.2003",
    "nama": "Sentul",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 54,
    "kecamatan_id": 5,
    "kode": "32.01.05.2004",
    "nama": "Karangtengah",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 55,
    "kecamatan_id": 5,
    "kode": "32.01.05.2005",
    "nama": "Cipambuan",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 56,
    "kecamatan_id": 5,
    "kode": "32.01.05.2006",
    "nama": "Kadumanggu",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 57,
    "kecamatan_id": 5,
    "kode": "32.01.05.2007",
    "nama": "Citaringgul",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 58,
    "kecamatan_id": 5,
    "kode": "32.01.05.2008",
    "nama": "Babakan Madang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 59,
    "kecamatan_id": 5,
    "kode": "32.01.05.2009",
    "nama": "Bojong Koneng",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 60,
    "kecamatan_id": 6,
    "kode": "32.01.06.2001",
    "nama": "Sukamaju",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 61,
    "kecamatan_id": 6,
    "kode": "32.01.06.2002",
    "nama": "Sirnagalih",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 62,
    "kecamatan_id": 6,
    "kode": "32.01.06.2003",
    "nama": "Singajaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 63,
    "kecamatan_id": 6,
    "kode": "32.01.06.2004",
    "nama": "Sukasirna",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 64,
    "kecamatan_id": 6,
    "kode": "32.01.06.2005",
    "nama": "Sukanegara",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 65,
    "kecamatan_id": 6,
    "kode": "32.01.06.2006",
    "nama": "Sukamanah",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 66,
    "kecamatan_id": 6,
    "kode": "32.01.06.2007",
    "nama": "Weninggalih",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 67,
    "kecamatan_id": 6,
    "kode": "32.01.06.2008",
    "nama": "Cibodas",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 68,
    "kecamatan_id": 6,
    "kode": "32.01.06.2009",
    "nama": "Jonggol",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 69,
    "kecamatan_id": 6,
    "kode": "32.01.06.2010",
    "nama": "Bendungan",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 70,
    "kecamatan_id": 6,
    "kode": "32.01.06.2011",
    "nama": "Singasari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 71,
    "kecamatan_id": 6,
    "kode": "32.01.06.2012",
    "nama": "Balekambang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 72,
    "kecamatan_id": 6,
    "kode": "32.01.06.2013",
    "nama": "Sukajaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 73,
    "kecamatan_id": 6,
    "kode": "32.01.06.2014",
    "nama": "Sukagalih",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 74,
    "kecamatan_id": 7,
    "kode": "32.01.07.2001",
    "nama": "Pasirangin",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 75,
    "kecamatan_id": 7,
    "kode": "32.01.07.2002",
    "nama": "Mekarsari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 76,
    "kecamatan_id": 7,
    "kode": "32.01.07.2003",
    "nama": "Mampir",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 77,
    "kecamatan_id": 7,
    "kode": "32.01.07.2004",
    "nama": "Dayeuh",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 78,
    "kecamatan_id": 7,
    "kode": "32.01.07.2005",
    "nama": "Gandoang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 79,
    "kecamatan_id": 7,
    "kode": "32.01.07.2006",
    "nama": "Jatisari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 80,
    "kecamatan_id": 7,
    "kode": "32.01.07.2007",
    "nama": "Cileungsi Kidul",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 81,
    "kecamatan_id": 7,
    "kode": "32.01.07.2008",
    "nama": "Cipeucang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 82,
    "kecamatan_id": 7,
    "kode": "32.01.07.2009",
    "nama": "Situsari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 83,
    "kecamatan_id": 7,
    "kode": "32.01.07.2010",
    "nama": "Cipenjo",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 84,
    "kecamatan_id": 7,
    "kode": "32.01.07.2011",
    "nama": "Limusnunggal",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 85,
    "kecamatan_id": 7,
    "kode": "32.01.07.2012",
    "nama": "Cileungsi",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 86,
    "kecamatan_id": 8,
    "kode": "32.01.08.2001",
    "nama": "Karyamekar",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 87,
    "kecamatan_id": 8,
    "kode": "32.01.08.2002",
    "nama": "Babakanraden",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 88,
    "kecamatan_id": 8,
    "kode": "32.01.08.2003",
    "nama": "Cikutamahi",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 89,
    "kecamatan_id": 8,
    "kode": "32.01.08.2004",
    "nama": "Kutamekar",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 90,
    "kecamatan_id": 8,
    "kode": "32.01.08.2005",
    "nama": "Cariu",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 91,
    "kecamatan_id": 8,
    "kode": "32.01.08.2006",
    "nama": "Mekarwangi",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 92,
    "kecamatan_id": 8,
    "kode": "32.01.08.2007",
    "nama": "Bantarkuning",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 93,
    "kecamatan_id": 8,
    "kode": "32.01.08.2008",
    "nama": "Sukajadi",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 94,
    "kecamatan_id": 8,
    "kode": "32.01.08.2009",
    "nama": "Tegalpanjang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 95,
    "kecamatan_id": 8,
    "kode": "32.01.08.2010",
    "nama": "Cibatutiga",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 96,
    "kecamatan_id": 9,
    "kode": "32.01.09.2001",
    "nama": "Wargajaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 97,
    "kecamatan_id": 9,
    "kode": "32.01.09.2002",
    "nama": "Pabuaran",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 98,
    "kecamatan_id": 9,
    "kode": "32.01.09.2003",
    "nama": "Sukadamai",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 99,
    "kecamatan_id": 9,
    "kode": "32.01.09.2004",
    "nama": "Sukawangi",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 100,
    "kecamatan_id": 9,
    "kode": "32.01.09.2005",
    "nama": "Cibadak",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 101,
    "kecamatan_id": 9,
    "kode": "32.01.09.2006",
    "nama": "Sukaresmi",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 102,
    "kecamatan_id": 9,
    "kode": "32.01.09.2007",
    "nama": "Sukamulya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 103,
    "kecamatan_id": 9,
    "kode": "32.01.09.2008",
    "nama": "Sukaharja",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 104,
    "kecamatan_id": 9,
    "kode": "32.01.09.2009",
    "nama": "Sirnajaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 105,
    "kecamatan_id": 9,
    "kode": "32.01.09.2010",
    "nama": "Sukamakmur",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 106,
    "kecamatan_id": 10,
    "kode": "32.01.10.2001",
    "nama": "Parung",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 107,
    "kecamatan_id": 10,
    "kode": "32.01.10.2002",
    "nama": "Iwul",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 108,
    "kecamatan_id": 10,
    "kode": "32.01.10.2003",
    "nama": "Bojongsempu",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 109,
    "kecamatan_id": 10,
    "kode": "32.01.10.2004",
    "nama": "Waru",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 110,
    "kecamatan_id": 10,
    "kode": "32.01.10.2005",
    "nama": "Cogreg",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 111,
    "kecamatan_id": 10,
    "kode": "32.01.10.2006",
    "nama": "Pamegarsari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 112,
    "kecamatan_id": 10,
    "kode": "32.01.10.2007",
    "nama": "Warujaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 113,
    "kecamatan_id": 10,
    "kode": "32.01.10.2008",
    "nama": "Bojongindah",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 114,
    "kecamatan_id": 10,
    "kode": "32.01.10.2009",
    "nama": "Jabonmekar",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 115,
    "kecamatan_id": 11,
    "kode": "32.01.11.2001",
    "nama": "Cidokom",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 116,
    "kecamatan_id": 11,
    "kode": "32.01.11.2002",
    "nama": "Padurenan",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 117,
    "kecamatan_id": 11,
    "kode": "32.01.11.2003",
    "nama": "Pengasinan",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 118,
    "kecamatan_id": 11,
    "kode": "32.01.11.2004",
    "nama": "Curug",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 119,
    "kecamatan_id": 11,
    "kode": "32.01.11.2005",
    "nama": "Gunungsindur",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 120,
    "kecamatan_id": 11,
    "kode": "32.01.11.2006",
    "nama": "Jampang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 121,
    "kecamatan_id": 11,
    "kode": "32.01.11.2007",
    "nama": "Cibadung",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 122,
    "kecamatan_id": 11,
    "kode": "32.01.11.2008",
    "nama": "Cibinong",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 123,
    "kecamatan_id": 11,
    "kode": "32.01.11.2009",
    "nama": "Rawakalong",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 124,
    "kecamatan_id": 11,
    "kode": "32.01.11.2010",
    "nama": "Pabuaran",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 125,
    "kecamatan_id": 12,
    "kode": "32.01.12.1006",
    "nama": "Atang Senjaya",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-09T11:24:59.000Z"
  },
  {
    "id": 126,
    "kecamatan_id": 12,
    "kode": "32.01.12.2001",
    "nama": "Bojong",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 127,
    "kecamatan_id": 12,
    "kode": "32.01.12.2002",
    "nama": "Parakanjaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 128,
    "kecamatan_id": 12,
    "kode": "32.01.12.2003",
    "nama": "Kemang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 129,
    "kecamatan_id": 12,
    "kode": "32.01.12.2004",
    "nama": "Pabuaran",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 130,
    "kecamatan_id": 12,
    "kode": "32.01.12.2005",
    "nama": "Semplak Barat",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 131,
    "kecamatan_id": 12,
    "kode": "32.01.12.2007",
    "nama": "Jampang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 132,
    "kecamatan_id": 12,
    "kode": "32.01.12.2008",
    "nama": "Pondok Udik",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 133,
    "kecamatan_id": 12,
    "kode": "32.01.12.2009",
    "nama": "Tegal",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 134,
    "kecamatan_id": 13,
    "kode": "32.01.13.1007",
    "nama": "Pabuaran",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-09T11:24:59.000Z"
  },
  {
    "id": 135,
    "kecamatan_id": 13,
    "kode": "32.01.13.2001",
    "nama": "Bojongbaru",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 136,
    "kecamatan_id": 13,
    "kode": "32.01.13.2002",
    "nama": "Cimanggis",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 137,
    "kecamatan_id": 13,
    "kode": "32.01.13.2003",
    "nama": "Susukan",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 138,
    "kecamatan_id": 13,
    "kode": "32.01.13.2004",
    "nama": "Ragajaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 139,
    "kecamatan_id": 13,
    "kode": "32.01.13.2005",
    "nama": "Kedungwaringin",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 140,
    "kecamatan_id": 13,
    "kode": "32.01.13.2006",
    "nama": "Waringinjaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 141,
    "kecamatan_id": 13,
    "kode": "32.01.13.2008",
    "nama": "Rawapanjang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 142,
    "kecamatan_id": 13,
    "kode": "32.01.13.2009",
    "nama": "Bojonggede",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 143,
    "kecamatan_id": 14,
    "kode": "32.01.14.2001",
    "nama": "Leuwiliang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 144,
    "kecamatan_id": 14,
    "kode": "32.01.14.2002",
    "nama": "Purasari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 145,
    "kecamatan_id": 14,
    "kode": "32.01.14.2003",
    "nama": "Karyasari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 146,
    "kecamatan_id": 14,
    "kode": "32.01.14.2004",
    "nama": "Pabangbon",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 147,
    "kecamatan_id": 14,
    "kode": "32.01.14.2005",
    "nama": "Karacak",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 148,
    "kecamatan_id": 14,
    "kode": "32.01.14.2006",
    "nama": "Barengkok",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 149,
    "kecamatan_id": 14,
    "kode": "32.01.14.2007",
    "nama": "Leuwimekar",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 150,
    "kecamatan_id": 14,
    "kode": "32.01.14.2008",
    "nama": "Puraseda",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 151,
    "kecamatan_id": 14,
    "kode": "32.01.14.2009",
    "nama": "Cibeber I",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 152,
    "kecamatan_id": 14,
    "kode": "32.01.14.2010",
    "nama": "Cibeber II",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 153,
    "kecamatan_id": 14,
    "kode": "32.01.14.2011",
    "nama": "Karehkel",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 154,
    "kecamatan_id": 15,
    "kode": "32.01.15.2001",
    "nama": "Ciampea",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 155,
    "kecamatan_id": 15,
    "kode": "32.01.15.2002",
    "nama": "Cinangka",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 156,
    "kecamatan_id": 15,
    "kode": "32.01.15.2003",
    "nama": "Cihideungudik",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 157,
    "kecamatan_id": 15,
    "kode": "32.01.15.2004",
    "nama": "Bojongjengkol",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 158,
    "kecamatan_id": 15,
    "kode": "32.01.15.2005",
    "nama": "Tegalwaru",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 159,
    "kecamatan_id": 15,
    "kode": "32.01.15.2006",
    "nama": "Cibuntu",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 160,
    "kecamatan_id": 15,
    "kode": "32.01.15.2007",
    "nama": "Cicadas",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 161,
    "kecamatan_id": 15,
    "kode": "32.01.15.2008",
    "nama": "Cibadak",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 162,
    "kecamatan_id": 15,
    "kode": "32.01.15.2009",
    "nama": "Bojongrangkas",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 163,
    "kecamatan_id": 15,
    "kode": "32.01.15.2010",
    "nama": "Cihideunghilir",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 164,
    "kecamatan_id": 15,
    "kode": "32.01.15.2011",
    "nama": "Cibanteng",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 165,
    "kecamatan_id": 15,
    "kode": "32.01.15.2012",
    "nama": "Benteng",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 166,
    "kecamatan_id": 15,
    "kode": "32.01.15.2013",
    "nama": "Ciampea Udik",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 167,
    "kecamatan_id": 16,
    "kode": "32.01.16.2001",
    "nama": "Situ Udik",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 168,
    "kecamatan_id": 16,
    "kode": "32.01.16.2002",
    "nama": "Situ Ilir",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 169,
    "kecamatan_id": 16,
    "kode": "32.01.16.2003",
    "nama": "Cemplang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 170,
    "kecamatan_id": 16,
    "kode": "32.01.16.2004",
    "nama": "Cibatok I",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 171,
    "kecamatan_id": 16,
    "kode": "32.01.16.2005",
    "nama": "Ciaruteun Udik",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 172,
    "kecamatan_id": 16,
    "kode": "32.01.16.2006",
    "nama": "Leuweungkolot",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 173,
    "kecamatan_id": 16,
    "kode": "32.01.16.2007",
    "nama": "Cimanggu I",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 174,
    "kecamatan_id": 16,
    "kode": "32.01.16.2008",
    "nama": "Cimanggu II",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 175,
    "kecamatan_id": 16,
    "kode": "32.01.16.2009",
    "nama": "Dukuh",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 176,
    "kecamatan_id": 16,
    "kode": "32.01.16.2010",
    "nama": "Cijujung",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 177,
    "kecamatan_id": 16,
    "kode": "32.01.16.2011",
    "nama": "Ciaruteun Ilir",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 178,
    "kecamatan_id": 16,
    "kode": "32.01.16.2012",
    "nama": "Cibatok II",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 179,
    "kecamatan_id": 16,
    "kode": "32.01.16.2013",
    "nama": "Sukamaju",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 180,
    "kecamatan_id": 16,
    "kode": "32.01.16.2014",
    "nama": "Galuga",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 181,
    "kecamatan_id": 16,
    "kode": "32.01.16.2015",
    "nama": "Girimulya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 182,
    "kecamatan_id": 17,
    "kode": "32.01.17.2001",
    "nama": "Purwabakti",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 183,
    "kecamatan_id": 17,
    "kode": "32.01.17.2002",
    "nama": "Cibunian",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 184,
    "kecamatan_id": 17,
    "kode": "32.01.17.2003",
    "nama": "Cibitungwetan",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 185,
    "kecamatan_id": 17,
    "kode": "32.01.17.2004",
    "nama": "Gunungmenyan",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 186,
    "kecamatan_id": 17,
    "kode": "32.01.17.2005",
    "nama": "Gunungbunder II",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 187,
    "kecamatan_id": 17,
    "kode": "32.01.17.2006",
    "nama": "Pasarean",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 188,
    "kecamatan_id": 17,
    "kode": "32.01.17.2007",
    "nama": "Cimayang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 189,
    "kecamatan_id": 17,
    "kode": "32.01.17.2008",
    "nama": "Pamijahan",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 190,
    "kecamatan_id": 17,
    "kode": "32.01.17.2009",
    "nama": "Cibening",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 191,
    "kecamatan_id": 17,
    "kode": "32.01.17.2010",
    "nama": "Gunungbunder I",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 192,
    "kecamatan_id": 17,
    "kode": "32.01.17.2011",
    "nama": "Cibitung Kulon",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 193,
    "kecamatan_id": 17,
    "kode": "32.01.17.2012",
    "nama": "Gunung Picung",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 194,
    "kecamatan_id": 17,
    "kode": "32.01.17.2013",
    "nama": "Ciasihan",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 195,
    "kecamatan_id": 17,
    "kode": "32.01.17.2014",
    "nama": "Gunungsari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 196,
    "kecamatan_id": 17,
    "kode": "32.01.17.2015",
    "nama": "Ciasmara",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 197,
    "kecamatan_id": 18,
    "kode": "32.01.18.2001",
    "nama": "Rumpin",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 198,
    "kecamatan_id": 18,
    "kode": "32.01.18.2002",
    "nama": "Leuwibatu",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 199,
    "kecamatan_id": 18,
    "kode": "32.01.18.2003",
    "nama": "Cidokom",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 200,
    "kecamatan_id": 18,
    "kode": "32.01.18.2004",
    "nama": "Gobang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 201,
    "kecamatan_id": 18,
    "kode": "32.01.18.2005",
    "nama": "Cibodas",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 202,
    "kecamatan_id": 18,
    "kode": "32.01.18.2006",
    "nama": "Rabak",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 203,
    "kecamatan_id": 18,
    "kode": "32.01.18.2007",
    "nama": "Kampungsawah",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 204,
    "kecamatan_id": 18,
    "kode": "32.01.18.2008",
    "nama": "Cipinang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 205,
    "kecamatan_id": 18,
    "kode": "32.01.18.2009",
    "nama": "Sukasari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 206,
    "kecamatan_id": 18,
    "kode": "32.01.18.2010",
    "nama": "Tamansari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 207,
    "kecamatan_id": 18,
    "kode": "32.01.18.2011",
    "nama": "Kertajaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 208,
    "kecamatan_id": 18,
    "kode": "32.01.18.2012",
    "nama": "Sukamulya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 209,
    "kecamatan_id": 18,
    "kode": "32.01.18.2013",
    "nama": "Mekarsari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 210,
    "kecamatan_id": 18,
    "kode": "32.01.18.2014",
    "nama": "Mekarjaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 211,
    "kecamatan_id": 19,
    "kode": "32.01.19.2001",
    "nama": "Curug",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 212,
    "kecamatan_id": 19,
    "kode": "32.01.19.2002",
    "nama": "Pangradin",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 213,
    "kecamatan_id": 19,
    "kode": "32.01.19.2003",
    "nama": "Kalongsawah",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 214,
    "kecamatan_id": 19,
    "kode": "32.01.19.2004",
    "nama": "Sipak",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 215,
    "kecamatan_id": 19,
    "kode": "32.01.19.2005",
    "nama": "Jasinga",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 216,
    "kecamatan_id": 19,
    "kode": "32.01.19.2006",
    "nama": "Koleang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 217,
    "kecamatan_id": 19,
    "kode": "32.01.19.2007",
    "nama": "Cikopomayak",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 218,
    "kecamatan_id": 19,
    "kode": "32.01.19.2008",
    "nama": "Setu",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 219,
    "kecamatan_id": 19,
    "kode": "32.01.19.2009",
    "nama": "Barengkok",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 220,
    "kecamatan_id": 19,
    "kode": "32.01.19.2010",
    "nama": "Bagoang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 221,
    "kecamatan_id": 19,
    "kode": "32.01.19.2011",
    "nama": "Pangaur",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 222,
    "kecamatan_id": 19,
    "kode": "32.01.19.2012",
    "nama": "Pamagersari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 223,
    "kecamatan_id": 19,
    "kode": "32.01.19.2013",
    "nama": "Jugala Jaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 224,
    "kecamatan_id": 19,
    "kode": "32.01.19.2014",
    "nama": "Tegalwangi",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 225,
    "kecamatan_id": 19,
    "kode": "32.01.19.2015",
    "nama": "Neglasari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 226,
    "kecamatan_id": 19,
    "kode": "32.01.19.2016",
    "nama": "Wirajaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 227,
    "kecamatan_id": 20,
    "kode": "32.01.20.2001",
    "nama": "Jagabaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 228,
    "kecamatan_id": 20,
    "kode": "32.01.20.2002",
    "nama": "Gorowong",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 229,
    "kecamatan_id": 20,
    "kode": "32.01.20.2003",
    "nama": "Dago",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 230,
    "kecamatan_id": 20,
    "kode": "32.01.20.2004",
    "nama": "Pingku",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 231,
    "kecamatan_id": 20,
    "kode": "32.01.20.2005",
    "nama": "Cikuda",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 232,
    "kecamatan_id": 20,
    "kode": "32.01.20.2006",
    "nama": "Parungpanjang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 233,
    "kecamatan_id": 20,
    "kode": "32.01.20.2007",
    "nama": "Lumpang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 234,
    "kecamatan_id": 20,
    "kode": "32.01.20.2008",
    "nama": "Cibunar",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 235,
    "kecamatan_id": 20,
    "kode": "32.01.20.2009",
    "nama": "Jagabita",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 236,
    "kecamatan_id": 20,
    "kode": "32.01.20.2010",
    "nama": "Gintungcilejet",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 237,
    "kecamatan_id": 20,
    "kode": "32.01.20.2011",
    "nama": "Kabasiran",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 238,
    "kecamatan_id": 21,
    "kode": "32.01.21.2001",
    "nama": "Malasari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 239,
    "kecamatan_id": 21,
    "kode": "32.01.21.2002",
    "nama": "Curugbitung",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 240,
    "kecamatan_id": 21,
    "kode": "32.01.21.2003",
    "nama": "Cisarua",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 241,
    "kecamatan_id": 21,
    "kode": "32.01.21.2004",
    "nama": "Bantarkaret",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 242,
    "kecamatan_id": 21,
    "kode": "32.01.21.2005",
    "nama": "Hambaro",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 243,
    "kecamatan_id": 21,
    "kode": "32.01.21.2006",
    "nama": "Kalongliud",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 244,
    "kecamatan_id": 21,
    "kode": "32.01.21.2007",
    "nama": "Nanggung",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 245,
    "kecamatan_id": 21,
    "kode": "32.01.21.2008",
    "nama": "Parakanmuncang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 246,
    "kecamatan_id": 21,
    "kode": "32.01.21.2009",
    "nama": "Pangkaljaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 247,
    "kecamatan_id": 21,
    "kode": "32.01.21.2010",
    "nama": "Sukaluyu",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 248,
    "kecamatan_id": 21,
    "kode": "32.01.21.2011",
    "nama": "Batu Tulis",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 249,
    "kecamatan_id": 22,
    "kode": "32.01.22.2001",
    "nama": "Sukamaju",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 250,
    "kecamatan_id": 22,
    "kode": "32.01.22.2002",
    "nama": "Cigudeg",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 251,
    "kecamatan_id": 22,
    "kode": "32.01.22.2003",
    "nama": "Bunar",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 252,
    "kecamatan_id": 22,
    "kode": "32.01.22.2004",
    "nama": "Banyuresmi",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 253,
    "kecamatan_id": 22,
    "kode": "32.01.22.2005",
    "nama": "Cintamanik",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 254,
    "kecamatan_id": 22,
    "kode": "32.01.22.2006",
    "nama": "Argapura",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 255,
    "kecamatan_id": 22,
    "kode": "32.01.22.2007",
    "nama": "Bangunjaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 256,
    "kecamatan_id": 22,
    "kode": "32.01.22.2008",
    "nama": "Rengasjajar",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 257,
    "kecamatan_id": 22,
    "kode": "32.01.22.2009",
    "nama": "Batujajar",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 258,
    "kecamatan_id": 22,
    "kode": "32.01.22.2010",
    "nama": "Wargajaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 259,
    "kecamatan_id": 22,
    "kode": "32.01.22.2011",
    "nama": "Sukaraksa",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 260,
    "kecamatan_id": 22,
    "kode": "32.01.22.2012",
    "nama": "Banyuwangi",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 261,
    "kecamatan_id": 22,
    "kode": "32.01.22.2013",
    "nama": "Banyuasih",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 262,
    "kecamatan_id": 22,
    "kode": "32.01.22.2014",
    "nama": "Mekarjaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 263,
    "kecamatan_id": 22,
    "kode": "32.01.22.2015",
    "nama": "Tegallega",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 264,
    "kecamatan_id": 23,
    "kode": "32.01.23.2001",
    "nama": "Tapos",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 265,
    "kecamatan_id": 23,
    "kode": "32.01.23.2002",
    "nama": "Ciomas",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 266,
    "kecamatan_id": 23,
    "kode": "32.01.23.2003",
    "nama": "Batok",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 267,
    "kecamatan_id": 23,
    "kode": "32.01.23.2004",
    "nama": "Babakan",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 268,
    "kecamatan_id": 23,
    "kode": "32.01.23.2005",
    "nama": "Tenjo",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 269,
    "kecamatan_id": 23,
    "kode": "32.01.23.2006",
    "nama": "Cilaku",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 270,
    "kecamatan_id": 23,
    "kode": "32.01.23.2007",
    "nama": "Singabraja",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 271,
    "kecamatan_id": 23,
    "kode": "32.01.23.2008",
    "nama": "Singabangsa",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 272,
    "kecamatan_id": 23,
    "kode": "32.01.23.2009",
    "nama": "Bojong",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 273,
    "kecamatan_id": 24,
    "kode": "32.01.24.2001",
    "nama": "Cileungsi",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 274,
    "kecamatan_id": 24,
    "kode": "32.01.24.2002",
    "nama": "Citapen",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 275,
    "kecamatan_id": 24,
    "kode": "32.01.24.2003",
    "nama": "Cibedug",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 276,
    "kecamatan_id": 24,
    "kode": "32.01.24.2004",
    "nama": "Jambuluwuk",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 277,
    "kecamatan_id": 24,
    "kode": "32.01.24.2005",
    "nama": "Banjarsari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 278,
    "kecamatan_id": 24,
    "kode": "32.01.24.2006",
    "nama": "Teluk Pinang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 279,
    "kecamatan_id": 24,
    "kode": "32.01.24.2007",
    "nama": "Banjar Waru",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 280,
    "kecamatan_id": 24,
    "kode": "32.01.24.2008",
    "nama": "Bendungan",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 281,
    "kecamatan_id": 24,
    "kode": "32.01.24.2009",
    "nama": "Pandan Sari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 282,
    "kecamatan_id": 24,
    "kode": "32.01.24.2010",
    "nama": "Bojong Murni",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 283,
    "kecamatan_id": 24,
    "kode": "32.01.24.2011",
    "nama": "Banjar Wangi",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 284,
    "kecamatan_id": 24,
    "kode": "32.01.24.2012",
    "nama": "Ciawi",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 285,
    "kecamatan_id": 24,
    "kode": "32.01.24.2013",
    "nama": "Bitungsari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 286,
    "kecamatan_id": 25,
    "kode": "32.01.25.1010",
    "nama": "Cisarua",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-09T11:24:59.000Z"
  },
  {
    "id": 287,
    "kecamatan_id": 25,
    "kode": "32.01.25.2001",
    "nama": "Batulayang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 288,
    "kecamatan_id": 25,
    "kode": "32.01.25.2002",
    "nama": "Jogjogan",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 289,
    "kecamatan_id": 25,
    "kode": "32.01.25.2003",
    "nama": "Cibeureum",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 290,
    "kecamatan_id": 25,
    "kode": "32.01.25.2004",
    "nama": "Cilember",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 291,
    "kecamatan_id": 25,
    "kode": "32.01.25.2005",
    "nama": "Citeko",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 292,
    "kecamatan_id": 25,
    "kode": "32.01.25.2006",
    "nama": "Tugu Selatan",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 293,
    "kecamatan_id": 25,
    "kode": "32.01.25.2007",
    "nama": "Leuwimalang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 294,
    "kecamatan_id": 25,
    "kode": "32.01.25.2008",
    "nama": "Kopo",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 295,
    "kecamatan_id": 25,
    "kode": "32.01.25.2009",
    "nama": "Tugu Utara",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 296,
    "kecamatan_id": 26,
    "kode": "32.01.26.2001",
    "nama": "Sukamaju",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 297,
    "kecamatan_id": 26,
    "kode": "32.01.26.2002",
    "nama": "Kuta",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 298,
    "kecamatan_id": 26,
    "kode": "32.01.26.2003",
    "nama": "Gadog",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 299,
    "kecamatan_id": 26,
    "kode": "32.01.26.2004",
    "nama": "Sukakarya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 300,
    "kecamatan_id": 26,
    "kode": "32.01.26.2005",
    "nama": "Megamendung",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 301,
    "kecamatan_id": 26,
    "kode": "32.01.26.2006",
    "nama": "Cipayung",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 302,
    "kecamatan_id": 26,
    "kode": "32.01.26.2007",
    "nama": "Sukamanah",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 303,
    "kecamatan_id": 26,
    "kode": "32.01.26.2008",
    "nama": "Sukagalih",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 304,
    "kecamatan_id": 26,
    "kode": "32.01.26.2009",
    "nama": "Cipayung Girang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 305,
    "kecamatan_id": 26,
    "kode": "32.01.26.2010",
    "nama": "Sukamahi",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 306,
    "kecamatan_id": 26,
    "kode": "32.01.26.2011",
    "nama": "Sukaresmi",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 307,
    "kecamatan_id": 26,
    "kode": "32.01.26.2012",
    "nama": "Pasir Angin",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 308,
    "kecamatan_id": 27,
    "kode": "32.01.27.2001",
    "nama": "Pasir Muncang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 309,
    "kecamatan_id": 27,
    "kode": "32.01.27.2002",
    "nama": "Cimande Hilir",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 310,
    "kecamatan_id": 27,
    "kode": "32.01.27.2003",
    "nama": "Ciderum",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 311,
    "kecamatan_id": 27,
    "kode": "32.01.27.2004",
    "nama": "Caringin",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 312,
    "kecamatan_id": 27,
    "kode": "32.01.27.2005",
    "nama": "Ciherang Pondok",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 313,
    "kecamatan_id": 27,
    "kode": "32.01.27.2006",
    "nama": "Cinagara",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 314,
    "kecamatan_id": 27,
    "kode": "32.01.27.2007",
    "nama": "Cimande",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 315,
    "kecamatan_id": 27,
    "kode": "32.01.27.2008",
    "nama": "Pancawati",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 316,
    "kecamatan_id": 27,
    "kode": "32.01.27.2009",
    "nama": "Muara Jaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 317,
    "kecamatan_id": 27,
    "kode": "32.01.27.2010",
    "nama": "Pasir Buncir",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 318,
    "kecamatan_id": 27,
    "kode": "32.01.27.2011",
    "nama": "Lemah Duhur",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 319,
    "kecamatan_id": 27,
    "kode": "32.01.27.2012",
    "nama": "Tangkil",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 320,
    "kecamatan_id": 28,
    "kode": "32.01.28.2001",
    "nama": "Cijeruk",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 321,
    "kecamatan_id": 28,
    "kode": "32.01.28.2002",
    "nama": "Cipelang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 322,
    "kecamatan_id": 28,
    "kode": "32.01.28.2003",
    "nama": "Warung Menteng",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 323,
    "kecamatan_id": 28,
    "kode": "32.01.28.2004",
    "nama": "Tajur Halang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 324,
    "kecamatan_id": 28,
    "kode": "32.01.28.2005",
    "nama": "Cipicung",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 325,
    "kecamatan_id": 28,
    "kode": "32.01.28.2006",
    "nama": "Cibalung",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 326,
    "kecamatan_id": 28,
    "kode": "32.01.28.2007",
    "nama": "Sukaharja",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 327,
    "kecamatan_id": 28,
    "kode": "32.01.28.2008",
    "nama": "Palasari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 328,
    "kecamatan_id": 28,
    "kode": "32.01.28.2009",
    "nama": "Tanjungsari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 329,
    "kecamatan_id": 29,
    "kode": "32.01.29.1003",
    "nama": "Padasuka",
    "status_pemerintahan": "kelurahan",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-09T11:24:59.000Z"
  },
  {
    "id": 330,
    "kecamatan_id": 29,
    "kode": "32.01.29.2001",
    "nama": "Mekarjaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 331,
    "kecamatan_id": 29,
    "kode": "32.01.29.2002",
    "nama": "Sukaharja",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 332,
    "kecamatan_id": 29,
    "kode": "32.01.29.2004",
    "nama": "Parakan",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 333,
    "kecamatan_id": 29,
    "kode": "32.01.29.2005",
    "nama": "Ciomas",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 334,
    "kecamatan_id": 29,
    "kode": "32.01.29.2006",
    "nama": "Pagelaran",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 335,
    "kecamatan_id": 29,
    "kode": "32.01.29.2007",
    "nama": "Sukamakmur",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 336,
    "kecamatan_id": 29,
    "kode": "32.01.29.2008",
    "nama": "Ciapus",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 337,
    "kecamatan_id": 29,
    "kode": "32.01.29.2009",
    "nama": "Kota Batu",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 338,
    "kecamatan_id": 29,
    "kode": "32.01.29.2010",
    "nama": "Laladon",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 339,
    "kecamatan_id": 29,
    "kode": "32.01.29.2011",
    "nama": "Ciomas Rahayu",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 340,
    "kecamatan_id": 30,
    "kode": "32.01.30.2001",
    "nama": "Sukadamai",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 341,
    "kecamatan_id": 30,
    "kode": "32.01.30.2002",
    "nama": "Ciherang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 342,
    "kecamatan_id": 30,
    "kode": "32.01.30.2003",
    "nama": "Sinarsari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 343,
    "kecamatan_id": 30,
    "kode": "32.01.30.2004",
    "nama": "Sukawening",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 344,
    "kecamatan_id": 30,
    "kode": "32.01.30.2005",
    "nama": "Petir",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 345,
    "kecamatan_id": 30,
    "kode": "32.01.30.2006",
    "nama": "Purwasari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 346,
    "kecamatan_id": 30,
    "kode": "32.01.30.2007",
    "nama": "Cikarawang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 347,
    "kecamatan_id": 30,
    "kode": "32.01.30.2008",
    "nama": "Babakan",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 348,
    "kecamatan_id": 30,
    "kode": "32.01.30.2009",
    "nama": "Dramaga",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 349,
    "kecamatan_id": 30,
    "kode": "32.01.30.2010",
    "nama": "Neglasari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 350,
    "kecamatan_id": 31,
    "kode": "32.01.31.2001",
    "nama": "Sukamantri",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 351,
    "kecamatan_id": 31,
    "kode": "32.01.31.2002",
    "nama": "Sirnagalih",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 352,
    "kecamatan_id": 31,
    "kode": "32.01.31.2003",
    "nama": "Pasireurih",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 353,
    "kecamatan_id": 31,
    "kode": "32.01.31.2004",
    "nama": "Tamansari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 354,
    "kecamatan_id": 31,
    "kode": "32.01.31.2005",
    "nama": "Sukaluyu",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 355,
    "kecamatan_id": 31,
    "kode": "32.01.31.2006",
    "nama": "Sukaresmi",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 356,
    "kecamatan_id": 31,
    "kode": "32.01.31.2007",
    "nama": "Sukajaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 357,
    "kecamatan_id": 31,
    "kode": "32.01.31.2008",
    "nama": "Sukajadi",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 358,
    "kecamatan_id": 32,
    "kode": "32.01.32.2001",
    "nama": "Klapanunggal",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 359,
    "kecamatan_id": 32,
    "kode": "32.01.32.2002",
    "nama": "Bojong",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 360,
    "kecamatan_id": 32,
    "kode": "32.01.32.2003",
    "nama": "Nambo",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 361,
    "kecamatan_id": 32,
    "kode": "32.01.32.2004",
    "nama": "Lulut",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 362,
    "kecamatan_id": 32,
    "kode": "32.01.32.2005",
    "nama": "Cikahuripan",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 363,
    "kecamatan_id": 32,
    "kode": "32.01.32.2006",
    "nama": "Kembang Kuning",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 364,
    "kecamatan_id": 32,
    "kode": "32.01.32.2007",
    "nama": "Bantar Jati",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 365,
    "kecamatan_id": 32,
    "kode": "32.01.32.2008",
    "nama": "Leuwikaret",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 366,
    "kecamatan_id": 32,
    "kode": "32.01.32.2009",
    "nama": "Ligarmukti",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 367,
    "kecamatan_id": 33,
    "kode": "32.01.33.2001",
    "nama": "Putat Nutug",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 368,
    "kecamatan_id": 33,
    "kode": "32.01.33.2002",
    "nama": "Ciseeng",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 369,
    "kecamatan_id": 33,
    "kode": "32.01.33.2003",
    "nama": "Parigi Mekar",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 370,
    "kecamatan_id": 33,
    "kode": "32.01.33.2004",
    "nama": "Cibentang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 371,
    "kecamatan_id": 33,
    "kode": "32.01.33.2005",
    "nama": "Cibeuteung Udik",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 372,
    "kecamatan_id": 33,
    "kode": "32.01.33.2006",
    "nama": "Karihkil",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 373,
    "kecamatan_id": 33,
    "kode": "32.01.33.2007",
    "nama": "Babakan",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 374,
    "kecamatan_id": 33,
    "kode": "32.01.33.2008",
    "nama": "Cihoe",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 375,
    "kecamatan_id": 33,
    "kode": "32.01.33.2009",
    "nama": "Cibeuteung Muara",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 376,
    "kecamatan_id": 33,
    "kode": "32.01.33.2010",
    "nama": "Kuripan",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 377,
    "kecamatan_id": 34,
    "kode": "32.01.34.2001",
    "nama": "Bantarjaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 378,
    "kecamatan_id": 34,
    "kode": "32.01.34.2002",
    "nama": "Bantarsari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 379,
    "kecamatan_id": 34,
    "kode": "32.01.34.2003",
    "nama": "Pasirgaok",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 380,
    "kecamatan_id": 34,
    "kode": "32.01.34.2004",
    "nama": "Rancabungur",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 381,
    "kecamatan_id": 34,
    "kode": "32.01.34.2005",
    "nama": "Mekarsari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 382,
    "kecamatan_id": 34,
    "kode": "32.01.34.2006",
    "nama": "Candali",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 383,
    "kecamatan_id": 34,
    "kode": "32.01.34.2007",
    "nama": "Cimulang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 384,
    "kecamatan_id": 35,
    "kode": "32.01.35.2001",
    "nama": "Cisarua",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 385,
    "kecamatan_id": 35,
    "kode": "32.01.35.2002",
    "nama": "Kiarasari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 386,
    "kecamatan_id": 35,
    "kode": "32.01.35.2003",
    "nama": "Sukajaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 387,
    "kecamatan_id": 35,
    "kode": "32.01.35.2004",
    "nama": "Sipayung",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 388,
    "kecamatan_id": 35,
    "kode": "32.01.35.2005",
    "nama": "Cileuksa",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 389,
    "kecamatan_id": 35,
    "kode": "32.01.35.2006",
    "nama": "Kiarapandak",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 390,
    "kecamatan_id": 35,
    "kode": "32.01.35.2007",
    "nama": "Harkatjaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 391,
    "kecamatan_id": 35,
    "kode": "32.01.35.2008",
    "nama": "Sukamulih",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 392,
    "kecamatan_id": 35,
    "kode": "32.01.35.2009",
    "nama": "Pasir Madang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 393,
    "kecamatan_id": 35,
    "kode": "32.01.35.2010",
    "nama": "Urug",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 394,
    "kecamatan_id": 35,
    "kode": "32.01.35.2011",
    "nama": "Jayaraharja",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 395,
    "kecamatan_id": 36,
    "kode": "32.01.36.2001",
    "nama": "Tanjungsari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 396,
    "kecamatan_id": 36,
    "kode": "32.01.36.2002",
    "nama": "Selawangi",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 397,
    "kecamatan_id": 36,
    "kode": "32.01.36.2003",
    "nama": "Tanjungrasa",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 398,
    "kecamatan_id": 36,
    "kode": "32.01.36.2004",
    "nama": "Antajaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 399,
    "kecamatan_id": 36,
    "kode": "32.01.36.2005",
    "nama": "Pasir Tanjung",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 400,
    "kecamatan_id": 36,
    "kode": "32.01.36.2006",
    "nama": "Cibadak",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 401,
    "kecamatan_id": 36,
    "kode": "32.01.36.2007",
    "nama": "Sukarasa",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 402,
    "kecamatan_id": 36,
    "kode": "32.01.36.2008",
    "nama": "Sirnasari",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 403,
    "kecamatan_id": 36,
    "kode": "32.01.36.2009",
    "nama": "Buanajaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 404,
    "kecamatan_id": 36,
    "kode": "32.01.36.2010",
    "nama": "Sirnarasa",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 405,
    "kecamatan_id": 37,
    "kode": "32.01.37.2001",
    "nama": "Tajurhalang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 406,
    "kecamatan_id": 37,
    "kode": "32.01.37.2002",
    "nama": "Citayam",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 407,
    "kecamatan_id": 37,
    "kode": "32.01.37.2003",
    "nama": "Sasak Panjang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 408,
    "kecamatan_id": 37,
    "kode": "32.01.37.2004",
    "nama": "Nanggerang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 409,
    "kecamatan_id": 37,
    "kode": "32.01.37.2005",
    "nama": "Sukmajaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 410,
    "kecamatan_id": 37,
    "kode": "32.01.37.2006",
    "nama": "Tonjong",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 411,
    "kecamatan_id": 37,
    "kode": "32.01.37.2007",
    "nama": "Kalisuren",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 412,
    "kecamatan_id": 38,
    "kode": "32.01.38.2001",
    "nama": "Cigombong",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 413,
    "kecamatan_id": 38,
    "kode": "32.01.38.2002",
    "nama": "Watesjaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 414,
    "kecamatan_id": 38,
    "kode": "32.01.38.2003",
    "nama": "Ciburuy",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 415,
    "kecamatan_id": 38,
    "kode": "32.01.38.2004",
    "nama": "Srogol",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 416,
    "kecamatan_id": 38,
    "kode": "32.01.38.2005",
    "nama": "Cisalada",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 417,
    "kecamatan_id": 38,
    "kode": "32.01.38.2006",
    "nama": "Tugujaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 418,
    "kecamatan_id": 38,
    "kode": "32.01.38.2007",
    "nama": "Pasirjaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 419,
    "kecamatan_id": 38,
    "kode": "32.01.38.2008",
    "nama": "Ciburayut",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 420,
    "kecamatan_id": 38,
    "kode": "32.01.38.2009",
    "nama": "Ciadeg",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 421,
    "kecamatan_id": 39,
    "kode": "32.01.39.2001",
    "nama": "Leuwisadeng",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 422,
    "kecamatan_id": 39,
    "kode": "32.01.39.2002",
    "nama": "Babakan Sadeng",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 423,
    "kecamatan_id": 39,
    "kode": "32.01.39.2003",
    "nama": "Sadeng Kolot",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 424,
    "kecamatan_id": 39,
    "kode": "32.01.39.2004",
    "nama": "Wangunjaya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 425,
    "kecamatan_id": 39,
    "kode": "32.01.39.2005",
    "nama": "Kalong I",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 426,
    "kecamatan_id": 39,
    "kode": "32.01.39.2006",
    "nama": "Kalong II",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 427,
    "kecamatan_id": 39,
    "kode": "32.01.39.2007",
    "nama": "Sadeng",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 428,
    "kecamatan_id": 39,
    "kode": "32.01.39.2008",
    "nama": "Sibanteng",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 429,
    "kecamatan_id": 40,
    "kode": "32.01.40.2001",
    "nama": "Tapos I",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 430,
    "kecamatan_id": 40,
    "kode": "32.01.40.2002",
    "nama": "Tapos II",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 431,
    "kecamatan_id": 40,
    "kode": "32.01.40.2003",
    "nama": "Cibitung Tengah",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 432,
    "kecamatan_id": 40,
    "kode": "32.01.40.2004",
    "nama": "Situdaun",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 433,
    "kecamatan_id": 40,
    "kode": "32.01.40.2005",
    "nama": "Cinangneng",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 434,
    "kecamatan_id": 40,
    "kode": "32.01.40.2006",
    "nama": "Gunung Malang",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
  },
  {
    "id": 435,
    "kecamatan_id": 40,
    "kode": "32.01.40.2007",
    "nama": "Gunung Mulya",
    "status_pemerintahan": "desa",
    "is_musdesus_target": 0,
    "created_at": "2025-10-01T09:31:32.000Z",
    "updated_at": "2025-10-01T09:31:32.000Z"
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
    
    console.log('✅ Seeded 435 records into desas');
  },
  
  async down(connection) {
    console.log('Clearing desas...');
    await connection.query('DELETE FROM `desas`');
    console.log('✅ Cleared desas');
  }
};
