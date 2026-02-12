const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Connection pool size based on environment
const poolMax = process.env.NODE_ENV === 'production' ? 30 : 10;

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: poolMax,
      min: 2,
      acquire: 60000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

// Test connection
sequelize.authenticate()
  .then(() => {
    logger.info('✅ Database connection established successfully');
  })
  .catch(err => {
    logger.error('❌ Unable to connect to the database:', err);
  });

module.exports = sequelize;
