const bcrypt = require('bcryptjs');
const { generateToken } = require('../middlewares/auth');
const sequelize = require('../config/database');
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

    // Query user from database
    const [users] = await sequelize.query(`
      SELECT id, name, email, password, role, desa_id 
      FROM users 
      WHERE email = ?
      LIMIT 1
    `, {
      replacements: [email]
    });

    if (!users || users.length === 0) {
      logger.warn(`Login failed: User not found - ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

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

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          desa_id: user.desa_id
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
