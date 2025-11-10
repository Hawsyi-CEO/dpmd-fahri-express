const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LaporanDesa = sequelize.define('LaporanDesa', {
  id_laporan: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  judul_laporan: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  uraian_laporan: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tgl_laporan: {
    type: DataTypes.DATE,
    allowNull: false
  },
  tahun_kegiatan: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status_laporan: {
    type: DataTypes.ENUM('Belum Divalidasi', 'Tidak Valid', 'Valid', 'Tidak Perlu Validasi'),
    defaultValue: 'Belum Divalidasi',
    allowNull: false
  },
  transparansi_laporan: {
    type: DataTypes.ENUM('Tertutup', 'Terbuka'),
    defaultValue: 'Tertutup',
    allowNull: false
  },
  id_jenis_laporan: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_kelurahan: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'laporan',
  timestamps: false
});

module.exports = LaporanDesa;
