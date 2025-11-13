const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

// Create MySQL2 pool for raw queries
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
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
