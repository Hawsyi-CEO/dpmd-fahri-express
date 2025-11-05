const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Desa = sequelize.define('Desa', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  kode: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'kode'
  },
  nama: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'nama'
  },
  kecamatan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'kecamatan_id'
  }
}, {
  tableName: 'desas',
  timestamps: false,
  underscored: false
});

module.exports = Desa;
