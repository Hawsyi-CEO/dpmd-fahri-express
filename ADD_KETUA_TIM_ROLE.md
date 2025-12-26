# Add Ketua Tim Role to Backend

## Overview
Menambahkan role `ketua_tim` ke dalam sistem untuk melengkapi hirarki disposisi.

## Hirarki Disposisi
```
Sekretariat → Kepala Dinas → Sekretaris Dinas → Kepala Bidang → Ketua Tim → Pegawai
```

## Changes Required

### 1. Database Migration (Optional)
Jika menggunakan enum untuk role di database, perlu update:

```sql
-- Check existing roles
SELECT DISTINCT role FROM users;

-- If using ENUM, need to alter (skip if using VARCHAR)
-- ALTER TABLE users MODIFY COLUMN role ENUM('superadmin', 'kepala_dinas', 'sekretaris_dinas', 'kabid_sekretariat', 'kabid_pemerintahan_desa', 'kabid_spked', 'kabid_kekayaan_keuangan_desa', 'kabid_pemberdayaan_masyarakat_desa', 'ketua_tim', 'pegawai', 'desa', 'kecamatan', 'dinas', 'kkd', 'admin');
```

### 2. Create Test User Ketua Tim

```sql
-- Insert test user for ketua_tim role
INSERT INTO users (
  name, 
  email, 
  password, 
  role, 
  status, 
  created_at, 
  updated_at
) VALUES (
  'Test Ketua Tim',
  'ketuatim@test.com',
  '$2b$10$abcdefghijklmnopqrstuvwxyz123456', -- password: test123
  'ketua_tim',
  'active',
  NOW(),
  NOW()
);
```

### 3. Update Authorization Middleware

File: `src/middlewares/auth.middleware.js`

Pastikan role `ketua_tim` diizinkan mengakses endpoint yang sesuai:

```javascript
const roleHierarchy = {
  superadmin: ['*'],
  kepala_dinas: ['kepala_dinas', 'sekretaris_dinas', 'kabid_*', 'ketua_tim', 'pegawai'],
  sekretaris_dinas: ['sekretaris_dinas', 'kabid_*', 'ketua_tim', 'pegawai'],
  kabid_sekretariat: ['kabid_sekretariat', 'ketua_tim', 'pegawai'],
  kabid_pemerintahan_desa: ['kabid_pemerintahan_desa', 'ketua_tim', 'pegawai'],
  kabid_spked: ['kabid_spked', 'ketua_tim', 'pegawai'],
  kabid_kekayaan_keuangan_desa: ['kabid_kekayaan_keuangan_desa', 'ketua_tim', 'pegawai'],
  kabid_pemberdayaan_masyarakat_desa: ['kabid_pemberdayaan_masyarakat_desa', 'ketua_tim', 'pegawai'],
  ketua_tim: ['ketua_tim', 'pegawai'], // NEW ROLE
  pegawai: ['pegawai'],
  desa: ['desa'],
  kecamatan: ['kecamatan']
};
```

### 4. Update Role Validation

File: `src/utils/validation.js` atau sejenisnya

Tambahkan `ketua_tim` ke list valid roles:

```javascript
const validRoles = [
  'superadmin',
  'kepala_dinas',
  'sekretaris_dinas',
  'kabid_sekretariat',
  'kabid_pemerintahan_desa',
  'kabid_spked',
  'kabid_kekayaan_keuangan_desa',
  'kabid_pemberdayaan_masyarakat_desa',
  'ketua_tim', // NEW
  'pegawai',
  'desa',
  'kecamatan',
  'dinas',
  'kkd',
  'admin'
];
```

### 5. Update User Controller (if needed)

File: `src/controllers/user.controller.js`

Pastikan role `ketua_tim` bisa dibuat saat register/create user.

### 6. Update Role Display Names

File: `src/utils/constants.js` atau sejenisnya

```javascript
const roleDisplayNames = {
  superadmin: 'Super Admin',
  kepala_dinas: 'Kepala Dinas',
  sekretaris_dinas: 'Sekretaris Dinas',
  kabid_sekretariat: 'Kepala Bidang Sekretariat',
  kabid_pemerintahan_desa: 'Kepala Bidang Pemerintahan Desa',
  kabid_spked: 'Kepala Bidang SPKED',
  kabid_kekayaan_keuangan_desa: 'Kepala Bidang Kekayaan & Keuangan Desa',
  kabid_pemberdayaan_masyarakat_desa: 'Kepala Bidang Pemberdayaan Masyarakat Desa',
  ketua_tim: 'Ketua Tim', // NEW
  pegawai: 'Pegawai',
  desa: 'Desa',
  kecamatan: 'Kecamatan'
};
```

## Deployment Steps

### Step 1: Connect to VPS
```bash
ssh root@72.61.143.224
```

### Step 2: Navigate to Backend Directory
```bash
cd /var/www/dpmd-backend
```

### Step 3: Pull Latest Changes (if using git)
```bash
git pull origin main
```

### Step 4: Check Database for Role Column
```bash
mysql -u your_username -p
USE dpmd_database;
DESCRIBE users;
```

### Step 5: Add Test User (Optional)
```bash
# Using MySQL CLI or phpMyAdmin
# Run the INSERT query from section 2 above
```

### Step 6: Restart PM2
```bash
pm2 restart dpmd-api
pm2 logs dpmd-api --lines 50
```

### Step 7: Test the New Role
```bash
# Test login with ketua_tim user
curl -X POST https://api.dpmdbogorkab.id/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ketuatim@test.com","password":"test123"}'
```

## Verification Checklist

- [ ] Role `ketua_tim` exists in database users table
- [ ] Test user dengan role `ketua_tim` berhasil dibuat
- [ ] Login dengan akun `ketua_tim` berhasil
- [ ] Token JWT include role `ketua_tim`
- [ ] Akses ke endpoint yang diizinkan berhasil
- [ ] Frontend route `/ketua-tim/*` bisa diakses
- [ ] Notification system berfungsi untuk ketua_tim
- [ ] Push notification subscription berhasil

## Notes

- Role `ketua_tim` berada di antara Kepala Bidang dan Pegawai dalam hirarki
- Ketua Tim bisa menerima disposisi dari Kepala Bidang
- Ketua Tim bisa forward disposisi ke Pegawai
- Frontend layout sudah siap dengan teal theme
- Route sudah ditambahkan di App.jsx

## Troubleshooting

### Issue: Login failed with ketua_tim
**Solution:** Check if role exists in database and matches exactly `ketua_tim` (lowercase with underscore)

### Issue: Forbidden access
**Solution:** Verify auth middleware includes `ketua_tim` in allowed roles

### Issue: Frontend redirect to login
**Solution:** Check RoleProtectedRoute in App.jsx includes `ketua_tim` in allowedRoles array

## Contact
Jika ada masalah saat deployment, check:
1. PM2 logs: `pm2 logs dpmd-api`
2. Backend health: `curl https://api.dpmdbogorkab.id/health`
3. Database connection
