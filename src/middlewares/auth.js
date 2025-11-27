const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Express JWT Auth Middleware (Independent from Laravel)
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      logger.warn('No token provided');
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    // Verify Express JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach user to request
    // Coerce desa_id to integer to satisfy Prisma Int fields
    const desaId = decoded.desa_id !== undefined && decoded.desa_id !== null
      ? parseInt(decoded.desa_id, 10)
      : null;

    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      desa_id: Number.isNaN(desaId) ? null : desaId
    };
    
    logger.info(`✅ Auth successful: User ${req.user.id} (${req.user.role})`);
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid token format');
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      logger.warn('Token expired');
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    logger.error('Authentication failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Role-based middleware
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('❌ Role check failed: No user in request');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - No user found'
      });
    }

    if (!req.user.role) {
      logger.warn(`❌ Role check failed: User ${req.user.id} has no role defined`);
      return res.status(403).json({
        success: false,
        message: 'Access forbidden - No role assigned'
      });
    }

    // Normalize user role (trim whitespace, lowercase)
    const userRole = String(req.user.role).trim().toLowerCase();
    const allowedRoles = roles.map(r => String(r).trim().toLowerCase());

    logger.info(`🔐 Role check - User: ${req.user.email} | User role: "${userRole}" | Allowed roles: [${allowedRoles.join(', ')}]`);

    if (!allowedRoles.includes(userRole)) {
      logger.warn(`❌ Access forbidden - User ${req.user.email} with role "${userRole}" not in [${allowedRoles.join(', ')}]`);
      return res.status(403).json({
        success: false,
        message: `Access forbidden - Role "${req.user.role}" not authorized`,
        debug: {
          userRole: req.user.role,
          allowedRoles: roles
        }
      });
    }

    logger.info(`✅ Role check passed - User ${req.user.email} (${userRole}) authorized`);
    next();
  };
};

// Generate JWT token
const generateToken = (user) => {
  // Convert all BigInt fields to strings for JWT serialization
  const convertBigInt = (value) => {
    if (value === null || value === undefined) return value;
    return typeof value === 'bigint' ? value.toString() : value;
  };

  return jwt.sign(
    {
      id: convertBigInt(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      desa_id: convertBigInt(user.desa_id),
      kecamatan_id: convertBigInt(user.kecamatan_id),
      bidang_id: convertBigInt(user.bidang_id)
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// VPN IP-based authentication (no token required)
// HYBRID: Accept both Tailscale IP and secret key
const vpnAuth = async (req, res, next) => {
  try {
    // Get client IP address
    const forwardedFor = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    const remoteAddr = req.connection.remoteAddress || req.socket.remoteAddress;
    
    // Get VPN secret from query or header
    const vpnSecret = req.query.secret || req.headers['x-vpn-secret'];
    const expectedSecret = process.env.VPN_SECRET_KEY || 'DPMD-INTERNAL-2025';
    
    // Parse forwarded IPs
    let clientIP = remoteAddr;
    if (forwardedFor) {
      const ips = forwardedFor.split(',').map(ip => ip.trim());
      clientIP = ips[0];
    } else if (realIP) {
      clientIP = realIP;
    }

    logger.info(`🔐 VPN Auth - IP: ${clientIP}, HasSecret: ${!!vpnSecret}`);

    // Function to check if IP is in Tailscale range (100.64.0.0/10)
    const isIPInTailscaleRange = (ip) => {
      // Allow localhost for development
      if (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') {
        logger.info('✅ VPN Auth: Localhost detected (development mode)');
        return true;
      }

      // Remove IPv6 prefix if present
      const cleanIP = ip.replace('::ffff:', '');
      
      // Check Tailscale range: 100.64.0.0 to 100.127.255.255
      const parts = cleanIP.split('.');
      if (parts.length !== 4) return false;
      
      const firstOctet = parseInt(parts[0]);
      const secondOctet = parseInt(parts[1]);
      
      // Tailscale uses 100.64.0.0/10 (100.64.0.0 - 100.127.255.255)
      return firstOctet === 100 && secondOctet >= 64 && secondOctet <= 127;
    };

    const isVpnIP = isIPInTailscaleRange(clientIP);
    const hasValidSecret = vpnSecret && vpnSecret === expectedSecret;

    // ✅ GRANT ACCESS: Tailscale IP OR valid secret key
    if (isVpnIP || hasValidSecret) {
      const accessMethod = isVpnIP ? 'tailscale-ip' : 'secret-key';
      logger.info(`✅ VPN Auth success via ${accessMethod}: IP=${clientIP}`);
      
      // Set dummy VPN user
      req.user = {
        id: 'vpn-user',
        name: 'VPN User',
        email: 'vpn@internal',
        role: 'vpn_access',
        accessMethod
      };
      
      return next();
    }

    // ❌ DENY ACCESS
    logger.warn(`❌ VPN Auth failed: IP ${clientIP} not in VPN range and no valid secret`);
    return res.status(403).json({
      success: false,
      message: 'Access denied - VPN connection or valid secret key required',
      data: {
        ip: clientIP,
        hasSecret: !!vpnSecret,
        reason: 'Not connected via Tailscale VPN and no valid secret provided'
      }
    });
  } catch (error) {
    logger.error('VPN Authentication failed:', error);
    return res.status(500).json({
      success: false,
      message: 'VPN authentication failed'
    });
  }
};

module.exports = { auth, checkRole, generateToken, vpnAuth };
