const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const CONTOH_DIR = path.join(__dirname, '../../public/contoh-proposal');

// Helper: get content type from extension
function getContentType(ext) {
  const map = {
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc': 'application/msword',
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls': 'application/vnd.ms-excel',
  };
  return map[ext] || 'application/octet-stream';
}

// Helper: categorize a file into cover/desa/kecamatan/lainnya
function categorizeFile(file) {
  const ext = path.extname(file).toLowerCase();
  const stats = fs.statSync(path.join(CONTOH_DIR, file));
  const fileInfo = {
    name: file,
    size: stats.size,
    extension: ext,
    modified_at: stats.mtime,
    download_url: `/api/contoh-proposal/download/${encodeURIComponent(file)}`
  };

  if (file.startsWith('Cover_')) {
    return { category: 'cover', ...fileInfo, display_name: file.replace('Cover_', '').replace(ext, ''), type: 'cover', icon: 'image' };
  } else if (file.startsWith('DESA -') || file.startsWith('DESA -')) {
    return { category: 'desa', ...fileInfo, display_name: file.replace(/^DESA\s*-\s*/, '').replace(ext, ''), type: 'dokumen', icon: 'file-text' };
  } else if (file.startsWith('KEC -') || file.startsWith('KEC -')) {
    return { category: 'kecamatan', ...fileInfo, display_name: file.replace(/^KEC\s*-\s*/, '').replace(ext, ''), type: 'dokumen', icon: 'file-text' };
  } else {
    return { category: 'lainnya', ...fileInfo, display_name: file.replace(ext, ''), type: 'dokumen', icon: 'file' };
  }
}

class ContohProposalController {
  /**
   * Get list of example proposal files
   * GET /api/contoh-proposal/list
   */
  async getListContohProposal(req, res) {
    try {
      if (!fs.existsSync(CONTOH_DIR)) {
        return res.json({
          success: true,
          data: { cover: [], desa: [], kecamatan: [] }
        });
      }

      const files = fs.readdirSync(CONTOH_DIR).filter(f => !f.startsWith('.'));
      const contohFiles = { cover: [], desa: [], kecamatan: [] };

      files.forEach(file => {
        const info = categorizeFile(file);
        const { category, ...rest } = info;
        if (contohFiles[category]) {
          contohFiles[category].push(rest);
        }
      });

      res.json({ success: true, data: contohFiles });
    } catch (error) {
      logger.error('Error getting contoh proposal list:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil daftar contoh proposal', error: error.message });
    }
  }

  /**
   * Get ALL files (flat list) for admin management
   * GET /api/contoh-proposal/admin/list
   */
  async getAdminList(req, res) {
    try {
      if (!fs.existsSync(CONTOH_DIR)) {
        fs.mkdirSync(CONTOH_DIR, { recursive: true });
      }

      const files = fs.readdirSync(CONTOH_DIR).filter(f => !f.startsWith('.'));
      const fileList = files.map(file => categorizeFile(file));

      res.json({ success: true, data: fileList });
    } catch (error) {
      logger.error('Error getting admin contoh list:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil daftar file', error: error.message });
    }
  }

  /**
   * Upload new contoh file (or replace existing)
   * POST /api/contoh-proposal/admin/upload
   * Body (multipart): file, kategori (cover|desa|kecamatan), custom_name (optional)
   */
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'File wajib diupload' });
      }

      const { kategori, custom_name, replace_file } = req.body;

      // If replacing an existing file, delete the old one
      if (replace_file) {
        const oldPath = path.join(CONTOH_DIR, replace_file);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
          logger.info(`🗑️ Deleted old file for replacement: ${replace_file}`);
        }
      }

      // Build prefix based on kategori
      let prefix = '';
      if (kategori === 'cover') prefix = 'Cover_';
      else if (kategori === 'desa') prefix = 'DESA - ';
      else if (kategori === 'kecamatan') prefix = 'KEC - ';

      // Build filename
      const ext = path.extname(req.file.originalname);
      let finalName;
      if (custom_name && custom_name.trim()) {
        finalName = `${prefix}${custom_name.trim()}${ext}`;
      } else {
        // Use original name but ensure prefix
        const origBase = path.basename(req.file.originalname, ext);
        // Remove existing prefix if already present
        const cleanBase = origBase.replace(/^(Cover_|DESA\s*-\s*|KEC\s*-\s*)/i, '');
        finalName = `${prefix}${cleanBase}${ext}`;
      }

      // Move/rename the uploaded file
      const tempPath = req.file.path;
      const finalPath = path.join(CONTOH_DIR, finalName);

      // If a file with same name exists, overwrite
      fs.renameSync(tempPath, finalPath);

      logger.info(`✅ Contoh proposal uploaded: ${finalName} by user ${req.user?.id}`);

      const info = categorizeFile(finalName);
      res.json({
        success: true,
        message: `File "${finalName}" berhasil diupload`,
        data: info
      });
    } catch (error) {
      // Clean up temp file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      logger.error('Error uploading contoh file:', error);
      res.status(500).json({ success: false, message: 'Gagal mengupload file', error: error.message });
    }
  }

  /**
   * Rename a contoh file
   * PUT /api/contoh-proposal/admin/rename
   * Body: { old_name, new_name }
   */
  async renameFile(req, res) {
    try {
      const { old_name, new_name } = req.body;
      if (!old_name || !new_name) {
        return res.status(400).json({ success: false, message: 'old_name dan new_name wajib diisi' });
      }

      const oldPath = path.join(CONTOH_DIR, old_name);
      if (!fs.existsSync(oldPath)) {
        return res.status(404).json({ success: false, message: 'File tidak ditemukan' });
      }

      const newPath = path.join(CONTOH_DIR, new_name);
      fs.renameSync(oldPath, newPath);

      logger.info(`✏️ Contoh proposal renamed: ${old_name} → ${new_name}`);
      res.json({ success: true, message: `File berhasil direname menjadi "${new_name}"` });
    } catch (error) {
      logger.error('Error renaming contoh file:', error);
      res.status(500).json({ success: false, message: 'Gagal merename file', error: error.message });
    }
  }

  /**
   * Delete a contoh file
   * DELETE /api/contoh-proposal/admin/:filename
   */
  async deleteFile(req, res) {
    try {
      const { filename } = req.params;
      const filePath = path.join(CONTOH_DIR, decodeURIComponent(filename));

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'File tidak ditemukan' });
      }

      fs.unlinkSync(filePath);
      logger.info(`🗑️ Contoh proposal deleted: ${filename} by user ${req.user?.id}`);

      res.json({ success: true, message: `File "${filename}" berhasil dihapus` });
    } catch (error) {
      logger.error('Error deleting contoh file:', error);
      res.status(500).json({ success: false, message: 'Gagal menghapus file', error: error.message });
    }
  }

  /**
   * Download example proposal file
   * GET /api/contoh-proposal/download/:filename
   */
  async downloadContohProposal(req, res) {
    try {
      const { filename } = req.params;
      const filePath = path.join(CONTOH_DIR, decodeURIComponent(filename));

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'File tidak ditemukan' });
      }

      const stats = fs.statSync(filePath);
      const ext = path.extname(filename).toLowerCase();

      res.setHeader('Content-Type', getContentType(ext));
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Content-Length', stats.size);

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      logger.info(`✅ Contoh proposal downloaded: ${filename}`);
    } catch (error) {
      logger.error('Error downloading contoh proposal:', error);
      res.status(500).json({ success: false, message: 'Gagal mendownload file', error: error.message });
    }
  }
}

module.exports = new ContohProposalController();
