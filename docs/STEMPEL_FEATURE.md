# Fitur Upload Stempel Transparan

## Deskripsi
Fitur ini memungkinkan kecamatan untuk mengupload stempel dalam format PNG transparan yang akan ditampilkan di berita acara verifikasi proposal Bankeu.

## Format File
- **Format**: PNG (Portable Network Graphics)
- **Transparansi**: Harus transparan (tidak ada background putih/warna lain)
- **Ukuran File**: Maksimal 2MB
- **Rekomendasi**: 
  - Resolusi minimal: 500x500 px
  - Bentuk: Bulat/square dengan background transparan
  - Warna: Sesuai kebutuhan (biasanya biru/merah untuk stempel resmi)

## Endpoint API

### Upload Stempel
```
POST /api/kecamatan/bankeu/config/:kecamatanId/upload-stempel
```
**Headers**: 
- Authorization: Bearer token
- Content-Type: multipart/form-data

**Body**:
- file: PNG file

**Response**:
```json
{
  "success": true,
  "message": "Stempel berhasil diupload",
  "data": {
    "id": 1,
    "kecamatan_id": 1,
    "stempel_path": "signatures/sig-123456.png",
    ...
  }
}
```

### Delete Stempel
```
DELETE /api/kecamatan/bankeu/config/:kecamatanId/delete-stempel
```
**Headers**: 
- Authorization: Bearer token

**Response**:
```json
{
  "success": true,
  "message": "Stempel berhasil dihapus"
}
```

## Implementasi Frontend

### Upload Stempel
1. Navigasi ke **Konfigurasi Kecamatan** > **Penandatanganan**
2. Klik tombol **"Upload Stempel (PNG)"**
3. Pilih file PNG transparan
4. Sistem akan validasi format file (harus PNG)
5. Stempel akan tersimpan dan ditampilkan di preview

### Hapus Stempel
1. Klik tombol **"Hapus"** pada stempel yang sudah diupload
2. Konfirmasi penghapusan
3. Stempel akan dihapus dari sistem

## Tampilan di Berita Acara

Stempel akan ditampilkan di halaman 2 berita acara:
- **Posisi**: Di atas tanda tangan camat (overlay)
- **Ukuran**: 70x70 px
- **Alignment**: Center, di tengah bagian tanda tangan camat

## Struktur Database

```sql
ALTER TABLE kecamatan_bankeu_config 
ADD COLUMN stempel_path VARCHAR(255) DEFAULT NULL 
COMMENT 'Path to kecamatan stamp image';
```

## File yang Dimodifikasi

### Backend
1. `src/controllers/bankeuVerification.controller.js`
   - Method: `uploadStempel()`
   - Method: `deleteStempel()`

2. `src/routes/bankeuVerification.routes.js`
   - Route: POST `/config/:kecamatanId/upload-stempel`
   - Route: DELETE `/config/:kecamatanId/delete-stempel`

3. `src/services/beritaAcaraService.js`
   - Update rendering stempel di PDF (overlay di atas tanda tangan)

### Frontend
1. `src/components/kecamatan/KecamatanBankeuConfigTab.jsx`
   - Handler: `handleUploadStempel()`
   - Handler: `handleDeleteStempel()`
   - UI untuk upload/preview/delete stempel

## Catatan Penting

1. **Format PNG Wajib**: Sistem hanya menerima format PNG karena mendukung transparansi
2. **Validasi Frontend**: File selain PNG akan ditolak dengan pesan error
3. **Validasi Backend**: Server juga melakukan validasi ulang format file
4. **Overlay**: Stempel ditampilkan di atas tanda tangan dengan transparansi utuh
5. **Storage**: File disimpan di `storage/uploads/signatures/`

## Testing

1. Upload stempel PNG transparan
2. Cek preview stempel di konfigurasi
3. Generate berita acara untuk melihat stempel di PDF
4. Verifikasi transparansi stempel terlihat dengan baik
5. Test hapus dan upload ulang stempel

## Created
- Date: 28 Januari 2026
- Author: AI Assistant
