# 🚀 QUICK DEPLOYMENT GUIDE - VPS Backend Update

## ⚡ FASTEST WAY (Copy-Paste Method)

### 1. Connect to VPS
```bash
ssh root@72.61.143.224
```
Password: `Hawsyidigital@123`

### 2. Run This Single Command (Copy All):
```bash
cd /var/www/dpmd-backend && git stash && git pull origin main && mkdir -p storage/avatars storage/uploads/pengurus_files && chmod -R 755 storage/ && chown -R www-data:www-data storage/ && pm2 restart dpmd-api && echo "✅ Deployment Complete!" && pm2 list
```

### 3. Verify Database Has Avatar Column:
```bash
mysql -u dpmd_user -p'DpmdBogor2025!' dpmd -e "SHOW COLUMNS FROM users LIKE 'avatar';"
```

**If returns empty, add column:**
```bash
mysql -u dpmd_user -p'DpmdBogor2025!' dpmd -e "ALTER TABLE users ADD COLUMN avatar VARCHAR(255) NULL AFTER role;"
```

### 4. Done! ✅

---

## 📋 What This Does:
- ✅ Pulls latest code from GitHub
- ✅ Creates storage directories
- ✅ Sets correct permissions
- ✅ Restarts backend service

---

## 🔍 Verification:

**Check if backend is running:**
```bash
pm2 status
```

**View logs:**
```bash
pm2 logs dpmd-api --lines 20
```

**Test API:**
```bash
curl https://api.dpmdbogorkab.id/health
```

---

## ⚠️ If Issues:

**Check storage folders exist:**
```bash
ls -la /var/www/dpmd-backend/storage/
```

**Fix permissions if needed:**
```bash
cd /var/www/dpmd-backend
chmod -R 755 storage/
chown -R www-data:www-data storage/
```

**Restart if not responding:**
```bash
pm2 restart dpmd-api
```

---

## ✅ Success Indicators:

1. PM2 shows: `dpmd-api | online`
2. Storage folders exist with 755 permissions
3. Database has `avatar` column
4. No errors in `pm2 logs`
5. Frontend avatar upload works

---

## 🎯 Changes Deployed:

1. **Avatar Upload Fix**: Changed field `name` → `nama`
2. **Error Handling**: Better error messages
3. **Storage Setup**: Auto-create directories
4. **Cleanup**: Delete uploaded files on error

---

**Last Updated:** December 26, 2025
