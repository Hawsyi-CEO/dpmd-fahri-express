# ⚡ Quick Migration Guide - Activity Logs

**Target:** Production VPS  
**Estimasi Waktu:** 15-20 menit

---

## 🎯 Pre-flight Checklist

```bash
☐ Backup database production
☐ Akses SSH ke VPS
☐ Server dalam maintenance mode (optional)
☐ Notifikasi ke users
```

---

## 🚀 Quick Steps

### 1️⃣ Backup (2 menit)

```bash
ssh user@vps
mysqldump -u root -p dpmd > ~/backup_dpmd_$(date +%Y%m%d_%H%M%S).sql
```

### 2️⃣ Upload Files (3 menit)

```bash
# From local
cd /home/erlangga/Projects/dpmd/dpmd-fahri-express

# Sync backend
rsync -avz --exclude 'node_modules' --exclude '.git' \
  src/ user@vps:/path/to/backend/src/

rsync -avz database-express/migrations/ \
  user@vps:/path/to/backend/database-express/migrations/

rsync -avz prisma/schema.prisma \
  user@vps:/path/to/backend/prisma/
```

### 3️⃣ Run Migration (2 menit)

```bash
# On VPS
cd /path/to/backend

# Stop server
pm2 stop dpmd-backend

# Run SQL migration
mysql -u root -p dpmd < database-express/migrations/20241212_create_kelembagaan_activity_logs.sql

# Generate Prisma client
npx prisma generate
```

### 4️⃣ Start Server (1 menit)

```bash
# Start server
pm2 start dpmd-backend

# Check logs
pm2 logs dpmd-backend --lines 20
```

### 5️⃣ Quick Test (2 menit)

```bash
# Test endpoint
curl http://localhost:3001/api/kelembagaan/activity-logs/list?type=rw&desa_id=1 \
  -H "Authorization: Bearer TOKEN"

# Should return: {"success": true, ...}
```

### 6️⃣ Deploy Frontend (5 menit)

```bash
# From local
cd /home/erlangga/Projects/dpmd/dpmd-frontend

# Build
npm run build

# Upload
rsync -avz dist/ user@vps:/var/www/dpmd-frontend/
```

---

## ✅ Verification

```bash
# Check table
mysql -u root -p dpmd -e "SELECT COUNT(*) FROM kelembagaan_activity_logs;"

# Check server
pm2 status

# Check logs
pm2 logs dpmd-backend --lines 10
```

---

## 🔙 Rollback (if needed)

```bash
# Restore DB
mysql -u root -p dpmd < ~/backup_dpmd_TIMESTAMP.sql

# Drop new table
mysql -u root -p dpmd -e "DROP TABLE kelembagaan_activity_logs;"

# Restart server
pm2 restart dpmd-backend
```

---

## 📞 Emergency Contact

- **Database Issue:** Restore from backup
- **Server Won't Start:** Check `pm2 logs`
- **API Error:** Verify files uploaded correctly

---

**Done! 🎉**

Test by creating a new RW/RT/Posyandu and check activity logs in frontend.
