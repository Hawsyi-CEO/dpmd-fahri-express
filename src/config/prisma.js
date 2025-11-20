/**
 * Prisma Client Instance
 * Single instance untuk digunakan di seluruh aplikasi
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

// Buat Prisma Client instance
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['info', 'warn', 'error']  // Removed 'query' to reduce log noise
    : ['warn', 'error'],
});

// Test connection
prisma.$connect()
  .then(() => {
    logger.info('✅ Prisma Client connected to database');
  })
  .catch((err) => {
    logger.error('❌ Prisma Client connection failed:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Prisma Client disconnected');
});

module.exports = prisma;
