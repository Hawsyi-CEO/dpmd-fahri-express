# Setup & Deployment Guide - DPMD Express Backend

## 📋 Prerequisites

- **Node.js** v18.x or higher
- **MySQL** 8.0+
- **npm** or **yarn**
- Existing Laravel database (shared)

---

## 🚀 Installation

### 1. Clone/Navigate to Backend Folder

```bash
cd c:/laragon/www/dpmd/dpmd-express-backend
```

### 2. Install Dependencies

```bash
npm install
```

Expected packages:
- express@^4.18.2
- sequelize@^6.35.0
- mysql2@^3.6.5
- jsonwebtoken@^9.0.2
- multer@^1.4.5-lts.1
- winston@^3.11.0
- joi@^17.11.0
- helmet, cors, compression, morgan, dotenv

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
NODE_ENV=development
PORT=3001

# Database (same as Laravel)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dpmd_bogor
DB_USER=root
DB_PASSWORD=

# JWT (compatible with Laravel Sanctum)
JWT_SECRET=base64:your-laravel-app-key-here
JWT_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./storage/uploads

# CORS (allow frontend)
CORS_ORIGIN=http://localhost:5173

# App URL
APP_URL=http://localhost:3001
```

**IMPORTANT:** Use the same `JWT_SECRET` as Laravel's `APP_KEY` for token compatibility.

### 4. Create Storage Directories

```bash
mkdir storage
mkdir storage/uploads
mkdir storage/uploads/bumdes_laporan_keuangan
mkdir storage/uploads/bumdes_dokumen_badanhukum
mkdir storage/uploads/musdesus
mkdir storage/uploads/perjalanan_dinas
mkdir logs
```

Or use PowerShell:

```powershell
New-Item -ItemType Directory -Force -Path storage\uploads\bumdes_laporan_keuangan
New-Item -ItemType Directory -Force -Path storage\uploads\bumdes_dokumen_badanhukum
New-Item -ItemType Directory -Force -Path storage\uploads\musdesus
New-Item -ItemType Directory -Force -Path storage\uploads\perjalanan_dinas
New-Item -ItemType Directory -Force -Path logs
```

### 5. Database Connection Test

No migration needed! Express.js akan menggunakan database yang sama dengan Laravel.

Pastikan table berikut ada:
- `bumdes`
- `musdesus`
- `kegiatan` (untuk perjalanan dinas)
- `users`
- `desas`
- `kecamatans`

---

## 🏃 Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

Server akan berjalan di: **http://localhost:3001**

### Production Mode

```bash
npm start
```

---

## ✅ Testing Endpoints

### 1. Health Check

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "success": true,
  "message": "DPMD Express Backend is running",
  "timestamp": "2025-11-03T10:30:00.000Z"
}
```

### 2. Login (via Laravel)

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "desa@example.com",
    "password": "password123"
  }'
```

Copy the `token` from response.

### 3. Test BUMDES Endpoint

```bash
curl http://localhost:3001/api/desa/bumdes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Test Musdesus Endpoint

```bash
curl http://localhost:3001/api/musdesus/desa \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Test Perjalanan Dinas Dashboard

```bash
curl http://localhost:3001/api/perjadin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔧 Troubleshooting

### Port 3001 Already in Use

```bash
# Windows PowerShell
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or use different port in .env
PORT=3002
```

### Database Connection Failed

1. Check MySQL service is running
2. Verify credentials in `.env`
3. Test connection:

```bash
mysql -u root -p dpmd_bogor
```

### JWT Token Invalid

Pastikan `JWT_SECRET` di `.env` sama dengan Laravel's `APP_KEY`:

```bash
# Laravel
php artisan key:generate --show

# Copy output ke Express .env
JWT_SECRET=base64:abc123...
```

### File Upload Fails

1. Check directory permissions:

```powershell
icacls storage /grant Users:F /T
```

2. Check `.env` MAX_FILE_SIZE:

```env
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

---

## 🌐 Frontend Integration

### Update API Base URL

**Before (Laravel):**
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

**After (Express for specific modules):**
```javascript
const API_BASE_URL = {
  bumdes: 'http://localhost:3001/api/desa/bumdes',
  musdesus: 'http://localhost:3001/api/musdesus',
  perjadin: 'http://localhost:3001/api/perjadin',
  auth: 'http://localhost:8000/api' // Still Laravel
};
```

### Example: Fetch Bumdes with Express

```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3001/api/desa/bumdes', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data);
```

---

## 📊 Monitoring & Logs

### View Logs

**All logs:**
```bash
cat logs/combined.log
```

**Error logs only:**
```bash
cat logs/error.log
```

**Real-time monitoring:**
```bash
tail -f logs/combined.log
```

### Log Format

```
2025-11-03 10:30:45 info: Bumdes - Get Desa Bumdes {"user_id":1,"desa_id":45}
2025-11-03 10:30:46 info: Bumdes - File Uploaded {"bumdes_id":1,"filename":"1698765432_laporan.pdf"}
2025-11-03 10:30:50 error: Bumdes - Upload Error {"error":"File too large"}
```

---

## 🚢 Production Deployment

### 1. Environment Variables

```env
NODE_ENV=production
PORT=3001
DB_HOST=your-production-db-host
DB_NAME=dpmd_production
JWT_SECRET=your-production-secret
CORS_ORIGIN=https://yourdomain.com
APP_URL=https://api.yourdomain.com
```

### 2. Process Manager (PM2)

```bash
npm install -g pm2

# Start
pm2 start src/server.js --name dpmd-express

# Auto-restart on file changes
pm2 start src/server.js --name dpmd-express --watch

# View logs
pm2 logs dpmd-express

# Stop
pm2 stop dpmd-express

# Restart
pm2 restart dpmd-express

# Auto-start on boot
pm2 startup
pm2 save
```

### 3. Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 4. SSL Certificate (Let's Encrypt)

```bash
sudo certbot --nginx -d api.yourdomain.com
```

---

## 🔐 Security Checklist

- [x] Helmet middleware enabled
- [x] CORS configured
- [x] Rate limiting implemented
- [x] JWT authentication
- [x] File type validation
- [x] File size limits
- [ ] Environment variables secure (no commit to git)
- [ ] Database credentials encrypted
- [ ] HTTPS enabled in production
- [ ] Regular dependency updates

---

## 📈 Performance Optimization

### 1. Enable Compression

Already enabled via `compression` middleware in `server.js`.

### 2. Database Connection Pooling

Already configured in `config/database.js`:

```javascript
pool: {
  max: 5,
  min: 0,
  acquire: 30000,
  idle: 10000
}
```

### 3. Caching (Optional - Redis)

```bash
npm install redis

# Add to .env
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 🧪 Testing

### Manual Testing

Use tools:
- **Postman** - Import collection
- **Thunder Client** - VS Code extension
- **curl** - Command line

### Automated Testing (TODO)

```bash
npm install --save-dev jest supertest

# package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

---

## 📝 API Documentation

### Bumdes Module

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/desa/bumdes` | ✓ | desa | Get BUMDES for logged in desa |
| POST | `/api/desa/bumdes` | ✓ | desa | Create/Update BUMDES (data only) |
| POST | `/api/desa/bumdes/upload-file` | ✓ | desa | Upload single file |
| PUT | `/api/desa/bumdes/:id` | ✓ | desa | Update BUMDES |
| DELETE | `/api/desa/bumdes/:id` | ✓ | desa | Delete BUMDES |
| GET | `/api/bumdes/all` | ✓ | admin | Get all BUMDES |
| GET | `/api/bumdes/statistics` | ✓ | admin | Get statistics |

### Musdesus Module

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/musdesus/desa` | ✓ | desa | Get files for logged in desa |
| POST | `/api/musdesus/desa` | ✓ | desa | Upload musdesus file |
| DELETE | `/api/musdesus/desa/:id` | ✓ | desa | Delete file (own only) |
| GET | `/api/musdesus/all` | ✓ | admin | Get all files |
| GET | `/api/musdesus/statistics` | ✓ | admin | Get statistics |
| PUT | `/api/musdesus/:id/status` | ✓ | admin | Update approval status |

### Perjalanan Dinas Module

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/perjadin/dashboard` | ✓ | admin | Get dashboard statistics |
| GET | `/api/perjadin/dashboard/weekly-schedule` | ✓ | admin | Get weekly schedule |
| GET | `/api/perjadin/kegiatan` | ✓ | admin | Get all kegiatan |
| GET | `/api/perjadin/kegiatan/:id` | ✓ | admin | Get kegiatan detail |
| POST | `/api/perjadin/kegiatan` | ✓ | admin | Create kegiatan |
| PUT | `/api/perjadin/kegiatan/:id` | ✓ | admin | Update kegiatan |
| DELETE | `/api/perjadin/kegiatan/:id` | ✓ | admin | Delete kegiatan |

---

## 🎯 Migration Checklist

### Backend

- [x] Install dependencies
- [x] Configure environment
- [x] Create storage directories
- [x] Test database connection
- [x] Test all endpoints
- [ ] Deploy to production server
- [ ] Configure PM2
- [ ] Setup Nginx reverse proxy
- [ ] Enable SSL certificate

### Frontend

- [ ] Update API URLs for Bumdes
- [ ] Update API URLs for Musdesus
- [ ] Update API URLs for Perjalanan Dinas
- [ ] Test file uploads
- [ ] Test authentication flow
- [ ] Deploy frontend changes

### Database

- [x] No changes needed (shared with Laravel)

---

## 📞 Support

**Developer:** GitHub Copilot Assistant  
**Date:** November 3, 2025  
**Version:** 1.0.0

---

**END OF SETUP GUIDE**
