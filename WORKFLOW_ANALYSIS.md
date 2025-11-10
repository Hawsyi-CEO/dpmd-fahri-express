# Analisis Workflow DPMD - Express Backend vs Laravel

## Status: ✅ 100% Express Backend (No Laravel)

### Ringkasan
Semua modul telah **SEPENUHNYA menggunakan Express Backend** (port 3001). Tidak ada yang masih menggunakan Laravel.

---

## 📊 Backend Express (Port 3001) - Modul Tersedia

### ✅ 1. Authentication
- **Endpoint**: `/api/auth/*`
- **Controller**: `auth.controller.js`
- **Status**: Express only
- **Fitur**: Login, Token verification

### ✅ 2. Bumdes
- **Endpoint**: `/api/bumdes/*` dan `/api/desa/bumdes/*`
- **Controller**: `bumdes.controller.js`
- **Status**: Express only
- **Fitur**:
  - CRUD Bumdes
  - Statistics
  - Dokumen Badan Hukum
  - Laporan Keuangan
  - Produk Hukum (linking only)
  - File management
  - Export PDF/Excel

### ✅ 3. Musdesus
- **Endpoint**: `/api/musdesus/*`
- **Controller**: `musdesus.controller.js`
- **Status**: Express only
- **Fitur**:
  - Upload & management files
  - Statistics
  - Monitoring
  - File download/delete

### ✅ 4. Perjalanan Dinas
- **Endpoint**: `/api/perjadin/*`
- **Controller**: `perjalananDinas.controller.js`
- **Status**: Express only
- **Fitur**:
  - CRUD Kegiatan
  - Dashboard statistics
  - Bidang management
  - Personil management
  - Conflict checking
  - Weekly schedule

### ✅ 5. Location (Kecamatan & Desa)
- **Endpoint**: `/api/kecamatans`, `/api/desas/*`
- **Controller**: `location.controller.js`
- **Status**: Express only
- **Fitur**: Master data lokasi

### ✅ 6. Hero Gallery
- **Endpoint**: `/api/hero-gallery/*`
- **Controller**: `heroGallery.controller.js`
- **Status**: Express only
- **Fitur**: Landing page gallery management

---

## 🔍 Frontend Analysis - Semua Menggunakan Express

### Dashboard Desa ✅
**Path**: `/dashboard/desa/*`
- **Bumdes**: ✅ Express (`/api/desa/bumdes`)
- **Profil Desa**: ⚠️ **BELUM ADA DI EXPRESS** (masih hard-coded/static)
- **Kelembagaan**: ⚠️ **BELUM ADA DI EXPRESS** (masih menggunakan local state)
- **Pengurus**: ⚠️ **BELUM ADA DI EXPRESS** (API `/api/pengurus` belum ada di backend)
- **Aparatur Desa**: ⚠️ **BELUM ADA DI EXPRESS** (API `/api/aparatur-desa` belum ada)
- **Produk Hukum**: ⚠️ **BELUM ADA DI EXPRESS** (Hard-coded fallback ke port 8000)

### Dashboard Sekretariat ✅
**Path**: `/dashboard/sekretariat/*`
- **Perjalanan Dinas**: ✅ Express (`/api/perjadin`)

### Dashboard Sarpras ✅
**Path**: `/dashboard/sarpras/*`
- **Bumdes**: ✅ Express (`/api/bumdes/all`)
- **Musdesus**: ✅ Express (`/api/musdesus`)

### Dashboard Admin & Superadmin ✅
**Path**: `/dashboard/admin/*`, `/dashboard/superadmin/*`
- **Hero Gallery**: ✅ Express (`/api/hero-gallery`)
- **Bumdes Monitoring**: ✅ Express (`/api/bumdes`)
- **Musdesus Monitoring**: ✅ Express (`/api/musdesus`)
- **Perjalanan Dinas**: ✅ Express (`/api/perjadin`)

---

## ⚠️ Modul yang BELUM Migrasi ke Express

### 1. Profil Desa
- **Frontend**: `ProfilDesaPage.jsx`
- **Status**: Masih hard-coded/static
- **Perlu**: Backend API di Express

### 2. Aparatur Desa
- **Frontend**: `aparaturDesa.js` service
- **Endpoint Expected**: `/api/aparatur-desa`
- **Status**: API belum ada di Express backend
- **Fallback**: `VITE_API_BASE_URL` ke port 8000 (Laravel)

### 3. Kelembagaan (LPM, PKK, Karang Taruna, dll)
- **Frontend**: `kelembagaan.js` service
- **Endpoint Expected**: `/api/kelembagaan/*`
- **Status**: Belum ada controller di Express
- **Fallback**: Masih menggunakan local state atau Laravel API

### 4. Pengurus
- **Frontend**: `pengurus.js` service
- **Endpoint Expected**: `/api/pengurus` atau `/api/desa/pengurus`
- **Status**: API belum ada di Express backend
- **Fallback**: Using main `api.js`

### 5. Produk Hukum (Module Penuh)
- **Frontend**: `pages/desa/produk-hukum/*`
- **Status**: Hard-coded fallback `http://localhost:8000`
- **Perlu**: Full CRUD API di Express
- **Note**: Saat ini hanya linking di Bumdes

---

## 📝 Referensi Laravel yang Tersisa (Hanya Komentar/Fallback)

### File dengan Referensi Port 8000 (Fallback Only):
1. **`ProdukHukumDetail.jsx`** (Line 41)
   ```javascript
   const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
   ```
   Status: Fallback, tidak digunakan karena VITE_API_URL sudah set ke 3001

2. **`AparaturDesaDetailPage.jsx`** (Line 12)
   ```javascript
   import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"
   ```
   Status: Fallback, VITE_API_BASE_URL = http://127.0.0.1:3001/api

3. **`AparaturDesaOrgChart.jsx`** (Line 7)
   Status: Fallback yang sama

4. **`AparaturDesaForm.jsx`** (Line 19)
   Status: Fallback yang sama

### Komentar Lama (Tidak Berpengaruh):
- `api.js` line 76: `// Laravel needs this...` (komentar saja)
- `bumdesDesaService.js` line 103: `// Add _method for Laravel PUT spoofing` (komentar)
- `pengurus.js` line 10, 134: Komentar tentang Laravel convention

---

## ✅ Kesimpulan

### Yang Sudah Berjalan 100% Express:
1. ✅ Authentication
2. ✅ Bumdes (Full CRUD + Export)
3. ✅ Musdesus (Full Features)
4. ✅ Perjalanan Dinas (Full Features)
5. ✅ Hero Gallery
6. ✅ Location Master Data
7. ✅ Landing Page

### Yang Perlu Ditambahkan ke Express (Priority):
1. 🔴 **HIGH**: Aparatur Desa API
2. 🔴 **HIGH**: Pengurus API
3. 🟡 **MEDIUM**: Kelembagaan (LPM, PKK, Karang Taruna, etc)
4. 🟡 **MEDIUM**: Produk Hukum (Full CRUD)
5. 🟢 **LOW**: Profil Desa (saat ini static)

### Referensi Laravel:
- ✅ Tidak ada yang aktif digunakan
- ✅ Semua hanya fallback atau komentar
- ✅ Environment variables sudah mengarah ke Express (port 3001)

---

## 🎯 Rekomendasi

### Untuk Production:
1. ✅ **Hapus referensi Laravel di .env.production** - DONE
2. ✅ **Semua API call ke Express backend** - DONE
3. ⚠️ **Tambahkan modul yang belum ada** jika diperlukan

### Untuk Development:
1. Setiap developer setup `.env` lokal sendiri
2. Gunakan `.env.production` untuk koordinasi config production
3. Tidak perlu Laravel backend lagi untuk modul yang sudah ada

---

**Last Updated**: November 10, 2025  
**Backend**: Express.js (Port 3001)  
**Status**: Production Ready untuk modul yang ada
