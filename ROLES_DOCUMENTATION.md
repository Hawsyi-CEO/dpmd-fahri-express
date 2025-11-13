# DPMD System - User Roles Documentation

## Valid Roles in System

Berikut adalah role yang VALID dan sesuai dengan `users_seeder.js`:

### 1. **superadmin**
- **Count:** 1 user
- **Email:** superadmin@dpmd.bogorkab.go.id  
- **Password:** admin123
- **Access:**
  - Full system access
  - Core Dashboard (Kepala Dinas Dashboard)
  - BUMDes Management
  - Perjalanan Dinas Management
  - Musdesus Management
  - Hero Gallery Management
  - Berita Management
  - Landing Page Management

### 2. **kepala_dinas**
- **Count:** 1 user (custom)
- **Email:** kepaladinas@dpmd.bogorkab.go.id
- **Password:** kepaladinas123
- **Access:**
  - Core Dashboard (Kepala Dinas Dashboard)
  - View-only access to statistics
  - Berita Management
  - Landing Page Management
- **Purpose:** Role khusus untuk Kepala Dinas DPMD yang hanya akses dashboard statistik

### 3. **dinas**
- **Count:** 1 user
- **Email:** dinas@dpmd.bogorkab.go.id
- **Password:** dinas123
- **Access:**
  - BUMDes Management (Full CRUD)
  - Perjalanan Dinas Management (Read)
  - Musdesus Management (Full CRUD)
  - Hero Gallery Management (Full CRUD)
  - Location data access

### 4. **pemberdayaan_masyarakat**
- **Count:** 1 user
- **Email:** bidang@dpmd.bogorkab.go.id
- **Password:** bidang123
- **Access:**
  - Perjalanan Dinas Management (Full CRUD)
  - Bidang-specific features

### 5. **desa**
- **Count:** 97 users
- **Email Pattern:** desa.[nama-desa].[kecamatan]@dpmd.bogorkab.go.id
- **Password:** desa123 (untuk testing)
- **Access:**
  - BUMDes Management (untuk desa mereka)
  - Location data access
  - Musdesus Management (untuk desa mereka)

---

## Roles DIHAPUS (Tidak Valid)

Role berikut **TIDAK ADA** di `users_seeder.js` dan **TIDAK BOLEH** digunakan:

- ❌ **admin** - Ganti dengan `superadmin`
- ❌ **kepala_desa** - Tidak ada di seeder
- ❌ **sekretaris_desa** - Tidak ada di seeder
- ❌ **camat** - Tidak ada di seeder
- ❌ **administrator** - Tidak ada di seeder

---

## Route Access Matrix

| Route                  | superadmin | kepala_dinas | dinas | pemberdayaan_masyarakat | desa |
|------------------------|-----------|--------------|-------|-------------------------|------|
| Core Dashboard         | ✅        | ✅           | ❌    | ❌                      | ❌   |
| BUMDes (Full CRUD)     | ✅        | ❌           | ✅    | ❌                      | ✅*  |
| Perjadin (Full CRUD)   | ✅        | ❌           | ❌    | ✅                      | ❌   |
| Musdesus (Full CRUD)   | ✅        | ❌           | ✅    | ❌                      | ✅*  |
| Hero Gallery           | ✅        | ❌           | ✅    | ❌                      | ❌   |
| Berita Management      | ✅        | ✅           | ❌    | ❌                      | ❌   |
| Landing Page (Public)  | ✅ (All)  | ✅ (All)     | ✅ (All) | ✅ (All)           | ✅ (All) |

*Desa hanya bisa CRUD untuk desa mereka sendiri

---

## Migration Notes

**Updated Files:**
1. `src/routes/berita.routes.js` - Changed `'admin'` → `'kepala_dinas'`
2. `database-express/seeders/kepala_dinas_seeder.sql` - Added kepala_dinas user
3. Database: Added user ID 2543 with role `kepala_dinas`

**Password Hashing:**
- All passwords use bcrypt with cost factor 12 (`$2y$12$...`)
- Default test passwords:
  - superadmin: `admin123`
  - kepala_dinas: `kepaladinas123`
  - dinas: `dinas123`
  - bidang: `bidang123`
  - desa: `desa123`

---

## Testing Credentials

### For Core Dashboard Access:
```
Email: superadmin@dpmd.bogorkab.go.id
Password: admin123
Role: superadmin
```

```
Email: kepaladinas@dpmd.bogorkab.go.id  
Password: kepaladinas123
Role: kepala_dinas
```

### For BUMDes Management:
```
Email: dinas@dpmd.bogorkab.go.id
Password: dinas123
Role: dinas
```

### For Perjalanan Dinas Management:
```
Email: bidang@dpmd.bogorkab.go.id
Password: bidang123
Role: pemberdayaan_masyarakat
```

### For Desa-specific Access:
```
Email: desa.pondok-rajeg.cibinong@dpmd.bogorkab.go.id
Password: desa123
Role: desa
Desa ID: 1
```

---

Last Updated: 2025-11-12
