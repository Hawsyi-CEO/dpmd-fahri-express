const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pegawai = sequelize.define('Pegawai', {
  id_pegawai: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID pegawai'
  },
  id_bidang: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: 'ID bidang (foreign key)'
  },
  nama_pegawai: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nama pegawai'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'pegawai',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  comment: 'Table untuk menyimpan data pegawai per bidang'
});

module.exports = Pegawai;
