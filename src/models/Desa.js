const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Desa = sequelize.define('Desa', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  kecamatan_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'kecamatan_id'
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
  },
  status_pemerintahan: {
    type: DataTypes.ENUM('desa', 'kelurahan'),
    allowNull: false,
    defaultValue: 'desa',
    field: 'status_pemerintahan'
  },
  is_musdesus_target: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_musdesus_target'
  }
}, {
  tableName: 'desas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false
});

module.exports = Desa;
