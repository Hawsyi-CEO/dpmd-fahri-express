# 🚀 Deployment Kelembagaan Activity Logs ke VPS

**Tanggal:** 12 Desember 2024  
**Fitur:** Activity Logging untuk Kelembagaan (RW, RT, Posyandu, Karang Taruna, LPM, Satlinmas, PKK)  
**Target:** VPS Production

---

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [File yang Perlu Diupload](#file-yang-perlu-diupload)
4. [Step-by-Step Deployment](#step-by-step-deployment)
5. [Database Migration](#database-migration)
6. [Testing](#testing)
7. [Rollback Plan](#rollback-plan)

---

## 🎯 Overview

Fitur Activity Logs mencatat semua aktivitas kelembagaan:
- **CREATE**: Pembuatan kelembagaan baru
- **UPDATE**: Perubahan data kelembagaan
- **TOGGLE_STATUS**: Perubahan status aktif/nonaktif

### Kelembagaan yang Tercakup:
1. RW (Rukun Warga)
2. RT (Rukun Tetangga)
3. Posyandu
4. Karang Taruna
5. LPM (Lembaga Pemberdayaan Masyarakat)
6. Satlinmas (Satuan Perlindungan Masyarakat)
7. PKK (Pemberdayaan Kesejahteraan Keluarga)

---

## ✅ Prerequisites

Sebelum deploy, pastikan:
- [x] Akses SSH ke VPS
- [x] Akses ke database MySQL/MariaDB di VPS
- [x] Node.js dan npm sudah terinstall di VPS
- [x] PM2 untuk process management
- [x] Backup database production

---

## 📦 File yang Perlu Diupload

### 1. **File Baru (NEW)**

```
src/utils/kelembagaanActivityLogger.js          # Utility untuk logging
src/controllers/kelembagaanActivityLogs.controller.js  # Controller API
src/routes/kelembagaanActivityLogs.routes.js    # Routes definition
database-express/migrations/20241212_create_kelembagaan_activity_logs.sql  # Migration SQL
```

### 2. **File yang Dimodifikasi (MODIFIED)**

```
src/controllers/kelembagaan.controller.js       # Tambah logging di semua CRUD
src/server.js                                   # Register routes baru
prisma/schema.prisma                            # Tambah model activity logs
```

### 3. **File Frontend (MODIFIED)**

```
dpmd-frontend/src/services/activityLogs.js      # Service API
dpmd-frontend/src/pages/desa/kelembagaan/KelembagaanDetailPage.jsx
dpmd-frontend/src/pages/desa/kelembagaan/KelembagaanList.jsx
```

---

## 🔧 Step-by-Step Deployment

### **STEP 1: Backup Database**

```bash
# SSH ke VPS
ssh user@your-vps-ip

# Backup database production
mysqldump -u root -p dpmd > ~/backup_dpmd_$(date +%Y%m%d_%H%M%S).sql

# Verifikasi backup
ls -lh ~/backup_dpmd_*.sql
```

---

### **STEP 2: Stop Backend Server**

```bash
# Stop PM2 process
pm2 stop dpmd-backend

# atau jika menggunakan systemd
sudo systemctl stop dpmd-backend
```

---

### **STEP 3: Upload File ke VPS**

**Dari komputer lokal**, upload file yang dibutuhkan:

```bash
# Pindah ke folder project lokal
cd /home/erlangga/Projects/dpmd/dpmd-fahri-express

# Upload file baru
scp src/utils/kelembagaanActivityLogger.js user@vps:/path/to/dpmd-backend/src/utils/
scp src/controllers/kelembagaanActivityLogs.controller.js user@vps:/path/to/dpmd-backend/src/controllers/
scp src/routes/kelembagaanActivityLogs.routes.js user@vps:/path/to/dpmd-backend/src/routes/
scp database-express/migrations/20241212_create_kelembagaan_activity_logs.sql user@vps:/path/to/dpmd-backend/database-express/migrations/

# Upload file yang dimodifikasi
scp src/controllers/kelembagaan.controller.js user@vps:/path/to/dpmd-backend/src/controllers/
scp src/server.js user@vps:/path/to/dpmd-backend/src/
scp prisma/schema.prisma user@vps:/path/to/dpmd-backend/prisma/
```

**Atau gunakan rsync (lebih efisien):**

```bash
# Sync semua perubahan sekaligus
rsync -avz --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'storage' \
  --exclude 'logs' \
  /home/erlangga/Projects/dpmd/dpmd-fahri-express/ \
  user@vps:/path/to/dpmd-backend/
```

---

### **STEP 4: Database Migration**

**Di VPS:**

```bash
# Masuk ke folder backend
cd /path/to/dpmd-backend

# Jalankan migration SQL
mysql -u root -p dpmd < database-express/migrations/20241212_create_kelembagaan_activity_logs.sql

# Verifikasi tabel sudah dibuat
mysql -u root -p dpmd -e "SHOW TABLES LIKE 'kelembagaan_activity_logs';"

# Cek struktur tabel
mysql -u root -p dpmd -e "DESCRIBE kelembagaan_activity_logs;"
```

**Output yang diharapkan:**
```
+----------------------+---------------------+------+-----+-------------------+
| Field                | Type                | Null | Key | Default           |
+----------------------+---------------------+------+-----+-------------------+
| id                   | char(36)            | NO   | PRI | NULL              |
| kelembagaan_type     | varchar(50)         | NO   | MUL | NULL              |
| kelembagaan_id       | char(36)            | NO   | MUL | NULL              |
| kelembagaan_nama     | varchar(255)        | YES  |     | NULL              |
| desa_id              | bigint unsigned     | NO   | MUL | NULL              |
| activity_type        | varchar(50)         | NO   |     | NULL              |
| entity_type          | varchar(50)         | NO   |     | NULL              |
| entity_id            | char(36)            | YES  |     | NULL              |
| entity_name          | varchar(255)        | YES  |     | NULL              |
| action_description   | text                | YES  |     | NULL              |
| old_value            | json                | YES  |     | NULL              |
| new_value            | json                | YES  |     | NULL              |
| user_id              | bigint unsigned     | NO   | MUL | NULL              |
| user_name            | varchar(255)        | YES  |     | NULL              |
| user_role            | varchar(50)         | YES  |     | NULL              |
| created_at           | timestamp           | YES  | MUL | CURRENT_TIMESTAMP |
+----------------------+---------------------+------+-----+-------------------+
```

---

### **STEP 5: Generate Prisma Client**

```bash
# Di folder backend VPS
cd /path/to/dpmd-backend

# Generate Prisma client dengan model baru
npx prisma generate

# Verifikasi tidak ada error
echo $?  # Harus return 0
```

---

### **STEP 6: Install Dependencies (jika ada yang baru)**

```bash
# Cek package.json untuk dependencies baru
npm install

# Atau specific packages
npm install uuid  # Jika belum ada
```

---

### **STEP 7: Test Configuration**

Buat script test untuk verifikasi:

```bash
# Buat file test-activity-logs.js
cat > test-activity-logs.js << 'EOF'
require('dotenv').config();
const prisma = require('./src/config/prisma');

async function test() {
  console.log('Testing activity logs setup...\n');
  
  try {
    // Test 1: Check table exists
    const count = await prisma.kelembagaan_activity_logs.count();
    console.log('✅ Table exists, current records:', count);
    
    // Test 2: Check imports
    const { logKelembagaanActivity } = require('./src/utils/kelembagaanActivityLogger');
    console.log('✅ Activity logger utility loaded');
    
    // Test 3: Check controller
    const activityController = require('./src/controllers/kelembagaanActivityLogs.controller');
    console.log('✅ Activity logs controller loaded');
    
    console.log('\n🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

test();
EOF

# Jalankan test
node test-activity-logs.js
```

---

### **STEP 8: Start Backend Server**

```bash
# Start dengan PM2
pm2 start dpmd-backend

# atau dengan npm
npm run dev

# Atau dengan systemd
sudo systemctl start dpmd-backend
```

---

### **STEP 9: Check Logs**

```bash
# Lihat logs PM2
pm2 logs dpmd-backend --lines 50

# atau logs file
tail -f logs/app.log

# Pastikan tidak ada error dan server running
curl http://localhost:3001/health  # atau port yang digunakan
```

**Output yang diharapkan:**
```
2024-12-12 10:00:00 info: 🚀 Server running on port 3001
2024-12-12 10:00:00 info: ✅ Database connection established successfully
2024-12-12 10:00:00 info: ✅ Prisma Client connected to database
```

---

### **STEP 10: Test API Endpoints**

```bash
# Test endpoint activity logs
curl -X GET "http://localhost:3001/api/kelembagaan/activity-logs/list?type=rw&desa_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response yang diharapkan:
# {
#   "success": true,
#   "message": "Berhasil mengambil activity logs untuk list page",
#   "data": {
#     "filters": {...},
#     "total": 0,
#     "logs": []
#   }
# }
```

---

### **STEP 11: Deploy Frontend**

```bash
# Dari komputer lokal, upload frontend changes
cd /home/erlangga/Projects/dpmd/dpmd-frontend

# Build production
npm run build

# Upload ke VPS
scp -r dist/* user@vps:/path/to/frontend/

# Atau gunakan rsync
rsync -avz dist/ user@vps:/var/www/dpmd-frontend/
```

---

### **STEP 12: Test End-to-End**

1. **Buka browser** ke aplikasi production
2. **Login** sebagai user desa
3. **Buat RW baru** atau update existing
4. **Buka halaman detail kelembagaan**
5. **Cek tab "Riwayat Aktivitas"**
6. **Verifikasi log muncul** dengan deskripsi yang benar

---

## 🧪 Testing Checklist

### Backend Testing:

- [ ] Tabel `kelembagaan_activity_logs` ada di database
- [ ] Server start tanpa error
- [ ] Endpoint `/api/kelembagaan/activity-logs/list` bisa diakses
- [ ] Endpoint `/api/kelembagaan/activity-logs/detail/:type/:id` bisa diakses
- [ ] Create RW/RT/Posyandu → log tercatat
- [ ] Update kelembagaan → log tercatat
- [ ] Toggle status → log tercatat

### Frontend Testing:

- [ ] Tab "Log Aktivitas" muncul di KelembagaanList
- [ ] Tab "Riwayat Aktivitas" muncul di KelembagaanDetailPage
- [ ] Loading state berfungsi
- [ ] Empty state muncul jika belum ada log
- [ ] Log ditampilkan dengan format yang benar
- [ ] Icon dan badge sesuai jenis aktivitas
- [ ] Timestamp dalam format Indonesian

---

## 🔄 Rollback Plan

Jika terjadi masalah:

### **Rollback Backend:**

```bash
# Stop server
pm2 stop dpmd-backend

# Restore database
mysql -u root -p dpmd < ~/backup_dpmd_TIMESTAMP.sql

# Drop table activity logs (optional)
mysql -u root -p dpmd -e "DROP TABLE IF EXISTS kelembagaan_activity_logs;"

# Restore old code
cd /path/to/dpmd-backend
git checkout previous-commit-hash

# atau restore dari backup
cp -r ~/backup_dpmd_backend_TIMESTAMP/* .

# Restart server
pm2 start dpmd-backend
```

### **Rollback Frontend:**

```bash
# Restore old frontend files
cd /var/www/dpmd-frontend
cp -r ~/backup_frontend_TIMESTAMP/* .

# Clear browser cache
# Refresh browser (Ctrl + Shift + R)
```

---

## 📊 Monitoring

Setelah deployment, monitor:

### **Database:**

```bash
# Cek jumlah log
mysql -u root -p dpmd -e "SELECT COUNT(*) FROM kelembagaan_activity_logs;"

# Cek log terbaru
mysql -u root -p dpmd -e "SELECT * FROM kelembagaan_activity_logs ORDER BY created_at DESC LIMIT 10;"

# Cek ukuran tabel
mysql -u root -p dpmd -e "
  SELECT 
    table_name, 
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)' 
  FROM information_schema.TABLES 
  WHERE table_schema = 'dpmd' 
    AND table_name = 'kelembagaan_activity_logs';
"
```

### **Server Logs:**

```bash
# PM2 logs
pm2 logs dpmd-backend --lines 100

# Application logs
tail -f /path/to/dpmd-backend/logs/app.log

# Error logs
tail -f /path/to/dpmd-backend/logs/error.log
```

### **Performance:**

```bash
# Check server response time
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3001/api/kelembagaan/activity-logs/list?type=rw&desa_id=1"

# Memory usage
pm2 monit
```

---

## 🎯 Post-Deployment Tasks

1. **Dokumentasi:**
   - Update API documentation
   - Update user manual
   - Create changelog

2. **Training:**
   - Inform users tentang fitur baru
   - Demo cara menggunakan activity logs

3. **Monitoring:**
   - Setup alerts untuk errors
   - Monitor database growth
   - Track usage statistics

---

## 📞 Support & Troubleshooting

### Common Issues:

**Issue 1: Server gagal start setelah deployment**
```bash
# Check logs
pm2 logs dpmd-backend --err

# Common cause: Import error
# Solution: Verify all files uploaded correctly
```

**Issue 2: Tabel tidak ditemukan**
```bash
# Verify table exists
mysql -u root -p dpmd -e "SHOW TABLES;"

# Re-run migration
mysql -u root -p dpmd < database-express/migrations/20241212_create_kelembagaan_activity_logs.sql
```

**Issue 3: Frontend tidak menampilkan logs**
```bash
# Check browser console for errors
# Verify API endpoint accessible
# Check authentication token valid
```

---

## ✅ Deployment Completed

Setelah semua step selesai:

```
✅ Database migration berhasil
✅ Backend server running
✅ API endpoints tested
✅ Frontend deployed
✅ End-to-end testing passed
✅ Monitoring setup
✅ Documentation updated
```

**Status: PRODUCTION READY** 🚀

---

**Deployment By:** [Your Name]  
**Deployment Date:** 12 Desember 2024  
**Version:** 1.0.0  
**Next Review:** [Date]
