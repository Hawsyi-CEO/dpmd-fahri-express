const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Kecamatan = sequelize.define('Kecamatan', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  kode: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    field: 'kode'
  },
  nama: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'nama'
  }
}, {
  tableName: 'kecamatans',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false
});

module.exports = Kecamatan;
