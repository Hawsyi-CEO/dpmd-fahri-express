/**
 * External Aparatur Desa Controller
 * Proxy controller for fetching Aparatur Desa data from external DPMD API
 */

const externalApiService = require('../services/externalApiProxy.service');

/**
 * Get all aparatur desa from external API
 * GET /api/external/aparatur-desa
 * 
 * Query Parameters:
 * - name: Pencarian nama (Partial Match)
 * - job_type: "BPD" / "Perangkat Desa"
 * - master_district_id: Kode wilayah Kecamatan (e.g. "32.01.01")
 * - master_village_id: Kode wilayah Desa (e.g. "32.01.01.2001")
 * - gender: "L" / "P"
 * - status_pns: "PNS" / "NON PNS"
 * - min_age / max_age: Filter rentang usia
 * - page: Halaman data
 * - limit: Jumlah per halaman
 */
const getAparaturDesa = async (req, res) => {
	try {
		const { 
			name, 
			job_type, 
			master_district_id, 
			master_village_id, 
			gender, 
			status_pns, 
			min_age, 
			max_age, 
			page, 
			limit 
		} = req.query;
		
		const data = await externalApiService.fetchAparaturDesa({
			name,
			job_type,
			master_district_id,
			master_village_id,
			gender,
			status_pns,
			min_age,
			max_age,
			page: page || 1,
			limit: limit || 20
		});

		res.json({
			success: true,
			message: 'Data Aparatur Desa dari External API',
			...data
		});
	} catch (error) {
		console.error('[ExternalController] Error:', error.message);
		res.status(500).json({
			success: false,
			message: 'Gagal mengambil data dari external API',
			error: error.message
		});
	}
};

/**
 * Get single aparatur desa by ID from external API
 * GET /api/external/aparatur-desa/:id
 */
const getAparaturDesaById = async (req, res) => {
	try {
		const { id } = req.params;
		
		const data = await externalApiService.fetchAparaturDesaById(id);

		res.json({
			success: true,
			message: 'Detail Aparatur Desa',
			data
		});
	} catch (error) {
		console.error('[ExternalController] Error:', error.message);
		res.status(500).json({
			success: false,
			message: 'Gagal mengambil detail aparatur desa',
			error: error.message
		});
	}
};

/**
 * Get aparatur desa statistics from external API
 * GET /api/external/aparatur-desa/stats
 */
const getAparaturDesaStats = async (req, res) => {
	try {
		const { kecamatan_id } = req.query;
		
		const data = await externalApiService.fetchAparaturDesaStats({
			kecamatan_id
		});

		res.json({
			success: true,
			message: 'Statistik Aparatur Desa',
			...data
		});
	} catch (error) {
		console.error('[ExternalController] Error:', error.message);
		res.status(500).json({
			success: false,
			message: 'Gagal mengambil statistik',
			error: error.message
		});
	}
};

/**
 * Get list of kecamatan from external API
 * GET /api/external/kecamatan
 */
const getKecamatanList = async (req, res) => {
	try {
		const data = await externalApiService.fetchKecamatanList();

		res.json({
			success: true,
			message: 'Daftar Kecamatan',
			...data
		});
	} catch (error) {
		console.error('[ExternalController] Error:', error.message);
		res.status(500).json({
			success: false,
			message: 'Gagal mengambil daftar kecamatan',
			error: error.message
		});
	}
};

/**
 * Get list of desa by kecamatan from external API
 * GET /api/external/desa
 */
const getDesaByKecamatan = async (req, res) => {
	try {
		const { master_district_id } = req.query;
		
		if (!master_district_id) {
			return res.status(400).json({
				success: false,
				message: 'Parameter master_district_id diperlukan'
			});
		}

		const data = await externalApiService.fetchDesaByKecamatan(master_district_id);

		res.json({
			success: true,
			message: 'Daftar Desa',
			...data
		});
	} catch (error) {
		console.error('[ExternalController] Error:', error.message);
		res.status(500).json({
			success: false,
			message: 'Gagal mengambil daftar desa',
			error: error.message
		});
	}
};

/**
 * Get external API connection status
 * GET /api/external/status
 */
const getConnectionStatus = async (req, res) => {
	try {
		const tokenStatus = externalApiService.getTokenStatus();
		
		// Try to authenticate if no valid token
		if (!tokenStatus.isValid) {
			await externalApiService.getAPIToken();
		}

		const updatedStatus = externalApiService.getTokenStatus();

		res.json({
			success: true,
			message: 'Status koneksi External API',
			data: {
				connected: updatedStatus.isValid,
				...updatedStatus
			}
		});
	} catch (error) {
		console.error('[ExternalController] Status check error:', error.message);
		res.json({
			success: false,
			message: 'Tidak dapat terhubung ke External API',
			data: {
				connected: false,
				error: error.message
			}
		});
	}
};

/**
 * Clear token cache (admin only)
 * POST /api/external/clear-cache
 */
const clearCache = async (req, res) => {
	try {
		externalApiService.clearTokenCache();
		
		res.json({
			success: true,
			message: 'Cache token berhasil dihapus'
		});
	} catch (error) {
		console.error('[ExternalController] Clear cache error:', error.message);
		res.status(500).json({
			success: false,
			message: 'Gagal menghapus cache',
			error: error.message
		});
	}
};

module.exports = {
	getAparaturDesa,
	getAparaturDesaById,
	getAparaturDesaStats,
	getKecamatanList,
	getDesaByKecamatan,
	getConnectionStatus,
	clearCache
};
