const Kecamatan = require('../models/Kecamatan');
const Desa = require('../models/Desa');
const logger = require('../utils/logger');

class LocationController {
  
  // GET /api/kecamatans - Get all kecamatans
  async getKecamatans(req, res, next) {
    try {
      logger.info('Fetching all kecamatans');

      const kecamatans = await Kecamatan.findAll({
        order: [['nama', 'ASC']]
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

      const desas = await Desa.findAll({
        order: [['nama', 'ASC']]
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

      const desas = await Desa.findAll({
        where: { kecamatan_id: kecamatanId },
        order: [['nama', 'ASC']]
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
