const sequelize = require('../config/database');

// Import all models
const KegiatanBidang = require('./KegiatanBidang');
const Bidang = require('./Bidang');
const Pegawai = require('./Pegawai');

// Setup associations
KegiatanBidang.belongsTo(Bidang, { 
  foreignKey: 'id_bidang', 
  as: 'bidang' 
});

Bidang.hasMany(KegiatanBidang, { 
  foreignKey: 'id_bidang', 
  as: 'kegiatan_details' 
});

Bidang.hasMany(Pegawai, {
  foreignKey: 'id_bidang',
  as: 'pegawai'
});

Pegawai.belongsTo(Bidang, {
  foreignKey: 'id_bidang',
  as: 'bidang'
});

module.exports = {
  sequelize,
  KegiatanBidang,
  Bidang,
  Pegawai
};
