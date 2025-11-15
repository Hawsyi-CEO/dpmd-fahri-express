# CATATAN UNTUK ANGGA - Perubahan Schema Prisma

## 📋 Ringkasan
Schema Prisma telah di-update untuk match dengan struktur database actual yang sudah ada di production. Ada beberapa perbedaan field names antara schema Prisma Angga dengan database actual.

## ⚠️ Breaking Changes

### 1. **Model `desas`**
**Schema Angga (SALAH):**
```prisma
model desas {
  id_desa      Int    @id @default(autoincrement())
  id_kecamatan Int
  kode_desa    String
  nama_desa    String
  // ...
}
```

**Schema Actual (BENAR):**
```prisma
model desas {
  id           BigInt @id @default(autoincrement())
  kecamatan_id BigInt
  kode         String
  nama         String
  // ...
}
```

### 2. **Model `kecamatans`**
**Schema Angga (SALAH):**
```prisma
model kecamatans {
  id_kecamatan Int    @id
  nama_kecamatan String
  // ...
}
```

**Schema Actual (BENAR):**
```prisma
model kecamatans {
  id   BigInt @id
  nama String
  // ...
}
```

### 3. **Model `bumdes`**
**Schema Angga (SALAH):**
```prisma
model bumdes {
  id      Int  @id
  id_desa Int?
  nama_bumdes String
  // ...
}
```

**Schema Actual (BENAR):**
```prisma
model bumdes {
  id          Int     @id
  desa_id     Int?    // ⚠️ BUKAN id_desa!
  namabumdesa String  // ⚠️ BUKAN nama_bumdes!
  // ... field lain dengan PascalCase (TahunPendirian, NamaDirektur, dll)
}
```

### 4. **Foreign Keys ke `desas`**
**Semua model kelembagaan (rws, rts, posyandus, dll) menggunakan:**
- Foreign key field: `desa_id` ✅
- Reference ke: `desas.id` ✅ (BUKAN `desas.id_desa`)

## 🔧 Yang Perlu Diperbaiki di Code Angga

### File: `src/controllers/kelembagaan.controller.js`

**Ubah dari:**
```javascript
const kecamatans = await prisma.kecamatans.findMany({
  include: {
    desas: {
      select: { 
        id_desa: true,      // ❌ SALAH
        nama_desa: true,    // ❌ SALAH
        kode_desa: true,    // ❌ SALAH
      }
    }
  },
  orderBy: { id_kecamatan: 'asc' }  // ❌ SALAH
});

const allDesaIds = kecamatans.flatMap(k => k.desas.map(d => d.id_desa)); // ❌ SALAH
```

**Menjadi:**
```javascript
const kecamatans = await prisma.kecamatans.findMany({
  include: {
    desas: {
      select: { 
        id: true,      // ✅ BENAR
        nama: true,    // ✅ BENAR
        kode: true,    // ✅ BENAR
      }
    }
  },
  orderBy: { id: 'asc' }  // ✅ BENAR
});

const allDesaIds = kecamatans.flatMap(k => k.desas.map(d => d.id)); // ✅ BENAR
```

## 📊 Database Structure Summary

| Table      | Primary Key | Desa FK    | Kecamatan FK  |
|------------|-------------|------------|---------------|
| desas      | `id`        | -          | `kecamatan_id`|
| kecamatans | `id`        | -          | -             |
| bumdes     | `id`        | `desa_id`  | -             |
| rws        | `id`        | `desa_id`  | -             |
| rts        | `id`        | `desa_id`  | -             |
| posyandus  | `id`        | `desa_id`  | -             |
| karang_tarunas | `id`    | `desa_id`  | -             |
| lpms       | `id`        | `desa_id`  | -             |
| satlinmas  | `id`        | `desa_id`  | -             |
| pkks       | `id`        | `desa_id`  | -             |
| pengurus   | `id`        | `desa_id`  | -             |
| produk_hukums | `id`     | `desa_id`  | -             |

## ✅ File yang Sudah Benar (Tidak Perlu Diubah)

1. **src/controllers/auth.controller.js** ✅
   - Sudah menggunakan `desa_id` dan `kecamatan_id`

2. **src/controllers/produkHukum.controller.js** ✅  
   - Sudah menggunakan `user.desa_id`

3. **src/routes/desa.kelembagaan.routes.js** ✅
   - Route definitions OK

## 🎯 Action Items

- [ ] Update `src/controllers/kelembagaan.controller.js`:
  - Ganti `id_desa` → `id`
  - Ganti `nama_desa` → `nama`  
  - Ganti `kode_desa` → `kode`
  - Ganti `id_kecamatan` → `id`
  - Ganti `nama_kecamatan` → `nama`

- [ ] Test semua endpoint kelembagaan setelah perubahan:
  - GET `/api/kelembagaan`
  - GET `/api/kelembagaan/summary`
  - GET `/api/desa/kelembagaan/*`

## 📝 Notes

- Schema Prisma sekarang di-generate langsung dari database menggunakan `npx prisma db pull`
- Ini memastikan 100% match dengan struktur database actual
- **File bumdes** masih menggunakan Sequelize karena ada field name mismatch yang kompleks (namabumdesa, TahunPendirian, NamaDirektur, dll)
- **Frontend** kemungkinan besar sudah pakai field names dari database actual, jadi tidak perlu diubah

## 🔗 References

- Database: MySQL `dpmd` di `127.0.0.1:3306`
- Prisma Schema: `prisma/schema.prisma` (sudah updated)
- Backup schema Angga: `prisma/schema.prisma.angga.backup`

---
**Generated**: 15 November 2025  
**Status**: ⚠️ Perlu action dari Angga untuk update controller
