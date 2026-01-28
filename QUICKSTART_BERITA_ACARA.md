# Quick Start - Berita Acara Verifikasi

## 🚀 Setup Cepat (5 Menit)

### Step 1: Buat Tabel Database
1. Buka **HeidiSQL** atau **phpMyAdmin**
2. Pilih database **dpmd**
3. Buka file `SETUP_KECAMATAN_CONFIG.sql`
4. Copy semua query
5. Paste dan **Execute**

### Step 2: Insert Data Kecamatan Anda
Jalankan query ini (sesuaikan dengan data kecamatan Anda):

```sql
-- Cek daftar kecamatan
SELECT id, nama FROM kecamatans;

-- Insert config (ganti ID, nama, dll sesuai kebutuhan)
INSERT INTO kecamatan_config 
(kecamatan_id, nama_kecamatan, nama_camat, nip_camat, alamat) 
VALUES 
(1, 'CIOMAS', 'Drs. H. NAMA CAMAT, M.Si', '196501011990031001', 'Jl. Raya Ciomas No. 123, Kabupaten Bogor');

-- Insert tim verifikasi (5 orang)
INSERT INTO tim_verifikasi_kecamatan 
(kecamatan_id, jabatan, nama, nip, urutan) 
VALUES
(1, 'ketua', 'Nama Ketua Tim', '196501011990031001', 1),
(1, 'sekretaris', 'Nama Sekretaris', '197001011995031001', 2),
(1, 'anggota', 'Nama Anggota 1', '197501012000031001', 3),
(1, 'anggota', 'Nama Anggota 2', '198001012005031001', 4),
(1, 'anggota', 'Nama Anggota 3', '198501012010031001', 5);
```

**Catatan**: `kecamatan_id = 1` adalah contoh. Sesuaikan dengan ID kecamatan di database Anda!

### Step 3: Restart Backend
```bash
cd dpmd-fahri-express
npm run dev
```

### Step 4: Test di Frontend
1. Login sebagai user **kecamatan**
2. Buka menu **Bankeu → Verifikasi Proposal**
3. Pilih salah satu desa
4. Scroll ke bawah
5. Klik tombol **"Download Berita Acara"**
6. Klik **"Ya, Generate!"**
7. PDF akan ter-download otomatis

## ✅ Hasil yang Diharapkan

PDF 2 halaman dengan format:
- **Halaman 1**: Kop surat + checklist verifikasi 13 item
- **Halaman 2**: Tanda tangan tim verifikasi (5 orang) + camat

## 📖 Dokumentasi Lengkap

Baca file lengkap di:
- `docs/BERITA_ACARA_VERIFIKASI.md` - Dokumentasi lengkap
- `IMPLEMENTATION_SUMMARY.md` - Summary implementasi

## ⚠️ Troubleshooting

**Error: "Table kecamatan_config doesn't exist"**
→ Jalankan Step 1 lagi

**Error: "User tidak terkait dengan kecamatan"**
→ Pastikan user yang login punya `kecamatan_id` di tabel `users`

**PDF kosong atau error**
→ Check folder `storage/uploads/` sudah ada dan writable

**Nama tim tidak muncul di PDF**
→ Pastikan sudah insert data di Step 2 dengan `kecamatan_id` yang benar

---

**Need Help?** Check logs di `logs/combined.log` atau console browser (F12)
