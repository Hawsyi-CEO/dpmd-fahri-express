# Quick Reference - DPMD Express Backend

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Copy environment
cp .env.example .env

# Create directories
mkdir -p storage/uploads/{bumdes_laporan_keuangan,bumdes_dokumen_badanhukum,musdesus,perjalanan_dinas} logs

# Run development server
npm run dev

# Run production server
npm start
```

---

## 🔗 API Endpoints Cheat Sheet

### BUMDES
```
GET    /api/desa/bumdes              # Get BUMDES (desa)
POST   /api/desa/bumdes              # Create/Update (desa)
POST   /api/desa/bumdes/upload-file  # Upload file (desa)
PUT    /api/desa/bumdes/:id          # Update (desa)
DELETE /api/desa/bumdes/:id          # Delete (desa)
GET    /api/bumdes/all               # Get all (admin)
GET    /api/bumdes/statistics        # Statistics (admin)
```

### MUSDESUS
```
GET    /api/musdesus/desa            # Get files (desa)
POST   /api/musdesus/desa            # Upload file (desa)
DELETE /api/musdesus/desa/:id        # Delete (desa)
GET    /api/musdesus/all             # Get all (admin)
GET    /api/musdesus/statistics      # Statistics (admin)
PUT    /api/musdesus/:id/status      # Update status (admin)
```

### PERJALANAN DINAS
```
GET    /api/perjadin/dashboard               # Dashboard stats
GET    /api/perjadin/dashboard/weekly-schedule  # Weekly schedule
GET    /api/perjadin/kegiatan                # Get all
GET    /api/perjadin/kegiatan/:id            # Get detail
POST   /api/perjadin/kegiatan                # Create
PUT    /api/perjadin/kegiatan/:id            # Update
DELETE /api/perjadin/kegiatan/:id            # Delete
```

---

## 🔑 Authentication

```bash
# Get token from Laravel
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Use token in Express
curl http://localhost:3001/api/desa/bumdes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📁 File Upload Example

### 2-Step Upload (BUMDES)

**Step 1: Save Data**
```javascript
const response = await fetch('http://localhost:3001/api/desa/bumdes', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    namabumdesa: "BUMDes Test",
    TahunPendirian: 2020
  })
});
const { data } = await response.json();
const bumdesId = data.id;
```

**Step 2: Upload Files**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('bumdes_id', bumdesId);
formData.append('field_name', 'LaporanKeuangan2021');

await fetch('http://localhost:3001/api/desa/bumdes/upload-file', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Single Upload (MUSDESUS)

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('nama_pengupload', 'Budi Santoso');
formData.append('keterangan', 'Musdesus APBDes 2024');

await fetch('http://localhost:3001/api/musdesus/desa', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

---

## 🛠️ Development Tools

### View Logs
```bash
# All logs
tail -f logs/combined.log

# Errors only
tail -f logs/error.log

# Last 50 lines
tail -n 50 logs/combined.log
```

### Check Database
```bash
mysql -u root -p dpmd_bogor

# List tables
SHOW TABLES;

# Check bumdes
SELECT * FROM bumdes LIMIT 5;

# Check musdesus
SELECT * FROM musdesus LIMIT 5;

# Check kegiatan
SELECT * FROM kegiatan LIMIT 5;
```

### Test Endpoints
```bash
# Health check
curl http://localhost:3001/health

# Test with token
TOKEN="your-jwt-token"
curl http://localhost:3001/api/desa/bumdes \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Debugging

### Enable Debug Logs
```env
NODE_ENV=development
```

### Check Port in Use
```powershell
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Restart Server
```bash
# Ctrl+C to stop
# Then
npm run dev
```

---

## 📊 Roles & Permissions

| Role | BUMDES | MUSDESUS | PERJALANAN DINAS |
|------|--------|----------|------------------|
| desa | CRUD (own) | Upload/Delete (own) | - |
| admin | View all | View all, Approve | Full access |
| sarpras | View all | View all, Approve | Full access |
| superadmin | Full access | Full access | Full access |

---

## 🔒 Environment Variables

```env
# Required
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_NAME=dpmd_bogor
DB_USER=root
DB_PASSWORD=
JWT_SECRET=your-secret-key

# Optional
MAX_FILE_SIZE=5242880
CORS_ORIGIN=http://localhost:5173
APP_URL=http://localhost:3001
```

---

## 📦 npm Scripts

```bash
npm start        # Production mode
npm run dev      # Development with nodemon
npm test         # Run tests (not implemented)
```

---

## 🗂️ File Structure Quick View

```
src/
├── server.js           # Main app
├── config/
│   └── database.js     # DB config
├── controllers/        # Business logic
├── middlewares/        # Auth, Upload, Error
├── models/            # Sequelize models
├── routes/            # API endpoints
└── utils/
    └── logger.js       # Winston logger
```

---

## 🚨 Common Errors & Solutions

### Error: Port 3001 already in use
```bash
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Error: Cannot connect to database
```
1. Check MySQL is running
2. Verify .env credentials
3. Check database exists
```

### Error: Token invalid
```
1. Check JWT_SECRET matches Laravel
2. Token might be expired
3. Get new token from /api/login
```

### Error: File upload failed
```
1. Check MAX_FILE_SIZE in .env
2. Verify file type is allowed
3. Check storage directory exists
```

---

## 📈 Performance Tips

1. **Enable compression** (already enabled)
2. **Use connection pooling** (already configured)
3. **Add Redis caching** (future enhancement)
4. **Monitor with PM2** (production)

---

## 🔗 Quick Links

- **Health Check:** http://localhost:3001/health
- **Laravel API:** http://localhost:8000/api
- **Frontend:** http://localhost:5173

---

## 📞 Support Resources

- [README.md](./README.md) - Overview
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed setup
- [API_REFERENCE.md](./API_REFERENCE.md) - Complete API docs
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - File structure

---

**Last Updated:** November 3, 2025  
**Version:** 1.0.0
