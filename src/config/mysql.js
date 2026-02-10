const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

// Connection pool size based on environment
const connectionLimit = process.env.NODE_ENV === 'production' ? 30 : 10;

// Create MySQL2 pool for raw queries
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: connectionLimit,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection
pool.getConnection()
  .then(connection => {
    logger.info('✅ MySQL2 pool connection established');
    connection.release();
  })
  .catch(err => {
    logger.error('❌ MySQL2 pool connection failed:', err);
  });

module.exports = pool;
