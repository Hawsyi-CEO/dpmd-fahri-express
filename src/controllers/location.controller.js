const prisma = require('../config/prisma');
const logger = require('../utils/logger');

class LocationController {
  
  // GET /api/kecamatans - Get all kecamatans
  async getKecamatans(req, res, next) {
    try {
      logger.info('Fetching all kecamatans');

      const kecamatans = await prisma.kecamatans.findMany({
        orderBy: { nama: 'asc' }
      });

      logger.info(`Found ${kecamatans.length} kecamatans`);

      // Convert BigInt to String for JSON serialization
      const serializedData = kecamatans.map(kec => ({
        ...kec,
        id: kec.id.toString()
      }));

      return res.json({
        success: true,
        data: serializedData
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
        orderBy: { nama: 'asc' }
      });

      logger.info(`Found ${desas.length} desas`);

      // Convert BigInt to String for JSON serialization
      const serializedData = desas.map(desa => ({
        ...desa,
        id: desa.id.toString(),
        kecamatan_id: desa.kecamatan_id.toString()
      }));

      return res.json({
        success: true,
        data: serializedData
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
        where: { kecamatan_id: BigInt(kecamatanId) },
        orderBy: { nama: 'asc' }
      });

      logger.info(`Found ${desas.length} desas for kecamatan_id: ${kecamatanId}`);

      // Convert BigInt to String for JSON serialization
      const serializedData = desas.map(desa => ({
        ...desa,
        id: desa.id.toString(),
        kecamatan_id: desa.kecamatan_id.toString()
      }));

      return res.json({
        success: true,
        data: serializedData
      });

    } catch (error) {
      logger.error('Error getting desas by kecamatan:', error);
      next(error);
    }
  }

}

module.exports = new LocationController();
