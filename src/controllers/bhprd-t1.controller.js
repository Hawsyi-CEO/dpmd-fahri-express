// src/controllers/bhprd-t1.controller.js
const fs = require('fs').promises;
const path = require('path');

/**
 * Upload and replace bhprd-tahap1.json file
 */
const uploadBhprdT1Data = async (req, res) => {
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

    if (jsonData.length > 0) {
      const requiredFields = ['kecamatan', 'desa', 'sts', 'Realisasi'];
      const firstItem = jsonData[0];
      const missingFields = requiredFields.filter(field => !firstItem.hasOwnProperty(field));
      
      if (missingFields.length > 0) {
        await fs.unlink(req.file.path);
        return res.status(400).json({
          success: false,
          message: `Field yang diperlukan tidak lengkap: ${missingFields.join(', ')}`
        });
      }
    }

    const publicDir = path.join(__dirname, '../../public');
    const targetFile = path.join(publicDir, 'bhprd-tahap1.json');
    const backupDir = path.join(publicDir, 'backups');
    
    try {
      await fs.access(backupDir);
    } catch {
      await fs.mkdir(backupDir, { recursive: true });
    }

    try {
      await fs.access(targetFile);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const backupFile = path.join(backupDir, `bhprd-tahap1_backup_${timestamp}.json`);
      await fs.copyFile(targetFile, backupFile);
    } catch (error) {
      console.log('No existing file to backup');
    }

    await fs.copyFile(req.file.path, targetFile);
    await fs.unlink(req.file.path);

    const validData = jsonData.filter(item => {
      const realisasi = typeof item.Realisasi === 'string' 
        ? parseInt(item.Realisasi.replace(/,/g, '')) 
        : item.Realisasi;
      return realisasi > 0;
    });

    const totalRows = jsonData.length;
    const validRows = validData.length;
    
    const desaMap = {};
    validData.forEach(item => {
      const key = `${item.kecamatan}|${item.desa}`;
      if (!desaMap[key]) {
        desaMap[key] = true;
      }
    });
    const uniqueDesa = Object.keys(desaMap).length;

    res.json({
      success: true,
      message: 'Data BHPRD Tahap 1 berhasil diupdate',
      data: {
        totalRows,
        validRows,
        uniqueDesa,
        uploadedAt: new Date().toISOString(),
        uploadedBy: req.user?.nama || req.user?.email || 'System'
      }
    });

  } catch (error) {
    console.error('Error uploading BHPRD tahap 1 data:', error);
    
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

/**
 * Get BHPRD tahap 1 data (JSON content)
 */
const getBhprdT1Data = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../../public/bhprd-tahap1.json');
    
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'Data BHPRD Tahap 1 belum tersedia'
      });
    }

    const fileContent = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    res.json({
      success: true,
      data: jsonData
    });

  } catch (error) {
    console.error('Error reading BHPRD tahap 1 data:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membaca data BHPRD Tahap 1',
      error: error.message
    });
  }
};

/**
 * Get BHPRD tahap 1 file info
 */
const getBhprdT1Info = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../../public/bhprd-tahap1.json');
    
    try {
      const stats = await fs.stat(filePath);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const jsonData = JSON.parse(fileContent);
      
      const totalRows = jsonData.length;
      const validData = jsonData.filter(item => {
        const realisasi = typeof item.Realisasi === 'string' 
          ? parseInt(item.Realisasi.replace(/,/g, '')) 
          : item.Realisasi;
        return realisasi > 0;
      });

      const desaMap = {};
      validData.forEach(item => {
        const key = `${item.kecamatan}|${item.desa}`;
        if (!desaMap[key]) {
          desaMap[key] = true;
        }
      });

      res.json({
        success: true,
        data: {
          filename: 'bhprd-tahap1.json',
          size: stats.size,
          lastModified: stats.mtime,
          totalRows,
          validRows: validData.length,
          uniqueDesa: Object.keys(desaMap).length
        }
      });
    } catch {
      return res.status(404).json({
        success: false,
        message: 'File BHPRD Tahap 1 tidak ditemukan'
      });
    }

  } catch (error) {
    console.error('Error getting BHPRD tahap 1 info:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan info file',
      error: error.message
    });
  }
};

/**
 * Get BHPRD Tahap 1 statistics
 */
const getBhprdT1Statistics = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../../public/bhprd-tahap1.json');
    
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'Data BHPRD Tahap 1 belum tersedia'
      });
    }

    const fileContent = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    // Calculate statistics
    const totalRealisasi = jsonData.reduce((sum, item) => {
      const realisasi = typeof item.Realisasi === 'string' 
        ? parseInt(item.Realisasi.replace(/,/g, '')) 
        : item.Realisasi || 0;
      return sum + realisasi;
    }, 0);

    const totalDesa = jsonData.length;
    const validDesa = jsonData.filter(item => {
      const realisasi = typeof item.Realisasi === 'string' 
        ? parseInt(item.Realisasi.replace(/,/g, '')) 
        : item.Realisasi;
      return realisasi > 0;
    }).length;

    res.json({
      success: true,
      data: {
        totalRealisasi,
        totalDesa,
        validDesa,
        averageRealisasi: totalDesa > 0 ? Math.round(totalRealisasi / totalDesa) : 0
      }
    });

  } catch (error) {
    console.error('Error getting BHPRD T1 statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan statistik',
      error: error.message
    });
  }
};

module.exports = {
  uploadBhprdT1Data,
  getBhprdT1Data,
  getBhprdT1Info,
  getBhprdT1Statistics
};
