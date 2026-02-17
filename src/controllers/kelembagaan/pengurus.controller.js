/**
 * Pengurus Controller
 * Handles pengurus (kelembagaan management/board members) operations
 * This is polymorphic - can be attached to any kelembagaan type
 */

const { prisma, ACTIVITY_TYPES, ENTITY_TYPES, logKelembagaanActivity, validateDesaAccess } = require('./base.controller');
const { v4: uuidv4 } = require('uuid');

class PengurusController {
  /**
   * List pengurus for desa user
   * GET /api/desa/pengurus
   */
  async listDesaPengurus(req, res) {
    try {
      const desaId = validateDesaAccess(req, res);
      if (!desaId) return;

      const { pengurusable_type, pengurusable_id } = req.query;
      const where = { desa_id: desaId };

      if (pengurusable_type) where.pengurusable_type = pengurusable_type;
      if (pengurusable_id) where.pengurusable_id = pengurusable_id;

      const pengurus = await prisma.pengurus.findMany({
        where,
        orderBy: [
          { jabatan: 'asc' },
          { created_at: 'desc' }
        ]
      });

      res.json({ success: true, data: pengurus });
    } catch (error) {
      console.error('Error in listDesaPengurus:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil data pengurus', error: error.message });
    }
  }

  /**
   * Show single pengurus for desa user
   * GET /api/desa/pengurus/:id
   */
  async showDesaPengurus(req, res) {
    try {
      const desaId = validateDesaAccess(req, res);
      if (!desaId) return;

      const pengurus = await prisma.pengurus.findFirst({
        where: {
          id: String(req.params.id),
          desa_id: desaId
        }
      });

      if (!pengurus) {
        return res.status(404).json({ success: false, message: 'Pengurus tidak ditemukan' });
      }

      res.json({ success: true, data: pengurus });
    } catch (error) {
      console.error('Error in showDesaPengurus:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil data pengurus', error: error.message });
    }
  }

  /**
   * Create pengurus
   * POST /api/desa/pengurus
   */
  async createPengurus(req, res) {
    try {
      const user = req.user;
      const desaId = validateDesaAccess(req, res);
      if (!desaId) return;

      const { 
        pengurusable_type, 
        pengurusable_id, 
        nama_lengkap, 
        jabatan, 
        no_telepon, 
        alamat,
        nik,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        status_perkawinan,
        pendidikan,
        tanggal_mulai_jabatan,
        tanggal_akhir_jabatan,
        status_jabatan,
        produk_hukum_id
      } = req.body;

      if (!pengurusable_type || !pengurusable_id || !nama_lengkap || !jabatan) {
        return res.status(400).json({ 
          success: false, 
          message: 'Kelembagaan type, ID, nama_lengkap, dan jabatan wajib diisi' 
        });
      }

      // Handle avatar upload if exists
      const avatarPath = req.file ? `uploads/pengurus_files/${req.file.filename}` : null;

      const pengurus = await prisma.pengurus.create({
        data: {
          id: uuidv4(),
          pengurusable_type,
          pengurusable_id,
          nama_lengkap,
          jabatan,
          no_telepon: no_telepon || null,
          alamat: alamat || null,
          nik: nik || null,
          tempat_lahir: tempat_lahir || null,
          tanggal_lahir: tanggal_lahir ? new Date(tanggal_lahir) : null,
          jenis_kelamin: jenis_kelamin || null,
          status_perkawinan: status_perkawinan || null,
          pendidikan: pendidikan || null,
          tanggal_mulai_jabatan: tanggal_mulai_jabatan ? new Date(tanggal_mulai_jabatan) : null,
          tanggal_akhir_jabatan: tanggal_akhir_jabatan ? new Date(tanggal_akhir_jabatan) : null,
          status_jabatan: status_jabatan || 'aktif',
          status_verifikasi: 'unverified',
          produk_hukum_id: produk_hukum_id || null,
          avatar: avatarPath,
          desa_id: desaId
        }
      });

      // Log activity
      await logKelembagaanActivity({
        kelembagaanType: pengurusable_type,
        kelembagaanId: pengurusable_id,
        kelembagaanNama: `${pengurusable_type} - ${pengurusable_id}`,
        desaId: desaId,
        activityType: ACTIVITY_TYPES.CREATE,
        entityType: ENTITY_TYPES.PENGURUS,
        entityId: pengurus.id,
        entityName: `${nama_lengkap} (${jabatan})`,
        oldValue: null,
        newValue: { nama_lengkap, jabatan, status_jabatan: 'aktif' },
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        bidangId: user.bidang_id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json({ success: true, data: pengurus });
    } catch (error) {
      console.error('Error in createPengurus:', error);
      res.status(500).json({ success: false, message: 'Gagal membuat pengurus', error: error.message });
    }
  }

  /**
   * Update pengurus
   * PUT /api/desa/pengurus/:id
   */
  async updatePengurus(req, res) {
    try {
      const user = req.user;
      const desaId = validateDesaAccess(req, res);
      if (!desaId) return;

      const existing = await prisma.pengurus.findFirst({
        where: {
          id: String(req.params.id),
          desa_id: desaId
        }
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Pengurus tidak ditemukan' });
      }

      const { nama, jabatan, no_hp, alamat } = req.body;

      const updated = await prisma.pengurus.update({
        where: { id: String(req.params.id) },
        data: {
          nama: nama || existing.nama,
          jabatan: jabatan || existing.jabatan,
          no_hp: no_hp !== undefined ? no_hp : existing.no_hp,
          alamat: alamat !== undefined ? alamat : existing.alamat
        }
      });

      // Log activity
      await logKelembagaanActivity({
        kelembagaanType: updated.pengurusable_type,
        kelembagaanId: updated.pengurusable_id,
        kelembagaanNama: `${updated.pengurusable_type} - ${updated.pengurusable_id}`,
        desaId: updated.desa_id,
        activityType: ACTIVITY_TYPES.UPDATE,
        entityType: ENTITY_TYPES.PENGURUS,
        entityId: updated.id,
        entityName: `${updated.nama} (${updated.jabatan})`,
        oldValue: { nama: existing.nama, jabatan: existing.jabatan },
        newValue: { nama: updated.nama, jabatan: updated.jabatan },
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        bidangId: user.bidang_id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      console.error('Error in updatePengurus:', error);
      res.status(500).json({ success: false, message: 'Gagal mengubah pengurus', error: error.message });
    }
  }

  /**
   * Delete pengurus
   * DELETE /api/desa/pengurus/:id
   */
  async deletePengurus(req, res) {
    try {
      const user = req.user;
      const desaId = validateDesaAccess(req, res);
      if (!desaId) return;

      const existing = await prisma.pengurus.findFirst({
        where: {
          id: String(req.params.id),
          desa_id: desaId
        }
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Pengurus tidak ditemukan' });
      }

      await prisma.pengurus.delete({
        where: { id: String(req.params.id) }
      });

      // Log activity
      await logKelembagaanActivity({
        kelembagaanType: existing.pengurusable_type,
        kelembagaanId: existing.pengurusable_id,
        kelembagaanNama: `${existing.pengurusable_type} - ${existing.pengurusable_id}`,
        desaId: existing.desa_id,
        activityType: 'delete',
        entityType: ENTITY_TYPES.PENGURUS,
        entityId: existing.id,
        entityName: `${existing.nama} (${existing.jabatan})`,
        oldValue: { nama: existing.nama, jabatan: existing.jabatan, status: existing.status },
        newValue: null,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        bidangId: user.bidang_id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json({ success: true, message: 'Pengurus berhasil dihapus' });
    } catch (error) {
      console.error('Error in deletePengurus:', error);
      res.status(500).json({ success: false, message: 'Gagal menghapus pengurus', error: error.message });
    }
  }

  /**
   * Update pengurus status
   * PUT /api/desa/pengurus/:id/status
   */
  async updatePengurusStatus(req, res) {
    try {
      const user = req.user;
      const desaId = validateDesaAccess(req, res);
      if (!desaId) return;

      const existing = await prisma.pengurus.findFirst({
        where: {
          id: String(req.params.id),
          desa_id: desaId
        }
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Pengurus tidak ditemukan' });
      }

      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: 'Status wajib diisi' });
      }

      const updated = await prisma.pengurus.update({
        where: { id: String(req.params.id) },
        data: { status }
      });

      // Log activity
      await logKelembagaanActivity({
        kelembagaanType: updated.pengurusable_type,
        kelembagaanId: updated.pengurusable_id,
        kelembagaanNama: `${updated.pengurusable_type} - ${updated.pengurusable_id}`,
        desaId: updated.desa_id,
        activityType: 'update_status',
        entityType: ENTITY_TYPES.PENGURUS,
        entityId: updated.id,
        entityName: `${updated.nama} (${updated.jabatan})`,
        oldValue: { status: existing.status },
        newValue: { status: updated.status },
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        bidangId: user.bidang_id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      console.error('Error in updatePengurusStatus:', error);
      res.status(500).json({ success: false, message: 'Gagal mengubah status pengurus', error: error.message });
    }
  }

  /**
   * Get pengurus by kelembagaan (for admin)
   * GET /api/kelembagaan/pengurus
   */
  async getPengurusByKelembagaan(req, res) {
    try {
      const { pengurusable_type, pengurusable_id, desa_id } = req.query;
      
      // CRITICAL FIX: Validate required parameters to prevent returning all pengurus
      if (!pengurusable_type || !pengurusable_id) {
        console.warn('Missing required params for getPengurusByKelembagaan');
        // Return empty array instead of all pengurus
        return res.json({ success: true, data: [] });
      }
      
      const where = {
        status_jabatan: 'aktif', // Only get active pengurus
        pengurusable_type: pengurusable_type, // ALWAYS filter by type
        pengurusable_id: pengurusable_id // ALWAYS filter by id
      };

      if (desa_id) where.desa_id = BigInt(desa_id);

      const pengurus = await prisma.pengurus.findMany({
        where,
        orderBy: [
          { jabatan: 'asc' },
          { created_at: 'desc' }
        ]
      });

      res.json({ success: true, data: pengurus });
    } catch (error) {
      console.error('❌ [getPengurusByKelembagaan] Error:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil data pengurus', error: error.message });
    }
  }

  /**
   * Get pengurus history (for admin)
   * GET /api/kelembagaan/pengurus/history
   */
  async getPengurusHistory(req, res) {
    try {
      const { pengurusable_type, pengurusable_id } = req.query;
      
      // CRITICAL FIX: Validate required parameters
      if (!pengurusable_type || !pengurusable_id) {
        console.warn('⚠️ [getPengurusHistory] Missing required params! Returning empty array.', {
          pengurusable_type,
          pengurusable_id
        });
        return res.json({ success: true, data: [] });
      }
      
      const where = {
        status_jabatan: 'selesai', // Only get former/inactive pengurus (enum value is 'selesai')
        pengurusable_type: pengurusable_type,
        pengurusable_id: pengurusable_id
      };

      const pengurus = await prisma.pengurus.findMany({
        where,
        orderBy: { created_at: 'desc' }
      });

      res.json({ success: true, data: pengurus });
    } catch (error) {
      console.error('Error in getPengurusHistory:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil riwayat pengurus', error: error.message });
    }
  }

  /**
   * Show pengurus (for admin)
   * GET /api/kelembagaan/pengurus/:id
   */
  async showPengurus(req, res) {
    try {
      console.log('🔍 [showPengurus] Getting pengurus with ID:', req.params.id);
      
      const pengurus = await prisma.pengurus.findUnique({
        where: { id: String(req.params.id) }
      });

      if (!pengurus) {
        console.log('❌ [showPengurus] Pengurus not found');
        return res.status(404).json({ success: false, message: 'Pengurus tidak ditemukan' });
      }

      console.log('📊 [showPengurus] Raw data from database:', {
        id: pengurus.id,
        nama_lengkap: pengurus.nama_lengkap,
        nik: pengurus.nik,
        status_verifikasi: pengurus.status_verifikasi,
        status_verifikasi_type: typeof pengurus.status_verifikasi
      });
      console.log('📤 [showPengurus] Full pengurus object:', JSON.stringify(pengurus, null, 2));

      res.json({ success: true, data: pengurus });
    } catch (error) {
      console.error('Error in showPengurus:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil data pengurus', error: error.message });
    }
  }

  /**
   * Update pengurus verification status (for admin only)
   * PUT /api/admin/pengurus/:id/verifikasi
   */
  async updateVerifikasi(req, res) {
    try {
      console.log('🔐 [updateVerifikasi] Request received');
      console.log('👤 User:', {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role,
        bidang_id: req.user.bidang_id
      });
      console.log('📋 Params:', req.params);
      console.log('📦 Body:', req.body);
      
      const user = req.user;
      
      // Validate admin access (only admin bidang PMD or superadmin)
      const isAdmin = user.role === 'superadmin' || 
                     (user.role === 'kepala_bidang' && user.bidang_id === 5) || 
                     (user.role === 'pegawai' && user.bidang_id === 5);
      
      console.log('✅ Is admin check:', isAdmin);
      
      if (!isAdmin) {
        console.log('❌ Access denied - not admin');
        return res.status(403).json({ 
          success: false, 
          message: 'Hanya admin bidang Pemberdayaan Masyarakat yang dapat mengubah status verifikasi' 
        });
      }

      const { status_verifikasi } = req.body;
      
      if (!status_verifikasi || !['verified', 'unverified'].includes(status_verifikasi)) {
        console.log('❌ Invalid status_verifikasi:', status_verifikasi);
        return res.status(400).json({ 
          success: false, 
          message: 'Status verifikasi harus "verified" atau "unverified"' 
        });
      }

      console.log('🔍 Finding pengurus with ID:', req.params.id);
      const existing = await prisma.pengurus.findUnique({
        where: { id: String(req.params.id) }
      });

      if (!existing) {
        console.log('❌ Pengurus not found');
        return res.status(404).json({ success: false, message: 'Pengurus tidak ditemukan' });
      }

      console.log('📊 Current pengurus:', {
        id: existing.id,
        nama_lengkap: existing.nama_lengkap,
        current_status: existing.status_verifikasi
      });

      console.log('💾 Updating status to:', status_verifikasi);
      const updated = await prisma.pengurus.update({
        where: { id: String(req.params.id) },
        data: { status_verifikasi }
      });

      console.log('✅ Pengurus updated successfully');

      // Log activity
      await logKelembagaanActivity({
        kelembagaanType: updated.pengurusable_type,
        kelembagaanId: updated.pengurusable_id,
        kelembagaanNama: `${updated.pengurusable_type} - ${updated.pengurusable_id}`,
        desaId: updated.desa_id,
        activityType: ACTIVITY_TYPES.VERIFY_PENGURUS,
        entityType: ENTITY_TYPES.PENGURUS,
        entityId: updated.id,
        entityName: `${updated.nama_lengkap} (${updated.jabatan})`,
        oldValue: { status_verifikasi: existing.status_verifikasi },
        newValue: { status_verifikasi: updated.status_verifikasi },
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        bidangId: user.bidang_id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      console.log('✅ Activity logged successfully');
      console.log('📤 Sending response...');
      
      res.json({ success: true, data: updated });
    } catch (error) {
      console.error('❌ Error in updateVerifikasi:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ success: false, message: 'Gagal mengubah status verifikasi', error: error.message });
    }
  }
}

module.exports = new PengurusController();
