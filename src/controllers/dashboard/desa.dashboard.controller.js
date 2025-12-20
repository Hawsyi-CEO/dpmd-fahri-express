// src/controllers/dashboard/desa.dashboard.controller.js
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Validate desa access from request
 */
function validateDesaAccess(req, res) {
  const user = req.user;
  
  if (!user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return null;
  }

  if (user.role !== 'desa') {
    res.status(403).json({ success: false, message: 'Akses ditolak. Hanya untuk user desa.' });
    return null;
  }

  // Check both desa_id (from middleware) and desaId (camelCase)
  const desaId = user.desa_id ? BigInt(user.desa_id) : (user.desaId ? BigInt(user.desaId) : null);
  
  if (!desaId) {
    res.status(400).json({ success: false, message: 'Desa ID tidak ditemukan' });
    return null;
  }

  return desaId;
}

/**
 * Helper function to read and parse JSON file from public folder
 */
function readPublicJsonFile(filename) {
  try {
    const filePath = path.join(__dirname, '../../../public', filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

/**
 * Helper function to clean currency string to number
 */
function cleanCurrency(value) {
  if (!value || value === "0") return 0;
  
  // Format in JSON uses comma as thousand separator
  // Example: "478,327,869" should become 478327869
  // Remove all commas and dots
  const cleaned = value.replace(/[,.]/g, '');
  return parseFloat(cleaned);
}

/**
 * Helper function to format number to IDR currency
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
}

/**
 * Get dashboard summary for specific desa
 * GET /api/desa/dashboard/summary
 */
async function getDesaDashboardSummary(req, res) {
  try {
    const desaId = validateDesaAccess(req, res);
    if (!desaId) return;

    // 1. Get desa info
    const desa = await prisma.desas.findUnique({
      where: { id: desaId },
      select: {
        id: true,
        nama: true,
        status_pemerintahan: true,
        kecamatans: {
          select: {
            id: true,
            nama: true
          }
        }
      }
    });

    if (!desa) {
      return res.status(404).json({
        success: false,
        message: 'Data desa tidak ditemukan'
      });
    }

    // 2. Get kelembagaan summary
    const [totalRW, totalRT, totalPosyandu, karangTaruna, lpm, satlinmas, pkk] = await Promise.all([
      prisma.rws.count({ where: { desa_id: desaId } }),
      prisma.rts.count({ where: { desa_id: desaId } }),
      prisma.posyandus.count({ where: { desa_id: desaId } }),
      prisma.karang_tarunas.findFirst({ where: { desa_id: desaId } }),
      prisma.lpms.findFirst({ where: { desa_id: desaId } }),
      prisma.satlinmas.findFirst({ where: { desa_id: desaId } }),
      prisma.pkks.findFirst({ where: { desa_id: desaId } })
    ]);

    // 3. Read financial data from JSON files
    // ADD 2025
    const add2025Data = readPublicJsonFile('add2025.json');
    
    // BHPRD - 3 tahap
    const bhprdTahap1Data = readPublicJsonFile('bhprd-tahap1.json');
    const bhprdTahap2Data = readPublicJsonFile('bhprd-tahap2.json');
    const bhprdTahap3Data = readPublicJsonFile('bhprd-tahap3.json');
    
    // DD - 4 file (earmarked dan nonearmarked masing-masing 2 tahap)
    const ddEarmarkedTahap1Data = readPublicJsonFile('dd-earmarked-tahap1.json');
    const ddEarmarkedTahap2Data = readPublicJsonFile('dd-earmarked-tahap2.json');
    const ddNonearmarkedTahap1Data = readPublicJsonFile('dd-nonearmarked-tahap1.json');
    const ddNonearmarkedTahap2Data = readPublicJsonFile('dd-nonearmarked-tahap2.json');
    
    // Bankeu - 2 tahap
    const bankeuTahap1Data = readPublicJsonFile('bankeu-tahap1.json');
    const bankeuTahap2Data = readPublicJsonFile('bankeu-tahap2.json');

    // Normalize desa name for comparison (uppercase and trim)
    const desaNama = desa.nama.toUpperCase().trim();
    const kecamatanNama = desa.kecamatans?.nama.toUpperCase().trim();

    // 4. Find data for this desa from JSON files
    const findDesaData = (dataArray) => {
      return dataArray.find(item => 
        item.desa?.toUpperCase().trim() === desaNama && 
        item.kecamatan?.toUpperCase().trim() === kecamatanNama
      );
    };

    // Find ADD data
    const addData = findDesaData(add2025Data);
    
    // Find BHPRD data per tahap
    const bhprdTahap1 = findDesaData(bhprdTahap1Data);
    const bhprdTahap2 = findDesaData(bhprdTahap2Data);
    const bhprdTahap3 = findDesaData(bhprdTahap3Data);
    
    // Find DD data per tahap dan jenis
    const ddEarmarkedT1 = findDesaData(ddEarmarkedTahap1Data);
    const ddEarmarkedT2 = findDesaData(ddEarmarkedTahap2Data);
    const ddNonearmarkedT1 = findDesaData(ddNonearmarkedTahap1Data);
    const ddNonearmarkedT2 = findDesaData(ddNonearmarkedTahap2Data);
    
    // Find Bankeu data per tahap
    const bankeuTahap1 = findDesaData(bankeuTahap1Data);
    const bankeuTahap2 = findDesaData(bankeuTahap2Data);

    // 5. Prepare financial data response
    const financialData = {
      add: {
        status: addData?.sts || 'Data tidak tersedia',
        realisasi: addData ? cleanCurrency(addData.Realisasi) : 0,
        realisasiFormatted: addData ? addData.Realisasi : '0',
        hasData: !!addData
      },
      bhprd: {
        tahap1: {
          status: bhprdTahap1?.sts || 'Data tidak tersedia',
          realisasi: bhprdTahap1 ? cleanCurrency(bhprdTahap1.Realisasi) : 0,
          realisasiFormatted: bhprdTahap1 ? bhprdTahap1.Realisasi : '0',
          hasData: !!bhprdTahap1
        },
        tahap2: {
          status: bhprdTahap2?.sts || 'Data tidak tersedia',
          realisasi: bhprdTahap2 ? cleanCurrency(bhprdTahap2.Realisasi) : 0,
          realisasiFormatted: bhprdTahap2 ? bhprdTahap2.Realisasi : '0',
          hasData: !!bhprdTahap2
        },
        tahap3: {
          status: bhprdTahap3?.sts || 'Data tidak tersedia',
          realisasi: bhprdTahap3 ? cleanCurrency(bhprdTahap3.Realisasi) : 0,
          realisasiFormatted: bhprdTahap3 ? bhprdTahap3.Realisasi : '0',
          hasData: !!bhprdTahap3
        },
        total: (bhprdTahap1 ? cleanCurrency(bhprdTahap1.Realisasi) : 0) +
               (bhprdTahap2 ? cleanCurrency(bhprdTahap2.Realisasi) : 0) +
               (bhprdTahap3 ? cleanCurrency(bhprdTahap3.Realisasi) : 0),
        totalFormatted: formatCurrency(
          (bhprdTahap1 ? cleanCurrency(bhprdTahap1.Realisasi) : 0) +
          (bhprdTahap2 ? cleanCurrency(bhprdTahap2.Realisasi) : 0) +
          (bhprdTahap3 ? cleanCurrency(bhprdTahap3.Realisasi) : 0)
        )
      },
      dd: {
        earmarked: {
          tahap1: {
            status: ddEarmarkedT1?.sts || 'Data tidak tersedia',
            realisasi: ddEarmarkedT1 ? cleanCurrency(ddEarmarkedT1.Realisasi) : 0,
            realisasiFormatted: ddEarmarkedT1 ? ddEarmarkedT1.Realisasi : '0',
            hasData: !!ddEarmarkedT1
          },
          tahap2: {
            status: ddEarmarkedT2?.sts || 'Data tidak tersedia',
            realisasi: ddEarmarkedT2 ? cleanCurrency(ddEarmarkedT2.Realisasi) : 0,
            realisasiFormatted: ddEarmarkedT2 ? ddEarmarkedT2.Realisasi : '0',
            hasData: !!ddEarmarkedT2
          },
          total: (ddEarmarkedT1 ? cleanCurrency(ddEarmarkedT1.Realisasi) : 0) +
                 (ddEarmarkedT2 ? cleanCurrency(ddEarmarkedT2.Realisasi) : 0)
        },
        nonearmarked: {
          tahap1: {
            status: ddNonearmarkedT1?.sts || 'Data tidak tersedia',
            realisasi: ddNonearmarkedT1 ? cleanCurrency(ddNonearmarkedT1.Realisasi) : 0,
            realisasiFormatted: ddNonearmarkedT1 ? ddNonearmarkedT1.Realisasi : '0',
            hasData: !!ddNonearmarkedT1
          },
          tahap2: {
            status: ddNonearmarkedT2?.sts || 'Data tidak tersedia',
            realisasi: ddNonearmarkedT2 ? cleanCurrency(ddNonearmarkedT2.Realisasi) : 0,
            realisasiFormatted: ddNonearmarkedT2 ? ddNonearmarkedT2.Realisasi : '0',
            hasData: !!ddNonearmarkedT2
          },
          total: (ddNonearmarkedT1 ? cleanCurrency(ddNonearmarkedT1.Realisasi) : 0) +
                 (ddNonearmarkedT2 ? cleanCurrency(ddNonearmarkedT2.Realisasi) : 0)
        },
        total: (ddEarmarkedT1 ? cleanCurrency(ddEarmarkedT1.Realisasi) : 0) +
               (ddEarmarkedT2 ? cleanCurrency(ddEarmarkedT2.Realisasi) : 0) +
               (ddNonearmarkedT1 ? cleanCurrency(ddNonearmarkedT1.Realisasi) : 0) +
               (ddNonearmarkedT2 ? cleanCurrency(ddNonearmarkedT2.Realisasi) : 0),
        totalFormatted: formatCurrency(
          (ddEarmarkedT1 ? cleanCurrency(ddEarmarkedT1.Realisasi) : 0) +
          (ddEarmarkedT2 ? cleanCurrency(ddEarmarkedT2.Realisasi) : 0) +
          (ddNonearmarkedT1 ? cleanCurrency(ddNonearmarkedT1.Realisasi) : 0) +
          (ddNonearmarkedT2 ? cleanCurrency(ddNonearmarkedT2.Realisasi) : 0)
        )
      },
      bankeu: {
        tahap1: {
          status: bankeuTahap1?.sts || 'Data tidak tersedia',
          realisasi: bankeuTahap1 ? cleanCurrency(bankeuTahap1.Realisasi) : 0,
          realisasiFormatted: bankeuTahap1 ? bankeuTahap1.Realisasi : '0',
          hasData: !!bankeuTahap1
        },
        tahap2: {
          status: bankeuTahap2?.sts || 'Data tidak tersedia',
          realisasi: bankeuTahap2 ? cleanCurrency(bankeuTahap2.Realisasi) : 0,
          realisasiFormatted: bankeuTahap2 ? bankeuTahap2.Realisasi : '0',
          hasData: !!bankeuTahap2
        },
        total: (bankeuTahap1 ? cleanCurrency(bankeuTahap1.Realisasi) : 0) +
               (bankeuTahap2 ? cleanCurrency(bankeuTahap2.Realisasi) : 0),
        totalFormatted: formatCurrency(
          (bankeuTahap1 ? cleanCurrency(bankeuTahap1.Realisasi) : 0) +
          (bankeuTahap2 ? cleanCurrency(bankeuTahap2.Realisasi) : 0)
        )
      }
    };

    // 6. Calculate total financial
    const totalRealisasi = 
      financialData.add.realisasi +
      financialData.bhprd.total +
      financialData.dd.total +
      financialData.bankeu.total;

    // 7. Prepare response
    res.json({
      success: true,
      data: {
        desa: {
          id: desa.id.toString(),
          nama: desa.nama,
          status_pemerintahan: desa.status_pemerintahan,
          kecamatan: desa.kecamatans?.nama || null
        },
        kelembagaan: {
          rw: totalRW,
          rt: totalRT,
          posyandu: totalPosyandu,
          karang_taruna: karangTaruna ? 1 : 0,
          lpm: lpm ? 1 : 0,
          satlinmas: satlinmas ? 1 : 0,
          pkk: pkk ? 1 : 0,
          total_lembaga: totalRW + totalRT + totalPosyandu + 
                        (karangTaruna ? 1 : 0) + 
                        (lpm ? 1 : 0) + 
                        (satlinmas ? 1 : 0) + 
                        (pkk ? 1 : 0)
        },
        keuangan: {
          add: financialData.add,
          bhprd: financialData.bhprd,
          dd: financialData.dd,
          bankeu: financialData.bankeu,
          total_realisasi: totalRealisasi,
          total_realisasi_formatted: formatCurrency(totalRealisasi)
        }
      }
    });

  } catch (error) {
    console.error('Error in getDesaDashboardSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dashboard',
      error: error.message
    });
  }
}

module.exports = {
  getDesaDashboardSummary
};
