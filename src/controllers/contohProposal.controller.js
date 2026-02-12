const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

class ContohProposalController {
  /**
   * Get list of example proposal files
   * GET /api/contoh-proposal/list
   */
  async getListContohProposal(req, res) {
    try {
      const contohProposalDir = path.join(__dirname, '../../public/contoh-proposal');
      
      // Check if directory exists
      if (!fs.existsSync(contohProposalDir)) {
        return res.status(404).json({
          success: false,
          message: 'Folder contoh proposal tidak ditemukan'
        });
      }

      // Read all files in directory
      const files = fs.readdirSync(contohProposalDir);
      
      // Categorize files
      const contohFiles = {
        cover: [],
        desa: [],
        kecamatan: []
      };

      files.forEach(file => {
        const filePath = path.join(contohProposalDir, file);
        const stats = fs.statSync(filePath);
        const ext = path.extname(file).toLowerCase();
        
        const fileInfo = {
          name: file,
          size: stats.size,
          extension: ext,
          download_url: `/api/contoh-proposal/download/${encodeURIComponent(file)}`
        };

        // Categorize by filename pattern
        if (file.startsWith('Cover_')) {
          contohFiles.cover.push({
            ...fileInfo,
            display_name: file.replace('Cover_', '').replace(ext, ''),
            type: 'cover',
            icon: 'image'
          });
        } else if (file.startsWith('DESA -')) {
          contohFiles.desa.push({
            ...fileInfo,
            display_name: file.replace('DESA - ', '').replace(ext, ''),
            type: 'dokumen',
            icon: 'file-text'
          });
        } else if (file.startsWith('KEC -')) {
          contohFiles.kecamatan.push({
            ...fileInfo,
            display_name: file.replace('KEC - ', '').replace(ext, ''),
            type: 'dokumen',
            icon: 'file-text'
          });
        }
      });

      res.json({
        success: true,
        data: contohFiles
      });
    } catch (error) {
      logger.error('Error getting contoh proposal list:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil daftar contoh proposal',
        error: error.message
      });
    }
  }

  /**
   * Download example proposal file
   * GET /api/contoh-proposal/download/:filename
   */
  async downloadContohProposal(req, res) {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '../../public/contoh-proposal', filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File tidak ditemukan'
        });
      }

      // Get file stats
      const stats = fs.statSync(filePath);
      const ext = path.extname(filename).toLowerCase();

      // Set content type based on extension
      let contentType = 'application/octet-stream';
      if (ext === '.docx') {
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else if (ext === '.doc') {
        contentType = 'application/msword';
      } else if (ext === '.pdf') {
        contentType = 'application/pdf';
      } else if (ext === '.png') {
        contentType = 'image/png';
      } else if (ext === '.jpg' || ext === '.jpeg') {
        contentType = 'image/jpeg';
      }

      // Set headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Content-Length', stats.size);

      // Stream file to response
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      logger.info(`✅ Contoh proposal downloaded: ${filename}`);
    } catch (error) {
      logger.error('Error downloading contoh proposal:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mendownload file',
        error: error.message
      });
    }
  }
}

module.exports = new ContohProposalController();
