const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JenisLaporan = sequelize.define('JenisLaporan', {
  id_jenis_laporan: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  jenis_laporan: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  id_bidang: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'jenis_laporan',
  timestamps: false
});

module.exports = JenisLaporan;
