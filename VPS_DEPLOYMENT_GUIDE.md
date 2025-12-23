# Panduan Deployment ke VPS (72.61.143.224)

## 📋 Pre-requisites

- Akses SSH ke VPS: `root@72.61.143.224`
- Git credentials untuk clone repo
- Domain sudah pointing: api.dpmdbogorkab.id → 72.61.143.224
- MySQL database sudah ready

## 🚀 Deployment Pertama Kali (Initial Setup)

### Step 1: Upload setup script ke VPS

```bash
# Dari local machine
scp setup-vps-initial.sh root@72.61.143.224:/root/
```

### Step 2: SSH ke VPS dan jalankan setup

```bash
ssh root@72.61.143.224

# Jalankan setup script
chmod +x setup-vps-initial.sh
./setup-vps-initial.sh

# Ikuti instruksi yang muncul:
# 1. Input GitHub credentials jika diminta
# 2. Copy .env.example jadi .env
# 3. Edit .env sesuai production settings
```

### Step 3: Setup Database

```bash
cd /var/www/dpmd-backend

# Buat push_subscriptions table
mysql -u root -p dpmd_express < migrations/create-push-subscriptions-table.sql

# Generate Prisma client
npx prisma generate

# (Optional) Sync schema ke database
npx prisma db push
```

### Step 4: Start dengan PM2

```bash
# Install PM2 globally jika belum ada
npm install -g pm2

# Start aplikasi
pm2 start src/server.js --name dpmd-api

# Setup auto-restart on reboot
pm2 startup
pm2 save
```

### Step 5: Konfigurasi Nginx (jika belum)

```bash
# Copy nginx config yang sudah ada
cp nginx-api-dpmdbogorkab.conf /etc/nginx/sites-available/api.dpmdbogorkab.id

# Enable site
ln -s /etc/nginx/sites-available/api.dpmdbogorkab.id /etc/nginx/sites-enabled/

# Test dan reload
nginx -t
systemctl reload nginx
```

### Step 6: Test API

```bash
# Test dari VPS
curl http://localhost:3001/api/health

# Test dari luar (production domain)
curl https://api.dpmdbogorkab.id/api/health
```

## 🔄 Deployment Update (Setelah Initial Setup)

### Option 1: Menggunakan deploy script (Recommended)

```bash
# Dari local machine
scp deploy-to-vps.sh root@72.61.143.224:/root/

# SSH ke VPS
ssh root@72.61.143.224

# Jalankan deploy
chmod +x deploy-to-vps.sh
./deploy-to-vps.sh
```

### Option 2: Manual deployment

```bash
ssh root@72.61.143.224

cd /var/www/dpmd-backend

# Pull latest code
git pull origin main

# Install dependencies
npm install --production

# Generate Prisma client
npx prisma generate

# Restart PM2
pm2 restart dpmd-api

# Check status
pm2 status
pm2 logs dpmd-api --lines 50
```

## 🔍 Troubleshooting

### Check PM2 status

```bash
pm2 status
pm2 logs dpmd-api
pm2 logs dpmd-api --err  # Error logs only
```

### Check Nginx status

```bash
systemctl status nginx
nginx -t  # Test config
tail -f /var/log/nginx/error.log
```

### Check Node version

```bash
node -v  # Should be >= 18.x
```

### Database connection issues

```bash
cd /var/www/dpmd-backend

# Test database connection
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('DB OK')).catch(e => console.error(e))"
```

### Permission issues

```bash
# Fix ownership
chown -R www-data:www-data /var/www/dpmd-backend

# Fix permissions
chmod -R 755 /var/www/dpmd-backend
```

## 📱 Test Push Notifications

### 1. Subscribe dari frontend

```bash
# Buka browser, login ke aplikasi
https://dpmdbogorkab.id

# Enable notifikasi dari settings
# Check console untuk subscription endpoint
```

### 2. Test dari backend

```bash
ssh root@72.61.143.224
cd /var/www/dpmd-backend

# Create test script
cat > test-push.js << 'EOF'
const PushNotificationService = require('./src/services/pushNotificationService');

async function test() {
  try {
    const result = await PushNotificationService.sendTestNotification(1); // User ID 1
    console.log('✅ Test notification sent:', result);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

test();
EOF

# Jalankan test
node test-push.js
```

### 3. Create disposisi dari frontend

```bash
# Login sebagai user A
# Buat disposisi untuk user B
# Check apakah notification muncul di device user B
```

## 📝 Environment Variables Checklist

Pastikan `.env` di VPS sudah berisi:

```bash
# Database
DATABASE_URL="mysql://user:password@localhost:3306/dpmd_express"

# JWT
JWT_SECRET="production-secret-key-yang-kuat"

# Push Notifications
VAPID_PUBLIC_KEY="BCEEJBfb05GAzlnpuzfPJszt054iCSOhqPVkmAMyTcUGZ8VrNluqShCQ2PVmwcMU0WuXJC35P5_XCXJNaQczX-U"
VAPID_PRIVATE_KEY="R9vEurYnCrk..." # Full private key dari .env.production

# CORS
CORS_ORIGIN="https://dpmdbogorkab.id"

# Server
PORT=3001
NODE_ENV=production
```

## 🎯 Post-Deployment Checklist

- [ ] API health check berhasil: `curl https://api.dpmdbogorkab.id/api/health`
- [ ] PM2 status running: `pm2 status`
- [ ] Database connection OK
- [ ] Push notifications table exists
- [ ] VAPID keys sama dengan frontend
- [ ] CORS origin benar (https://dpmdbogorkab.id)
- [ ] Nginx config benar
- [ ] SSL certificate active (https)
- [ ] PM2 startup configured
- [ ] Test login dari frontend
- [ ] Test push notification subscription
- [ ] Test create disposisi + notification

## 🔒 Security Notes

1. **Firewall**: Pastikan hanya port 80, 443, 22, 3001 yang terbuka
2. **Environment**: File `.env` harus mode 600 (tidak readable by others)
3. **Database**: User database harus limited privileges (tidak root)
4. **PM2 Logs**: Rotate logs untuk prevent disk full: `pm2 install pm2-logrotate`
5. **SSH**: Gunakan SSH key instead of password

## 📞 Support

Jika ada masalah deployment, check:
1. PM2 logs: `pm2 logs dpmd-api --lines 100`
2. Nginx error log: `/var/log/nginx/error.log`
3. System log: `journalctl -u nginx -n 50`
4. Database log: Check MySQL slow query log

---

**Last Updated**: Deployment to VPS 72.61.143.224
**Backend Repo**: https://github.com/Hawsyi-CEO/dpmd-fahri-express.git
**API URL**: https://api.dpmdbogorkab.id
