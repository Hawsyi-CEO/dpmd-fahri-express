# VPS Backend Deployment Instructions
## Date: December 26, 2025

---

## 🎯 Update Summary

**Changes to Deploy:**
1. Avatar upload fix (field `name` → `nama`)
2. Enhanced error handling for avatar upload
3. Storage directory setup script

---

## 📋 Option 1: Automated Deployment (Recommended)

### Step 1: Upload deployment script to VPS
```bash
# From your local machine
scp deploy-vps.sh root@72.61.143.224:/root/
```

### Step 2: Connect to VPS and run script
```bash
ssh root@72.61.143.224
# Password: Hawsyidigital@123

cd /root
chmod +x deploy-vps.sh
./deploy-vps.sh
```

**Expected output:**
- ✅ Code updated from GitHub
- ✅ Storage directories created
- ✅ Database schema checked
- ✅ Backend service restarted

---

## 📋 Option 2: Manual Deployment

### 1. Connect to VPS
```bash
ssh root@72.61.143.224
# Password: Hawsyidigital@123
```

### 2. Navigate to backend directory
```bash
cd /var/www/dpmd-backend
```

### 3. Check current status
```bash
git status
```

### 4. Stash local changes (if any)
```bash
git stash
```

### 5. Pull latest code
```bash
git pull origin main
```

### 6. Create storage directories
```bash
mkdir -p storage/avatars
mkdir -p storage/uploads/pengurus_files
chmod -R 755 storage/
chown -R www-data:www-data storage/
```

### 7. Check database for avatar column
```bash
mysql -u dpmd_user -p'DpmdBogor2025!' dpmd -e "DESCRIBE users;"
```

**If avatar column doesn't exist, add it:**
```bash
mysql -u dpmd_user -p'DpmdBogor2025!' dpmd -e "ALTER TABLE users ADD COLUMN avatar VARCHAR(255) NULL AFTER role;"
```

### 8. Restart backend service
```bash
pm2 restart dpmd-api
```

### 9. Verify service is running
```bash
pm2 list
pm2 logs dpmd-api --lines 20
```

---

## ✅ Verification Steps

### 1. Check storage directories exist
```bash
ls -la /var/www/dpmd-backend/storage/
```

Should show:
- `avatars/` (755 permissions, owned by www-data)
- `uploads/` (755 permissions, owned by www-data)
- `uploads/pengurus_files/` (755 permissions, owned by www-data)

### 2. Check database schema
```bash
mysql -u dpmd_user -p'DpmdBogor2025!' dpmd -e "SHOW COLUMNS FROM users LIKE 'avatar';"
```

Should show:
```
+--------+--------------+------+-----+---------+-------+
| Field  | Type         | Null | Key | Default | Extra |
+--------+--------------+------+-----+---------+-------+
| avatar | varchar(255) | YES  |     | NULL    |       |
+--------+--------------+------+-----+---------+-------+
```

### 3. Check backend is running
```bash
pm2 status dpmd-api
```

Should show: `online` status

### 4. Test API endpoint
```bash
curl -X GET https://api.dpmdbogorkab.id/health
```

Should return: `{"status":"ok"}`

---

## 🧪 Testing Avatar Upload

### From Frontend:
1. Login ke profile page
2. Click "Edit Photo"
3. Upload image (JPG/PNG, < 2MB)
4. Should show: "✅ Foto profil berhasil diperbarui!"

### Check Console:
Should see:
```
✅ Avatar uploaded successfully
```

Should NOT see:
```
❌ 404 Not Found
❌ Error uploading photo
```

---

## 🔧 Troubleshooting

### If storage permissions error:
```bash
cd /var/www/dpmd-backend
chown -R www-data:www-data storage/
chmod -R 755 storage/
```

### If backend not restarting:
```bash
pm2 delete dpmd-api
pm2 start src/server.js --name dpmd-api
pm2 save
```

### If database error:
```bash
# Check if column exists
mysql -u dpmd_user -p'DpmdBogor2025!' dpmd -e "DESCRIBE users;"

# If avatar column missing, add it
mysql -u dpmd_user -p'DpmdBogor2025!' dpmd -e "ALTER TABLE users ADD COLUMN avatar VARCHAR(255) NULL AFTER role;"
```

### View backend logs:
```bash
pm2 logs dpmd-api --lines 50
```

---

## 📝 Files Modified

### Backend:
- `src/controllers/user.controller.js` - Fixed avatar upload response
- `ensure-storage-dirs-vps.sh` - Storage setup script (new)
- `deploy-vps.sh` - Automated deployment script (new)

### Changes:
1. Changed `name` field to `nama` in avatar upload response
2. Added file cleanup on error
3. Enhanced error handling
4. Added storage directory checks

---

## 🚨 Important Notes

1. **Database Migration**: Avatar column will be auto-added if missing
2. **Permissions**: Storage folders must be writable by www-data
3. **Existing Avatars**: If users already have avatars, check path format is `/storage/avatars/filename`
4. **Max File Size**: Frontend limits to 2MB, backend also has 2MB limit

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub (main branch)
- [ ] Connected to VPS
- [ ] Pulled latest code
- [ ] Storage directories created
- [ ] Database schema updated
- [ ] Backend service restarted
- [ ] Service status verified (online)
- [ ] Avatar upload tested
- [ ] No errors in logs

---

## 📞 Support

If issues persist:
1. Check PM2 logs: `pm2 logs dpmd-api`
2. Check database connection
3. Verify storage permissions
4. Test API endpoint directly with curl
