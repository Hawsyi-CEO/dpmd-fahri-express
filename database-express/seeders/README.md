# Database Seeders

Folder ini berisi file seeder untuk mengisi data awal database.

## Daftar Seeders

### JavaScript Seeders (Format Standard - Dijalankan oleh npm run db:seed)

1. **bidangs_seeder.js** (~2 KB)
   - 8 bidang utama DPMD
   - Termasuk: Sekretariat, Sarana Prasarana, Kekayaan & Keuangan, Pemberdayaan Masyarakat, Pemerintahan Desa, dll

2. **desas_seeder.js** (~117 KB)
   - 435 data desa lengkap dengan foreign key ke kecamatans

3. **kecamatans_seeder.js** (~7 KB)
   - 40 kecamatan di Kabupaten Bogor

4. **personil_seeder.js** (~15 KB)
   - 98 data personil/pegawai
   - Foreign key ke bidangs
   - Semua data embedded di file JS

5. **users_seeder.js** (~48 KB)
   - 492 user accounts dengan berbagai role
   - Foreign keys ke desas, kecamatans, bidangs, dinas

### SQL Seeders (Manual Import - Untuk data besar)

6. **bumdes.sql** (~800 KB)
   - 188 data BUMDes dari seluruh desa
   - Data lengkap 75 kolom termasuk pengurus, keuangan, dokumen, dll
   - **Manual import:** `mysql -u root dpmd < seeders/bumdes.sql`

## Cara Menggunakan

### 1. JavaScript Seeders (Otomatis via npm)

Jalankan semua JS seeders sekaligus:

```bash
cd dpmd-express-backend
npm run db:seed
```

Atau jalankan manual satu per satu:

```bash
node database-express/seeders/kecamatans_seeder.js
node database-express/seeders/desas_seeder.js
node database-express/seeders/bidangs_seeder.js
node database-express/seeders/personil_seeder.js
node database-express/seeders/users_seeder.js
```

### 2. SQL Seeders (Manual Import)

Untuk data besar seperti BUMDes, import manual via mysql:

```bash
# Dari PowerShell/CMD
mysql -u root dpmd < database-express/seeders/bumdes.sql

# Atau dari MySQL CLI
USE dpmd;
SOURCE C:/laragon/www/dpmd/dpmd-express-backend/database-express/seeders/bumdes.sql;
```

## Urutan Import untuk Fresh Database

**PENTING**: Ikuti urutan ini untuk menghindari foreign key constraint errors:

```bash
cd dpmd-express-backend

# 1. Run migrations first
# (Jalankan semua migration files sesuai urutan di MIGRATIONS_SUMMARY.md)

# 2. Run JavaScript seeders (otomatis dengan urutan yang benar)
npm run db:seed

# Output akan seperti:
# 🌱 Running seeders...
# 📝 Running: bidangs_seeder.js
# 📝 Running: desas_seeder.js  
# 📝 Running: kecamatans_seeder.js
# 📝 Running: personil_seeder.js
# 📝 Running: users_seeder.js
# ✨ All seeders completed successfully!

# 3. Import BUMDes data (manual karena file besar)
mysql -u root dpmd < database-express/seeders/bumdes.sql
```

## Notes

- **JavaScript seeders** (.js) dijalankan otomatis dengan `npm run db:seed`
- **SQL seeders** (.sql) diimport manual karena ukuran file terlalu besar untuk embed di JS
- File JS seeders menggunakan module.exports dengan function `up()` dan `down()`
- Setiap seeder otomatis cek apakah data sudah ada (skip jika sudah ada)
- **personil_seeder.js** berisi 98 records embedded langsung di file (tidak pakai external file)
- **bumdes.sql** berisi 188 records dengan 75 kolom (terlalu besar untuk JS)
- Semua seeder di-export dari database production yang sudah terverifikasi

## Data Summary

- **Kecamatans**: 40 records
- **Desas**: 435 records
- **Bidangs**: 8 records
- **Personil**: 98 records (embedded in JS)
- **Users**: 492 records
- **BUMDes**: 188 records (SQL file ~800KB)

Total: ~1.5 MB data seeder

