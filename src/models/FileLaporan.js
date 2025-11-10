const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FileLaporan = sequelize.define('FileLaporan', {
  id_file_laporan: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  file_laporan: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  id_laporan: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'file_laporan',
  timestamps: false
});

module.exports = FileLaporan;
