const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bumdes = sequelize.define('Bumdes', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Identitas
  namabumdesa: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  desa: DataTypes.STRING(255),
  kecamatan: DataTypes.STRING(255),
  kode_desa: DataTypes.STRING(50),
  desa_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  TahunPendirian: {
    type: DataTypes.INTEGER,
    field: 'TahunPendirian'
  },
  AlamatBumdesa: {
    type: DataTypes.TEXT,
    field: 'AlamatBumdesa'
  },
  TelfonBumdes: {
    type: DataTypes.STRING(20),
    field: 'TelfonBumdes'
  },
  Alamatemail: {
    type: DataTypes.STRING(255),
    field: 'Alamatemail'
  },
  status: {
    type: DataTypes.ENUM('aktif', 'tidak aktif'),
    defaultValue: 'aktif'
  },
  keterangan_tidak_aktif: DataTypes.TEXT,

  // Dasar Hukum
  NomorPerdes: {
    type: DataTypes.STRING(100),
    field: 'NomorPerdes'
  },
  produk_hukum_perdes_id: DataTypes.INTEGER,
  produk_hukum_sk_bumdes_id: DataTypes.INTEGER,

  // Legalitas
  NIB: {
    type: DataTypes.STRING(100),
    field: 'NIB'
  },
  LKPP: {
    type: DataTypes.STRING(100),
    field: 'LKPP'
  },
  NPWP: {
    type: DataTypes.STRING(100),
    field: 'NPWP'
  },
  badanhukum: DataTypes.STRING(255),

  // Pengurus
  NamaPenasihat: {
    type: DataTypes.STRING(255),
    field: 'NamaPenasihat'
  },
  JenisKelaminPenasihat: {
    type: DataTypes.STRING(20),
    field: 'JenisKelaminPenasihat'
  },
  HPPenasihat: {
    type: DataTypes.STRING(20),
    field: 'HPPenasihat'
  },
  
  NamaPengawas: {
    type: DataTypes.STRING(255),
    field: 'NamaPengawas'
  },
  JenisKelaminPengawas: {
    type: DataTypes.STRING(20),
    field: 'JenisKelaminPengawas'
  },
  HPPengawas: {
    type: DataTypes.STRING(20),
    field: 'HPPengawas'
  },
  
  NamaDirektur: {
    type: DataTypes.STRING(255),
    field: 'NamaDirektur'
  },
  JenisKelaminDirektur: {
    type: DataTypes.STRING(20),
    field: 'JenisKelaminDirektur'
  },
  HPDirektur: {
    type: DataTypes.STRING(20),
    field: 'HPDirektur'
  },
  
  NamaSekretaris: {
    type: DataTypes.STRING(255),
    field: 'NamaSekretaris'
  },
  JenisKelaminSekretaris: {
    type: DataTypes.STRING(20),
    field: 'JenisKelaminSekretaris'
  },
  HPSekretaris: {
    type: DataTypes.STRING(20),
    field: 'HPSekretaris'
  },
  
  NamaBendahara: {
    type: DataTypes.STRING(255),
    field: 'NamaBendahara'
  },
  JenisKelaminBendahara: {
    type: DataTypes.STRING(20),
    field: 'JenisKelaminBendahara'
  },
  HPBendahara: {
    type: DataTypes.STRING(20),
    field: 'HPBendahara'
  },

  // Organisasi
  TotalTenagaKerja: {
    type: DataTypes.INTEGER,
    field: 'TotalTenagaKerja'
  },
  JenisUsaha: {
    type: DataTypes.TEXT,
    field: 'JenisUsaha'
  },
  JenisUsahaUtama: {
    type: DataTypes.TEXT,
    field: 'JenisUsahaUtama'
  },
  JenisUsahaLainnya: {
    type: DataTypes.TEXT,
    field: 'JenisUsahaLainnya'
  },

  // Permodalan & Keuangan
  Omset2023: {
    type: DataTypes.DECIMAL(15, 2),
    field: 'Omset2023'
  },
  Laba2023: {
    type: DataTypes.DECIMAL(15, 2),
    field: 'Laba2023'
  },
  Omset2024: {
    type: DataTypes.DECIMAL(15, 2),
    field: 'Omset2024'
  },
  Laba2024: {
    type: DataTypes.DECIMAL(15, 2),
    field: 'Laba2024'
  },
  PenyertaanModal2019: {
    type: DataTypes.DECIMAL(15, 2),
    field: 'PenyertaanModal2019'
  },
  PenyertaanModal2020: {
    type: DataTypes.DECIMAL(15, 2),
    field: 'PenyertaanModal2020'
  },
  PenyertaanModal2021: {
    type: DataTypes.DECIMAL(15, 2),
    field: 'PenyertaanModal2021'
  },
  PenyertaanModal2022: {
    type: DataTypes.DECIMAL(15, 2),
    field: 'PenyertaanModal2022'
  },
  PenyertaanModal2023: {
    type: DataTypes.DECIMAL(15, 2),
    field: 'PenyertaanModal2023'
  },
  PenyertaanModal2024: {
    type: DataTypes.DECIMAL(15, 2),
    field: 'PenyertaanModal2024'
  },
  SumberLain: {
    type: DataTypes.DECIMAL(15, 2),
    field: 'SumberLain'
  },
  JenisAset: {
    type: DataTypes.TEXT,
    field: 'JenisAset'
  },
  NilaiAset: {
    type: DataTypes.DECIMAL(15, 2),
    field: 'NilaiAset'
  },
  KerjasamaPihakKetiga: {
    type: DataTypes.TEXT,
    field: 'KerjasamaPihakKetiga'
  },
  'TahunMulai-TahunBerakhir': {
    type: DataTypes.STRING(255),
    field: 'TahunMulai-TahunBerakhir'
  },
  KontribusiTerhadapPADes2021: {
    type: DataTypes.DECIMAL(15, 2),
    field: 'KontribusiTerhadapPADes2021'
  },
  KontribusiTerhadapPADes2022: {
    type: DataTypes.DECIMAL(15, 2),
    field: 'KontribusiTerhadapPADes2022'
  },
  KontribusiTerhadapPADes2023: {
    type: DataTypes.DECIMAL(15, 2),
    field: 'KontribusiTerhadapPADes2023'
  },
  KontribusiTerhadapPADes2024: {
    type: DataTypes.DECIMAL(15, 2),
    field: 'KontribusiTerhadapPADes2024'
  },
  Ketapang2024: {
    type: DataTypes.STRING(255),
    field: 'Ketapang2024'
  },
  Ketapang2025: {
    type: DataTypes.STRING(255),
    field: 'Ketapang2025'
  },
  BantuanKementrian: {
    type: DataTypes.STRING(255),
    field: 'BantuanKementrian'
  },
  BantuanLaptopShopee: {
    type: DataTypes.STRING(255),
    field: 'BantuanLaptopShopee'
  },
  DesaWisata: {
    type: DataTypes.STRING(255),
    field: 'DesaWisata'
  },

  // Files - Laporan Keuangan
  LaporanKeuangan2021: {
    type: DataTypes.STRING(500),
    field: 'LaporanKeuangan2021'
  },
  LaporanKeuangan2022: {
    type: DataTypes.STRING(500),
    field: 'LaporanKeuangan2022'
  },
  LaporanKeuangan2023: {
    type: DataTypes.STRING(500),
    field: 'LaporanKeuangan2023'
  },
  LaporanKeuangan2024: {
    type: DataTypes.STRING(500),
    field: 'LaporanKeuangan2024'
  },

  // Files - Dokumen Badan Hukum
  ProfilBUMDesa: {
    type: DataTypes.STRING(500),
    field: 'ProfilBUMDesa'
  },
  BeritaAcara: {
    type: DataTypes.STRING(500),
    field: 'BeritaAcara'
  },
  AnggaranDasar: {
    type: DataTypes.STRING(500),
    field: 'AnggaranDasar'
  },
  AnggaranRumahTangga: {
    type: DataTypes.STRING(500),
    field: 'AnggaranRumahTangga'
  },
  ProgramKerja: {
    type: DataTypes.STRING(500),
    field: 'ProgramKerja'
  },
  
  // Files - Produk Hukum (Path to files)
  Perdes: {
    type: DataTypes.STRING(500),
    field: 'Perdes'
  },
  SK_BUM_Desa: {
    type: DataTypes.STRING(500),
    field: 'SK_BUM_Desa'
  }

}, {
  tableName: 'bumdes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  // Don't use underscored:true because Laravel table has mixed case columns
  underscored: false
});

module.exports = Bumdes;
