const sequelize = require('../config/database');

// Import all models
const PerjalananDinas = require('./PerjalananDinas');
const KegiatanBidang = require('./KegiatanBidang');
const Bidang = require('./Bidang');
const Personil = require('./Personil');

// Setup associations
PerjalananDinas.hasMany(KegiatanBidang, { 
  foreignKey: 'id_kegiatan', 
  as: 'details' 
});

KegiatanBidang.belongsTo(PerjalananDinas, { 
  foreignKey: 'id_kegiatan', 
  as: 'kegiatan' 
});

KegiatanBidang.belongsTo(Bidang, { 
  foreignKey: 'id_bidang', 
  as: 'bidang' 
});

Bidang.hasMany(KegiatanBidang, { 
  foreignKey: 'id_bidang', 
  as: 'kegiatan_details' 
});

Bidang.hasMany(Personil, {
  foreignKey: 'id_bidang',
  as: 'personil'
});

Personil.belongsTo(Bidang, {
  foreignKey: 'id_bidang',
  as: 'bidang'
});

module.exports = {
  sequelize,
  PerjalananDinas,
  KegiatanBidang,
  Bidang,
  Personil
};
