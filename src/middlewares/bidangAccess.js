/**
 * Middleware to check if user has access to specific bidang
 * 
 * Access Rules:
 * - pegawai: Can only access their own bidang (based on bidang_id)
 * - kepala_bidang: Can only access their own bidang (based on bidang_id)
 * - ketua_tim: Can only access their own bidang (based on bidang_id)
 * - kepala_dinas: Can access all bidangs
 * - sekretaris_dinas: Can access all bidangs
 * - superadmin: Can access all bidangs
 */

const checkBidangAccess = (req, res, next) => {
  try {
    const { bidangId } = req.params;
    const user = req.user;

    console.log('🔐 [Bidang Access Check]', {
      requestedBidangId: bidangId,
      userRole: user.role,
      userBidangId: user.bidang_id,
      userId: user.id
    });

    // Superadmin and Kepala Dinas have full access
    if (user.role === 'superadmin' || user.role === 'kepala_dinas') {
      console.log('✅ [Bidang Access] Full access granted (superadmin/kepala_dinas)');
      return next();
    }

    // Special roles for specific bidangs
    // Sarana Prasarana role -> Bidang 3 (SPKED)
    // Kekayaan Keuangan role -> Bidang 4 (KKD)
    if (user.role === 'sarana_prasarana' && String(bidangId) === '3') {
      console.log('✅ [Bidang Access] Sarana Prasarana accessing SPKED (bidang 3)');
      return next();
    }

    if (user.role === 'kekayaan_keuangan' && String(bidangId) === '4') {
      console.log('✅ [Bidang Access] Kekayaan Keuangan accessing KKD (bidang 4)');
      return next();
    }

    if (user.role === 'pemberdayaan_masyarakat' && String(bidangId) === '5') {
      console.log('✅ [Bidang Access] Pemberdayaan Masyarakat accessing PMD (bidang 5)');
      return next();
    }

    if (user.role === 'pemerintahan_desa' && String(bidangId) === '6') {
      console.log('✅ [Bidang Access] Pemerintahan Desa accessing Pemdes (bidang 6)');
      return next();
    }

    if (user.role === 'sekretariat' && String(bidangId) === '2') {
      console.log('✅ [Bidang Access] Sekretariat accessing Sekretariat (bidang 2)');
      return next();
    }

    // Pegawai, Kepala Bidang, and Ketua Tim can only access their own bidang
    if (user.role === 'pegawai' || user.role === 'kepala_bidang' || user.role === 'ketua_tim') {
      const userBidangId = user.bidang_id;
      
      if (!userBidangId) {
        console.log('❌ [Bidang Access] User has no bidang_id assigned');
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki bidang yang ditugaskan'
        });
      }

      // Convert both to string for comparison
      if (String(userBidangId) !== String(bidangId)) {
        console.log('❌ [Bidang Access] Bidang mismatch:', { userBidangId, requestedBidangId: bidangId });
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses ke bidang ini'
        });
      }

      console.log('✅ [Bidang Access] Access granted to own bidang');
      return next();
    }

    // Other roles don't have bidang access
    console.log('❌ [Bidang Access] Role not authorized:', user.role);
    return res.status(403).json({
      success: false,
      message: 'Role Anda tidak memiliki akses ke bidang'
    });

  } catch (error) {
    console.error('Error checking bidang access:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memeriksa akses',
      error: error.message
    });
  }
};

module.exports = { checkBidangAccess };
