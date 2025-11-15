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
        bidang_id: true
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

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: convertBigInt(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
          desa_id: convertBigInt(user.desa_id),
          kecamatan_id: convertBigInt(user.kecamatan_id),
          bidang_id: convertBigInt(user.bidang_id)
        }
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
 * Verify Token - Check if Express JWT token is valid
 */
const verifyToken = async (req, res) => {
  try {
    // req.user already populated by auth middleware
    return res.status(200).json({
      success: true,
      data: {
        user: req.user
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
