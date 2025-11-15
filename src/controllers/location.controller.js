const prisma = require('../config/prisma');
const logger = require('../utils/logger');

class LocationController {
  
  // GET /api/kecamatans - Get all kecamatans
  async getKecamatans(req, res, next) {
    try {
      logger.info('Fetching all kecamatans');

      const kecamatans = await prisma.kecamatans.findMany({
        orderBy: { nama_kecamatan: 'asc' }
      });

      logger.info(`Found ${kecamatans.length} kecamatans`);

      return res.json({
        success: true,
        data: kecamatans
      });

    } catch (error) {
      logger.error('Error getting kecamatans:', error);
      next(error);
    }
  }

  // GET /api/desas - Get all desas
  async getDesas(req, res, next) {
    try {
      logger.info('Fetching all desas');

      const desas = await prisma.desas.findMany({
        orderBy: { nama_desa: 'asc' }
      });

      logger.info(`Found ${desas.length} desas`);

      return res.json({
        success: true,
        data: desas
      });

    } catch (error) {
      logger.error('Error getting desas:', error);
      next(error);
    }
  }

  // GET /api/desas/kecamatan/:kecamatanId - Get desas by kecamatan
  async getDesasByKecamatan(req, res, next) {
    try {
      const { kecamatanId } = req.params;

      logger.info(`Fetching desas for kecamatan_id: ${kecamatanId}`);

      const desas = await prisma.desas.findMany({
        where: { id_kecamatan: parseInt(kecamatanId) },
        orderBy: { nama_desa: 'asc' }
      });

      logger.info(`Found ${desas.length} desas for kecamatan_id: ${kecamatanId}`);

      return res.json({
        success: true,
        data: desas
      });

    } catch (error) {
      logger.error('Error getting desas by kecamatan:', error);
      next(error);
    }
  }

}

module.exports = new LocationController();
