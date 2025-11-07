const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bidang = sequelize.define('Bidang', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID bidang'
  },
  nama: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nama bidang'
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
  tableName: 'bidangs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  comment: 'Table untuk menyimpan data bidang'
});

// Import related models
const Personil = require('./Personil');

// Define associations
Bidang.hasMany(Personil, { 
  foreignKey: 'id_bidang', 
  as: 'personil' 
});

Personil.belongsTo(Bidang, { 
  foreignKey: 'id_bidang', 
  as: 'bidang' 
});

module.exports = Bidang;
