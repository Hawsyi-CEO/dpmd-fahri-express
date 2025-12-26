# FIX AVATAR UPLOAD ERROR 500 - 26 Desember 2025

## 🐛 Masalah
```
POST https://api.dpmdbogorkab.id/api/users/439/avatar 500 (Internal Server Error)
Error uploading photo: AxiosError
```

## 🔍 Penyebab
Error 500 kemungkinan disebabkan oleh:
1. **Folder `storage/avatars/` tidak ada di VPS**
2. **Permission folder tidak benar** (tidak bisa write)
3. **Ownership folder salah** (bukan milik user yang menjalankan PM2)
4. **Disk space penuh**

## ✅ Solusi

### Cara 1: Jalankan Script Otomatis (RECOMMENDED)

1. **Upload script ke VPS**
   ```bash
   scp fix-avatar-upload-vps.sh root@72.61.143.224:/var/www/dpmd-backend/
   ```

2. **SSH ke VPS**
   ```bash
   ssh root@72.61.143.224
   # Password: Hawsyidigital@123
   ```

3. **Jalankan script fix**
   ```bash
   cd /var/www/dpmd-backend
   chmod +x fix-avatar-upload-vps.sh
   ./fix-avatar-upload-vps.sh
   ```

### Cara 2: Manual Fix

Jika script tidak bisa dijalankan, lakukan manual:

```bash
# 1. SSH ke VPS
ssh root@72.61.143.224

# 2. Masuk ke directory backend
cd /var/www/dpmd-backend

# 3. Buat storage directories
mkdir -p storage/avatars
mkdir -p storage/uploads
mkdir -p storage/produk_hukum

# 4. Set permissions
chmod -R 755 storage/

# 5. Set ownership (ganti 'fahri' dengan user yang menjalankan PM2)
chown -R fahri:fahri storage/

# 6. Test write permission
touch storage/avatars/.test && rm storage/avatars/.test && echo "✅ Write OK" || echo "❌ Write FAILED"

# 7. Check disk space
df -h

# 8. Regenerate Prisma client
npx prisma generate

# 9. Restart backend
pm2 restart dpmd-api

# 10. Check logs
pm2 logs --lines 50
```

## 🔍 Debugging

### Check Error Logs
```bash
# Di VPS
cd /var/www/dpmd-backend
tail -50 logs/error.log
```

### Check PM2 Logs
```bash
pm2 logs dpmd-api --lines 50
```

### Check Directory Structure
```bash
ls -la storage/
ls -la storage/avatars/
```

### Check Permissions
```bash
ls -lah storage/
# Should show: drwxr-xr-x (755) owned by the PM2 user
```

### Test Upload Manually
```bash
# Create a test file
echo "test" > storage/avatars/test.txt

# If success, you should be able to create files
# Remove test file
rm storage/avatars/test.txt
```

## 🎯 Verification

Setelah fix, test dengan:

1. **Login ke aplikasi** sebagai user
2. **Buka Profile page**
3. **Upload foto profil**
4. **Harus berhasil tanpa error 500**

## 📝 Additional Notes

### Backend Path Variations
Tergantung deployment, backend path bisa berbeda:
- `/var/www/dpmd-backend`
- `/var/www/dpmd-fahri-express`
- `/home/fahri/dpmd-backend`

Cek dengan:
```bash
pm2 list
# Lihat 'cwd' column untuk melihat path
```

### PM2 User
Cek user yang menjalankan PM2:
```bash
pm2 jlist | grep user
# atau
ps aux | grep PM2
```

### Nginx Configuration
Pastikan Nginx mengizinkan upload file besar:
```nginx
client_max_body_size 10M;
```

File config biasanya di:
- `/etc/nginx/sites-available/dpmd-api`
- `/etc/nginx/nginx.conf`

Jika ada perubahan Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 🚀 Prevention

Untuk mencegah masalah ini terulang, tambahkan di deployment script:

```bash
# Ensure storage directories exist
mkdir -p storage/avatars storage/uploads storage/produk_hukum
chmod -R 755 storage/
chown -R $USER:$USER storage/
```

## 📞 Support

Jika masalah masih terjadi setelah fix:
1. Check `pm2 logs` untuk error detail
2. Check `logs/error.log` untuk stack trace
3. Verify Prisma connection ke database
4. Check disk space: `df -h`
5. Check memory: `free -m`

---

**Last Updated**: 26 Desember 2025
**Status**: RESOLVED ✅
