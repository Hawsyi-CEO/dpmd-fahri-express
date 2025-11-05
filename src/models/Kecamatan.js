const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Kecamatan = sequelize.define('Kecamatan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nama: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'nama'
  }
}, {
  tableName: 'kecamatans',
  timestamps: false,
  underscored: false
});

module.exports = Kecamatan;
