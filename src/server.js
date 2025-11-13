const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');

// Import routes
const authRoutes = require('./routes/auth.routes');
const bumdesRoutes = require('./routes/bumdes.routes');
const musdesusRoutes = require('./routes/musdesus.routes');
const perjalananDinasRoutes = require('./routes/perjalananDinas.routes');
const heroGalleryRoutes = require('./routes/heroGallery.routes');
const publicRoutes = require('./routes/public.routes');
const locationRoutes = require('./routes/location.routes');
const kelembagaanRoutes = require('./routes/kelembagaan.routes');
const desaKelembagaanRoutes = require('./routes/desa.kelembagaan.routes');
const produkHukumRoutes = require('./routes/produkHukum.routes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

// Static files - MUST BE BEFORE API ROUTES
// Serve uploaded files with CORS headers
const path = require('path');
app.use('/storage', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../storage')));

app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../storage/uploads')));

logger.info(`📁 Static files served from: ${path.join(__dirname, '../storage')}`);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/public', publicRoutes); // Public endpoints (no auth)
app.use('/api/auth', authRoutes);
app.use('/api', locationRoutes); // Kecamatan & Desa routes
app.use('/api/desa/bumdes', bumdesRoutes);
app.use('/api/bumdes', bumdesRoutes); // Admin routes
app.use('/api/desa/musdesus', musdesusRoutes);
app.use('/api/musdesus', musdesusRoutes); // Admin routes
app.use('/api/desa', desaKelembagaanRoutes); // Desa kelembagaan routes (RW, RT, Posyandu, etc.)
app.use('/api/perjalanan-dinas', perjalananDinasRoutes);
app.use('/api/perjadin', perjalananDinasRoutes); // Alias for perjadin
app.use('/api/kegiatan', perjalananDinasRoutes); // Alias for perjadin
app.use('/api/hero-gallery', heroGalleryRoutes);
app.use('/api/kelembagaan', kelembagaanRoutes); // Kelembagaan routes (admin/global)
app.use('/api/admin', kelembagaanRoutes); // Admin alias for kelembagaan
app.use('/api/produk-hukum', produkHukumRoutes); // Produk Hukum routes

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 CORS enabled for: ${process.env.CORS_ORIGIN}`);
});

module.exports = app;
