const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directories if they don't exist
const uploadDirs = [
  'storage/uploads/bumdes_laporan_keuangan',
  'storage/uploads/bumdes_dokumen_badanhukum',
  'storage/uploads/musdesus',
  'storage/uploads/perjalanan_dinas',
  'storage/uploads/hero-gallery',
  'storage/produk_hukum'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration for BUMDES
const storageBumdes = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine folder based on field_name
    const fieldName = req.body.field_name;
    
    let folder = 'storage/uploads/bumdes';
    
    if (fieldName) {
      const laporanKeuanganFields = ['LaporanKeuangan2021', 'LaporanKeuangan2022', 'LaporanKeuangan2023', 'LaporanKeuangan2024'];
      const dokumenBadanHukumFields = ['ProfilBUMDesa', 'BeritaAcara', 'AnggaranDasar', 'AnggaranRumahTangga', 'ProgramKerja', 'Perdes', 'SK_BUM_Desa'];
      
      if (laporanKeuanganFields.includes(fieldName)) {
        folder = 'storage/uploads/bumdes_laporan_keuangan';
      } else if (dokumenBadanHukumFields.includes(fieldName)) {
        folder = 'storage/uploads/bumdes_dokumen_badanhukum';
      }
    }
    
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const filename = `${timestamp}_${nameWithoutExt}${ext}`;
    
    cb(null, filename);
  }
});

// Storage configuration for MUSDESUS
const storageMusdesus = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'storage/uploads/musdesus');
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const filename = `${timestamp}_${nameWithoutExt}${ext}`;
    
    cb(null, filename);
  }
});

// Storage configuration for PERJALANAN DINAS
const storagePerjadinDinas = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'storage/uploads/perjalanan_dinas');
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const filename = `${timestamp}_${nameWithoutExt}${ext}`;
    
    cb(null, filename);
  }
});

// File filter for documents
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const allowedExts = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Only PDF, DOC, DOCX, XLS, XLSX allowed.'), false);
  }
};

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Only JPG, JPEG, PNG, GIF, WEBP allowed.'), false);
  }
};

// Storage configuration for HERO GALLERY
const storageHeroGallery = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'storage/uploads/hero-gallery');
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const filename = `${timestamp}_${nameWithoutExt}${ext}`;
    
    cb(null, filename);
  }
});

// Multer configurations
const uploadBumdes = multer({
  storage: storageBumdes,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  }
});

const uploadMusdesus = multer({
  storage: storageMusdesus,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024
  }
});

const uploadPerjadinDinas = multer({
  storage: storagePerjadinDinas,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024
  }
});

const uploadHeroGallery = multer({
  storage: storageHeroGallery,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB for images
  }
});

// Storage configuration for PRODUK HUKUM (PDF only)
const storageProdukHukum = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'storage/produk_hukum');
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    // Sanitize filename: remove special characters
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${sanitizedName}_${timestamp}${ext}`;
    
    cb(null, filename);
  }
});

// File filter for PDF only
const pdfFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (ext === '.pdf' && file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Hanya file PDF yang diperbolehkan'), false);
  }
};

const uploadProdukHukum = multer({
  storage: storageProdukHukum,
  fileFilter: pdfFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB for PDF
  }
});

module.exports = {
  uploadBumdes,
  uploadMusdesus,
  uploadPerjadinDinas,
  uploadHeroGallery,
  uploadProdukHukum
};
