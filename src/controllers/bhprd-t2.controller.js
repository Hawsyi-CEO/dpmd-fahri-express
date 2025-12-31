// src/controllers/bhprd-t2.controller.js
const fs = require('fs').promises;
const path = require('path');
const ActivityLogger = require('../utils/activityLogger');

const uploadBhprdT2Data = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File JSON tidak ditemukan. Silakan upload file.'
      });
    }

    const fileExt = path.extname(req.file.originalname).toLowerCase();
    if (fileExt !== '.json') {
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'File harus berformat JSON (.json)'
      });
    }

    let jsonData;
    try {
      const fileContent = await fs.readFile(req.file.path, 'utf-8');
      jsonData = JSON.parse(fileContent);
    } catch (error) {
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'File JSON tidak valid. Pastikan format JSON benar.'
      });
    }

    if (!Array.isArray(jsonData)) {
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Format data tidak sesuai. Data harus berupa array.'
      });
    }

    const publicDir = path.join(__dirname, '../../public');
    const targetFile = path.join(publicDir, 'bhprd-tahap2.json');
    const backupDir = path.join(publicDir, 'backups');
    
    try {
      await fs.access(backupDir);
    } catch {
      await fs.mkdir(backupDir, { recursive: true });
    }

    try {
      await fs.access(targetFile);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const backupFile = path.join(backupDir, `bhprd-tahap2_backup_${timestamp}.json`);
      await fs.copyFile(targetFile, backupFile);
    } catch (error) {
      console.log('No existing file to backup');
    }

    await fs.copyFile(req.file.path, targetFile);
    await fs.unlink(req.file.path);

    // Log activity
    await ActivityLogger.log({
      userId: req.user.id,
      userName: req.user.nama || req.user.email,
      userRole: req.user.role,
      bidangId: 4, // KKD
      module: 'bhprd',
      action: 'upload',
      entityType: 'bhprd_tahap2',
      entityName: 'BHPRD Tahap 2',
      description: `Upload data BHPRD Tahap 2: ${jsonData.length} baris`,
      newValue: { totalRows: jsonData.length },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Data BHPRD Tahap 2 berhasil diupdate',
      data: {
        totalRows: jsonData.length,
        uploadedAt: new Date().toISOString(),
        uploadedBy: req.user?.nama || req.user?.email || 'System'
      }
    });

  } catch (error) {
    console.error('Error uploading BHPRD tahap 2 data:', error);
    
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error removing temp file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat upload data',
      error: error.message
    });
  }
};

const getBhprdT2Data = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../../public/bhprd-tahap2.json');
    
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'Data BHPRD Tahap 2 belum tersedia'
      });
    }

    const fileContent = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    res.json({
      success: true,
      data: jsonData
    });

  } catch (error) {
    console.error('Error reading BHPRD tahap 2 data:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membaca data BHPRD Tahap 2',
      error: error.message
    });
  }
};

const getBhprdT2Info = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../../public/bhprd-tahap2.json');
    
    try {
      const stats = await fs.stat(filePath);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const jsonData = JSON.parse(fileContent);
      
      res.json({
        success: true,
        data: {
          filename: 'bhprd-tahap2.json',
          size: stats.size,
          lastModified: stats.mtime,
          totalRows: jsonData.length
        }
      });
    } catch {
      return res.status(404).json({
        success: false,
        message: 'File BHPRD Tahap 2 tidak ditemukan'
      });
    }

  } catch (error) {
    console.error('Error getting BHPRD tahap 2 info:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan info file',
      error: error.message
    });
  }
};

const getBhprdT2Statistics = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../../public/bhprd-tahap2.json');
    
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'Data BHPRD Tahap 2 belum tersedia'
      });
    }

    const fileContent = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    const totalRealisasi = jsonData.reduce((sum, item) => {
      const realisasi = typeof item.Realisasi === 'string' 
        ? parseInt(item.Realisasi.replace(/,/g, '')) 
        : item.Realisasi || 0;
      return sum + realisasi;
    }, 0);

    res.json({
      success: true,
      data: {
        totalRealisasi,
        totalDesa: jsonData.length,
        averageRealisasi: jsonData.length > 0 ? Math.round(totalRealisasi / jsonData.length) : 0
      }
    });

  } catch (error) {
    console.error('Error getting BHPRD T2 statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan statistik',
      error: error.message
    });
  }
};

module.exports = {
  uploadBhprdT2Data,
  getBhprdT2Data,
  getBhprdT2Info,
  getBhprdT2Statistics
};
