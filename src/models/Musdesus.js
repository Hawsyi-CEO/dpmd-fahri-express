const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Musdesus = sequelize.define('Musdesus', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  nama_file: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nama file yang tersimpan di server (dengan timestamp)'
  },
  nama_file_asli: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nama file asli yang diupload user'
  },
  path_file: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Path lengkap file di storage'
  },
  mime_type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'MIME type file (application/pdf, etc)'
  },
  ukuran_file: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: 'Ukuran file dalam bytes'
  },
  nama_pengupload: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nama orang yang mengupload file'
  },
  email_pengupload: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Email pengupload (opsional)'
  },
  telepon_pengupload: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Nomor telepon pengupload (opsional)'
  },
  desa_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'desas',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Foreign key ke table desas'
  },
  kecamatan_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'kecamatans',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Foreign key ke table kecamatans'
  },
  petugas_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Foreign key ke table users (petugas yang approve)'
  },
  keterangan: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Keterangan tambahan dari pengupload'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    comment: 'Status approval dokumen'
  },
  catatan_admin: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Catatan dari admin/petugas'
  },
  tanggal_musdesus: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tanggal pelaksanaan musdesus'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'musdesus',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false,
  comment: 'Table untuk menyimpan data file Musyawarah Desa Khusus'
});

// Virtual field untuk file URL
Musdesus.prototype.getFileUrl = function() {
  if (!this.nama_file) {
    return null;
  }
  
  const baseUrl = process.env.APP_URL || 'http://localhost:3001';
  return `${baseUrl}/api/uploads/musdesus/${this.nama_file}`;
};

module.exports = Musdesus;
