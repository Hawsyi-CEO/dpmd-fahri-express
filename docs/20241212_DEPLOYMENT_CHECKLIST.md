# ✅ Deployment Checklist - Activity Logs

**Tanggal:** _______________  
**PIC:** _______________  
**Start Time:** _______________  
**End Time:** _______________

---

## 📋 Pre-Deployment

- [ ] Informasi users tentang maintenance
- [ ] Backup database production
  ```bash
  mysqldump -u root -p dpmd > ~/backup_dpmd_$(date +%Y%m%d_%H%M%S).sql
  ```
- [ ] Verifikasi backup berhasil
  ```bash
  ls -lh ~/backup_dpmd_*.sql
  ```
- [ ] Test di staging (jika ada)
- [ ] Review code changes

**Notes:** _______________________________________

---

## 🛠️ Backend Deployment

- [ ] Stop backend server
  ```bash
  pm2 stop dpmd-backend
  ```

- [ ] Upload file baru:
  - [ ] `src/utils/kelembagaanActivityLogger.js`
  - [ ] `src/controllers/kelembagaanActivityLogs.controller.js`
  - [ ] `src/routes/kelembagaanActivityLogs.routes.js`
  - [ ] `database-express/migrations/20241212_create_kelembagaan_activity_logs.sql`

- [ ] Upload file modified:
  - [ ] `src/controllers/kelembagaan.controller.js`
  - [ ] `src/server.js`
  - [ ] `prisma/schema.prisma`

- [ ] Run database migration
  ```bash
  mysql -u root -p dpmd < database-express/migrations/20241212_create_kelembagaan_activity_logs.sql
  ```

- [ ] Verify table created
  ```bash
  mysql -u root -p dpmd -e "SHOW TABLES LIKE 'kelembagaan_activity_logs';"
  ```

- [ ] Generate Prisma client
  ```bash
  npx prisma generate
  ```

- [ ] Start backend server
  ```bash
  pm2 start dpmd-backend
  ```

- [ ] Check logs for errors
  ```bash
  pm2 logs dpmd-backend --lines 30
  ```

**Notes:** _______________________________________

---

## 🌐 Frontend Deployment

- [ ] Build frontend
  ```bash
  cd dpmd-frontend && npm run build
  ```

- [ ] Upload files:
  - [ ] `src/services/activityLogs.js`
  - [ ] `src/pages/desa/kelembagaan/KelembagaanDetailPage.jsx`
  - [ ] `src/pages/desa/kelembagaan/KelembagaanList.jsx`

- [ ] Or sync entire dist
  ```bash
  rsync -avz dist/ user@vps:/var/www/dpmd-frontend/
  ```

- [ ] Clear browser cache (ask users)

**Notes:** _______________________________________

---

## 🧪 Testing

### Backend Testing:
- [ ] Server running tanpa error
- [ ] Endpoint list accessible:
  ```bash
  curl http://localhost:3001/api/kelembagaan/activity-logs/list?type=rw&desa_id=1
  ```
- [ ] Endpoint detail accessible:
  ```bash
  curl http://localhost:3001/api/kelembagaan/activity-logs/detail/rw/ID
  ```
- [ ] Create RW baru → log tercatat
- [ ] Update RW → log tercatat
- [ ] Toggle status → log tercatat

### Frontend Testing:
- [ ] Login ke aplikasi
- [ ] Buka halaman Kelembagaan List
- [ ] Tab "Log Aktivitas" muncul
- [ ] Klik tab → data loading/muncul
- [ ] Buka detail kelembagaan
- [ ] Section "Riwayat Aktivitas" muncul
- [ ] Log ditampilkan dengan benar
- [ ] Icon dan timestamp sesuai

### Database Testing:
- [ ] Query records:
  ```bash
  mysql -u root -p dpmd -e "SELECT * FROM kelembagaan_activity_logs LIMIT 5;"
  ```
- [ ] Count records:
  ```bash
  mysql -u root -p dpmd -e "SELECT COUNT(*) FROM kelembagaan_activity_logs;"
  ```

**Test Results:** _______________________________________

---

## 📊 Monitoring (24 jam pertama)

- [ ] **Jam 1:** Check logs & performance
- [ ] **Jam 4:** Check logs & database size
- [ ] **Jam 8:** Check user feedback
- [ ] **Jam 24:** Full system check

**Notes:** _______________________________________

---

## 🔙 Rollback (jika diperlukan)

- [ ] Stop server
  ```bash
  pm2 stop dpmd-backend
  ```

- [ ] Restore database
  ```bash
  mysql -u root -p dpmd < ~/backup_dpmd_TIMESTAMP.sql
  ```

- [ ] Drop new table (optional)
  ```bash
  mysql -u root -p dpmd -e "DROP TABLE kelembagaan_activity_logs;"
  ```

- [ ] Restore old code files

- [ ] Restart server
  ```bash
  pm2 start dpmd-backend
  ```

**Rollback Reason:** _______________________________________

---

## 📝 Post-Deployment

- [ ] Update API documentation
- [ ] Update user manual
- [ ] Create release notes
- [ ] Notify users deployment selesai
- [ ] Archive deployment checklist
- [ ] Schedule post-deployment review

**Final Notes:** _______________________________________

---

## ✅ Sign-off

**Deployment Status:** 
- [ ] Success ✅
- [ ] Partial Success ⚠️
- [ ] Failed (Rolled Back) ❌

**Deployed By:** _______________  
**Signature:** _______________  
**Date & Time:** _______________

**Verified By:** _______________  
**Signature:** _______________  
**Date & Time:** _______________

---

## 📸 Evidence

Attach screenshots:
- [ ] Server logs after deployment
- [ ] Database table structure
- [ ] API response sample
- [ ] Frontend UI screenshots
- [ ] Monitoring dashboard

**File Location:** _______________________________________

---

**End of Checklist**
