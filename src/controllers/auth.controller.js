const bcrypt = require('bcryptjs');
const { generateToken } = require('../middlewares/auth');
const prisma = require('../config/prisma');
const logger = require('../utils/logger');

/**
 * Login - Validate credentials and return Express JWT token
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Query user from database using Prisma
    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        desa_id: true,
        kecamatan_id: true,
        bidang_id: true,
        dinas_id: true
      }
    });

    if (!user) {
      logger.warn(`Login failed: User not found - ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logger.warn(`Login failed: Invalid password - ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate Express JWT token
    const token = generateToken(user);

    logger.info(`✅ Login successful: ${user.email} (${user.role})`);

    // Helper to convert BigInt to string
    const convertBigInt = (value) => {
      if (value === null || value === undefined) return value;
      return typeof value === 'bigint' ? value.toString() : value;
    };

    // Build complete user response with nested desa and kecamatan (same as verifyToken)
    const responseData = {
      id: convertBigInt(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      desa_id: convertBigInt(user.desa_id),
      kecamatan_id: convertBigInt(user.kecamatan_id),
      bidang_id: convertBigInt(user.bidang_id),
      dinas_id: convertBigInt(user.dinas_id)
    };

    // If user has desa_id, fetch related desa and kecamatan
    if (user.desa_id) {
      try {
        const desa = await prisma.desas.findUnique({
          where: { id_desa: user.desa_id },
          select: {
            id_desa: true,
            nama_desa: true,
            kode_desa: true,
            id_kecamatan: true
          }
        });

        if (desa) {
          responseData.desa = {
            id: convertBigInt(desa.id_desa),
            nama: desa.nama_desa,
            kode: desa.kode_desa,
            kecamatan_id: convertBigInt(desa.id_kecamatan)
          };

          // Fetch related kecamatan
          const kecamatan = await prisma.kecamatans.findUnique({
            where: { id_kecamatan: desa.id_kecamatan },
            select: {
              id_kecamatan: true,
              nama_kecamatan: true
            }
          });

          if (kecamatan) {
            responseData.desa.kecamatan = {
              id: convertBigInt(kecamatan.id_kecamatan),
              nama: kecamatan.nama_kecamatan
            };
          }
        }
      } catch (error) {
        logger.warn(`Failed to fetch desa/kecamatan for user ${user.email}:`, error);
        // Continue without desa data if fetch fails
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: responseData
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Verify Token - Check if Express JWT token is valid and return complete user data
 */
const verifyToken = async (req, res) => {
  try {
    // req.user already populated by auth middleware
    const userId = req.user.id;
    
    // Fetch complete user data with desa and kecamatan relations
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        desa_id: true,
        kecamatan_id: true,
        bidang_id: true,
        dinas_id: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Helper to convert BigInt to string
    const convertBigInt = (value) => {
      if (value === null || value === undefined) return value;
      return typeof value === 'bigint' ? value.toString() : value;
    };

    // Prepare response data
    const responseData = {
      id: convertBigInt(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      desa_id: convertBigInt(user.desa_id),
      kecamatan_id: convertBigInt(user.kecamatan_id),
      bidang_id: convertBigInt(user.bidang_id),
      dinas_id: convertBigInt(user.dinas_id)
    };

    // If user has desa_id, fetch desa data with kecamatan
    if (user.desa_id) {
      const desa = await prisma.desas.findUnique({
        where: { id_desa: user.desa_id },
        select: {
          id_desa: true,
          nama_desa: true,
          kode_desa: true,
          id_kecamatan: true
        }
      });

      if (desa) {
        responseData.desa = {
          id: convertBigInt(desa.id_desa),
          nama: desa.nama_desa,
          kode: desa.kode_desa,
          kecamatan_id: convertBigInt(desa.id_kecamatan)
        };

        // Fetch kecamatan data
        const kecamatan = await prisma.kecamatans.findUnique({
          where: { id_kecamatan: desa.id_kecamatan },
          select: {
            id_kecamatan: true,
            nama_kecamatan: true
          }
        });

        if (kecamatan) {
          responseData.desa.kecamatan = {
            id: convertBigInt(kecamatan.id_kecamatan),
            nama: kecamatan.nama_kecamatan
          };
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        user: responseData
      }
    });
  } catch (error) {
    logger.error('Verify token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  login,
  verifyToken
};
