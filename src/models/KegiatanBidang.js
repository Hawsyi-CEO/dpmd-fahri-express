const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const KegiatanBidang = sequelize.define('KegiatanBidang', {
  id_kegiatan_bidang: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID kegiatan bidang'
  },
  id_kegiatan: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: 'ID kegiatan (foreign key)'
  },
  id_bidang: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: 'ID bidang (foreign key)'
  },
  personil: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Data personil dalam format JSON'
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
  tableName: 'kegiatan_bidang',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  comment: 'Table untuk menyimpan relasi kegiatan dengan bidang'
});

// Define associations
KegiatanBidang.associate = (models) => {
  KegiatanBidang.belongsTo(models.Bidang, {
    foreignKey: 'id_bidang',
    as: 'bidang'
  });
  
  KegiatanBidang.belongsTo(models.PerjalananDinas, {
    foreignKey: 'id_kegiatan',
    as: 'kegiatan'
  });
};

module.exports = KegiatanBidang;
