const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Personil = sequelize.define('Personil', {
  id_personil: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID personil'
  },
  id_bidang: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: 'ID bidang (foreign key)'
  },
  nama_personil: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nama personil'
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
  tableName: 'personil',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  comment: 'Table untuk menyimpan data personil per bidang'
});

module.exports = Personil;
