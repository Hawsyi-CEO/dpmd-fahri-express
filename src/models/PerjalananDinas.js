const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PerjalananDinas = sequelize.define('PerjalananDinas', {
  id_kegiatan: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID kegiatan perjalanan dinas'
  },
  nama_kegiatan: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nama kegiatan perjalanan dinas'
  },
  nomor_sp: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nomor surat perintah'
  },
  tanggal_mulai: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Tanggal mulai kegiatan'
  },
  tanggal_selesai: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Tanggal selesai kegiatan'
  },
  lokasi: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Lokasi kegiatan'
  },
  keterangan: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Keterangan tambahan'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'kegiatan',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  comment: 'Table untuk menyimpan data kegiatan perjalanan dinas'
});

// Define association with KegiatanBidang (if needed)
// PerjalananDinas.hasMany(KegiatanBidang, { foreignKey: 'id_kegiatan', as: 'details' });

module.exports = PerjalananDinas;
