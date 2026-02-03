const prisma = require('../config/prisma');
const path = require('path');
const fs = require('fs').promises;

/**
 * Get profil desa for logged-in user's desa
 */
const getProfilDesa = async (req, res) => {
  try {
    const { desa_id } = req.user;

    // Get profil_desa with desa info
    let profilDesa = await prisma.profil_desas.findUnique({
      where: { desa_id: BigInt(desa_id) },
      include: {
        desas: {
          select: {
            id: true,
            nama: true,
            status_pemerintahan: true,
            kode: true,
            kecamatan_id: true,
            kecamatans: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
        },
      },
    });

    // If profil doesn't exist, create a default one
    if (!profilDesa) {
      profilDesa = await prisma.profil_desas.create({
        data: {
          desa_id: BigInt(desa_id),
        },
        include: {
          desas: {
            select: {
              id: true,
              nama: true,
              status_pemerintahan: true,
              kode: true,
              kecamatan_id: true,
              kecamatans: {
                select: {
                  id: true,
                  nama: true,
                },
              },
            },
          },
        },
      });
    }

    // Convert BigInt to string for JSON serialization
    const result = {
      ...profilDesa,
      id: profilDesa.id.toString(),
      desa_id: profilDesa.desa_id.toString(),
      desa: {
        ...profilDesa.desas,
        id: profilDesa.desas.id.toString(),
        kecamatan_id: profilDesa.desas.kecamatan_id?.toString(),
        kecamatan: profilDesa.desas.kecamatans,
      },
    };

    // Remove desas property
    delete result.desas;

    res.json(result);
  } catch (error) {
    console.error('Error fetching profil desa:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil profil desa',
      error: error.message,
    });
  }
};

/**
 * Update profil desa for logged-in user's desa
 */
const updateProfilDesa = async (req, res) => {
  try {
    const { desa_id } = req.user;
    const {
      klasifikasi_desa,
      status_desa,
      tipologi_desa,
      jumlah_penduduk,
      sejarah_desa,
      demografi,
      potensi_desa,
      no_telp,
      email,
      instagram_url,
      youtube_url,
      luas_wilayah,
      alamat_kantor,
      radius_ke_kecamatan,
      latitude,
      longitude,
    } = req.body;

    // Prepare update data
    const updateData = {
      klasifikasi_desa: klasifikasi_desa || null,
      status_desa: status_desa || null,
      tipologi_desa: tipologi_desa || null,
      jumlah_penduduk: jumlah_penduduk ? parseInt(jumlah_penduduk) : null,
      sejarah_desa: sejarah_desa || null,
      demografi: demografi || null,
      potensi_desa: potensi_desa || null,
      no_telp: no_telp || null,
      email: email || null,
      instagram_url: instagram_url || null,
      youtube_url: youtube_url || null,
      luas_wilayah: luas_wilayah || null,
      alamat_kantor: alamat_kantor || null,
      radius_ke_kecamatan: radius_ke_kecamatan || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
    };

    // Handle file upload for foto_kantor_desa
    if (req.file) {
      // Delete old file if exists
      const existingProfile = await prisma.profil_desas.findUnique({
        where: { desa_id: BigInt(desa_id) },
      });

      if (existingProfile?.foto_kantor_desa_path) {
        const oldFilePath = path.join(
          __dirname,
          '../../storage/uploads',
          existingProfile.foto_kantor_desa_path
        );
        try {
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.error('Error deleting old file:', err);
        }
      }

      // Save new file path with folder
      updateData.foto_kantor_desa_path = `profil_desa/${req.file.filename}`;
    }

    // Update or create profil_desas
    const profilDesa = await prisma.profil_desas.upsert({
      where: { desa_id: BigInt(desa_id) },
      create: {
        desa_id: BigInt(desa_id),
        ...updateData,
      },
      update: updateData,
      include: {
        desas: {
          select: {
            id: true,
            nama: true,
            status_pemerintahan: true,
            kode: true,
            kecamatan_id: true,
            kecamatans: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
        },
      },
    });

    // Convert BigInt to string
    const result = {
      ...profilDesa,
      id: profilDesa.id.toString(),
      desa_id: profilDesa.desa_id.toString(),
      desa: {
        ...profilDesa.desas,
        id: profilDesa.desas.id.toString(),
        kecamatan_id: profilDesa.desas.kecamatan_id?.toString(),
        kecamatan: profilDesa.desas.kecamatans,
      },
    };

    // Remove desas property
    delete result.desas;

    res.json({
      success: true,
      message: 'Profil desa berhasil diperbarui',
      data: result,
    });
  } catch (error) {
    console.error('Error updating profil desa:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui profil desa',
      error: error.message,
    });
  }
};

module.exports = {
  getProfilDesa,
  updateProfilDesa,
};
