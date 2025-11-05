# API Reference - DPMD Express Backend

Complete API documentation for Bumdes, Musdesus, and Perjalanan Dinas modules.

---

## 🔐 Authentication

All endpoints (except health check) require JWT authentication.

### Headers Required

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

### Get Token (via Laravel)

```bash
POST http://localhost:8000/api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "role": "desa",
    "desa_id": 45
  }
}
```

---

## 📦 BUMDES Module

Base URL: `http://localhost:3001/api`

### 1. Get Desa BUMDES

Get BUMDES data for logged in desa user.

```http
GET /desa/bumdes
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "namabumdesa": "BUMDes Sejahtera",
    "TahunPendirian": 2020,
    "desa": "Desa Cibinong",
    "kecamatan": "Kecamatan Bogor Tengah",
    "LaporanKeuangan2021": "1698765432_laporan_2021.pdf",
    "ProfilBUMDesa": "1698765433_profil.pdf",
    // ... other fields
  }
}
```

---

### 2. Create/Update BUMDES (Step 1 - Data Only)

Save BUMDES data without files.

```http
POST /desa/bumdes
Authorization: Bearer <token>
Content-Type: application/json

{
  "namabumdesa": "BUMDes Sejahtera",
  "TahunPendirian": 2020,
  "Alamat": "Jl. Raya Desa No. 123",
  "NoTelp": "08123456789",
  "Email": "bumdes@example.com",
  "KategoriUsaha": "Perdagangan",
  "JumlahUnit": 3,
  "ModalAwal": 100000000,
  "NamaKetuaPengelola": "Budi Santoso",
  "NoTelpKetuaPengelola": "08123456789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "BUMDES berhasil disimpan",
  "data": {
    "id": 1,
    "namabumdesa": "BUMDes Sejahtera",
    // ... all fields
  }
}
```

---

### 3. Upload File (Step 2 - File Upload)

Upload single file for specific field.

```http
POST /desa/bumdes/upload-file
Authorization: Bearer <token>
Content-Type: multipart/form-data

bumdes_id: 1
field_name: LaporanKeuangan2021
file: [binary file data]
```

**Field Names Available:**
- **Laporan Keuangan**: `LaporanKeuangan2021`, `LaporanKeuangan2022`, `LaporanKeuangan2023`, `LaporanKeuangan2024`
- **Dokumen**: `ProfilBUMDesa`, `BeritaAcara`, `AnggaranDasar`, `AnggaranRumahTangga`, `ProgramKerja`, `Perdes`, `SK_BUM_Desa`

**Response:**
```json
{
  "success": true,
  "message": "File berhasil diupload",
  "data": {
    "field_name": "LaporanKeuangan2021",
    "filename": "1698765432_laporan_2021.pdf",
    "path": "storage/uploads/bumdes_laporan_keuangan/1698765432_laporan_2021.pdf",
    "size": 245678
  }
}
```

---

### 4. Update BUMDES

Update existing BUMDES data.

```http
PUT /desa/bumdes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "namabumdesa": "BUMDes Sejahtera Jaya",
  "JumlahUnit": 5,
  "Email": "newemail@example.com"
}
```

---

### 5. Delete BUMDES

Delete BUMDES and all associated files.

```http
DELETE /desa/bumdes/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "BUMDES berhasil dihapus"
}
```

---

### 6. Get All BUMDES (Admin)

Get all BUMDES data from all desa.

```http
GET /bumdes/all?page=1&limit=10&status=approved&search=sejahtera
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status
- `search` (optional): Search by name

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "namabumdesa": "BUMDes Sejahtera",
      "desa": "Desa Cibinong",
      // ...
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "total_pages": 5
  }
}
```

---

### 7. Get BUMDES Statistics (Admin)

```http
GET /bumdes/statistics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_bumdes": 50,
    "total_with_files": 45,
    "total_desa": 40,
    "by_kecamatan": [
      { "kecamatan": "Bogor Tengah", "count": 15 },
      { "kecamatan": "Bogor Utara", "count": 20 }
    ]
  }
}
```

---

## 📄 MUSDESUS Module

Base URL: `http://localhost:3001/api/musdesus`

### 1. Get Desa Musdesus Files

Get all musdesus files for logged in desa.

```http
GET /desa
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nama_file": "1698765432_musdesus_2024.pdf",
      "nama_file_asli": "musdesus_2024.pdf",
      "ukuran_file": 1245678,
      "nama_pengupload": "Budi Santoso",
      "status": "pending",
      "tanggal_musdesus": "2024-10-15",
      "file_url": "http://localhost:3001/api/uploads/musdesus/1698765432_musdesus_2024.pdf",
      "created_at": "2024-10-20T10:30:00.000Z"
    }
  ]
}
```

---

### 2. Upload Musdesus File

Upload new musdesus file.

```http
POST /desa
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: [binary file data]
nama_pengupload: Budi Santoso
email_pengupload: budi@example.com
telepon_pengupload: 08123456789
keterangan: Musdesus tentang APBDes 2024
tanggal_musdesus: 2024-10-15
```

**Response:**
```json
{
  "success": true,
  "message": "File berhasil diupload",
  "data": {
    "id": 1,
    "nama_file": "1698765432_musdesus_2024.pdf",
    "status": "pending",
    "file_url": "http://localhost:3001/api/uploads/musdesus/1698765432_musdesus_2024.pdf"
  }
}
```

---

### 3. Delete Musdesus File

```http
DELETE /desa/:id
Authorization: Bearer <token>
```

---

### 4. Get All Musdesus Files (Admin)

```http
GET /all?page=1&limit=10&status=approved&kecamatan_id=5&desa_id=45
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status (pending/approved/rejected)
- `kecamatan_id`: Filter by kecamatan
- `desa_id`: Filter by desa
- `search`: Search in name/keterangan

---

### 5. Update Musdesus Status (Admin)

Approve or reject musdesus file.

```http
PUT /:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved",
  "catatan_admin": "Dokumen lengkap dan sesuai"
}
```

**Status Options:**
- `pending`
- `approved`
- `rejected`

---

### 6. Get Musdesus Statistics (Admin)

```http
GET /statistics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_files": 150,
    "total_size": 524288000,
    "total_size_mb": "500.00",
    "total_desa": 45,
    "total_kecamatan": 12,
    "status_breakdown": {
      "pending": 20,
      "approved": 120,
      "rejected": 10
    }
  }
}
```

---

### 7. Check Desa Upload Status (Admin)

Check if a desa has already uploaded files.

```http
GET /check-upload/:desa_id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "already_uploaded": true,
  "message": "Desa sudah pernah melakukan upload sebelumnya",
  "upload_info": {
    "upload_date": "2024-10-20T10:30:00.000Z",
    "uploader_name": "Budi Santoso",
    "files_count": 3
  }
}
```

---

## 🚗 PERJALANAN DINAS Module

Base URL: `http://localhost:3001/api/perjadin`

### 1. Get Dashboard Statistics

```http
GET /dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_kegiatan": 150,
    "kegiatan_bulan_ini": 25,
    "kegiatan_berlangsung": 5,
    "kegiatan_mendatang": 30
  }
}
```

---

### 2. Get Weekly Schedule

```http
GET /dashboard/weekly-schedule
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_kegiatan": 1,
      "nama_kegiatan": "Rapat Koordinasi Bidang",
      "nomor_sp": "SP/001/2024",
      "tanggal_mulai": "2024-11-04",
      "tanggal_selesai": "2024-11-04",
      "lokasi": "Kantor DPMD",
      "keterangan": "Rapat rutin bulanan"
    }
  ],
  "period": {
    "start": "2024-11-03T00:00:00.000Z",
    "end": "2024-11-09T23:59:59.999Z"
  }
}
```

---

### 3. Get All Kegiatan

```http
GET /kegiatan?page=1&limit=10&search=rapat&date_filter=bulanan
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `search`: Search in nama_kegiatan, nomor_sp, lokasi
- `date_filter`: `mingguan` or `bulanan`
- `id_bidang`: Filter by bidang ID

---

### 4. Get Kegiatan Detail

```http
GET /kegiatan/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id_kegiatan": 1,
    "nama_kegiatan": "Rapat Koordinasi Bidang",
    "nomor_sp": "SP/001/2024",
    "tanggal_mulai": "2024-11-04",
    "tanggal_selesai": "2024-11-04",
    "lokasi": "Kantor DPMD",
    "keterangan": "Rapat rutin bulanan",
    "created_at": "2024-10-20T10:30:00.000Z"
  }
}
```

---

### 5. Create Kegiatan

```http
POST /kegiatan
Authorization: Bearer <token>
Content-Type: application/json

{
  "nama_kegiatan": "Rapat Koordinasi Bidang",
  "nomor_sp": "SP/001/2024",
  "tanggal_mulai": "2024-11-04",
  "tanggal_selesai": "2024-11-04",
  "lokasi": "Kantor DPMD",
  "keterangan": "Rapat rutin bulanan"
}
```

**Validation:**
- All fields required except `keterangan`
- `tanggal_selesai` must be >= `tanggal_mulai`

---

### 6. Update Kegiatan

```http
PUT /kegiatan/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "nama_kegiatan": "Rapat Koordinasi Bidang (Updated)",
  "lokasi": "Ruang Rapat Utama"
}
```

---

### 7. Delete Kegiatan

```http
DELETE /kegiatan/:id
Authorization: Bearer <token>
```

---

## 🔒 Role-Based Access

### Bumdes Module

| Endpoint | Desa | Admin | Sarpras | Superadmin |
|----------|------|-------|---------|------------|
| GET /desa/bumdes | ✓ | - | - | - |
| POST /desa/bumdes | ✓ | - | - | - |
| POST /desa/bumdes/upload-file | ✓ | - | - | - |
| PUT /desa/bumdes/:id | ✓ | - | - | - |
| DELETE /desa/bumdes/:id | ✓ | - | - | - |
| GET /bumdes/all | - | ✓ | ✓ | ✓ |
| GET /bumdes/statistics | - | ✓ | ✓ | ✓ |

### Musdesus Module

| Endpoint | Desa | Admin | Sarpras | Superadmin |
|----------|------|-------|---------|------------|
| GET /musdesus/desa | ✓ | - | - | - |
| POST /musdesus/desa | ✓ | - | - | - |
| DELETE /musdesus/desa/:id | ✓ | - | - | - |
| GET /musdesus/all | - | ✓ | ✓ | ✓ |
| PUT /musdesus/:id/status | - | ✓ | ✓ | ✓ |
| GET /musdesus/statistics | - | ✓ | ✓ | ✓ |

### Perjalanan Dinas Module

All endpoints require one of:
- `superadmin`
- `sekretariat`
- `sarana_prasarana`
- `kekayaan_keuangan`
- `pemberdayaan_masyarakat`
- `pemerintahan_desa`
- `admin`

---

## ⚠️ Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "namabumdesa": "Field is required"
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Token not provided"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Akses ditolak. Role tidak sesuai."
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Data tidak ditemukan"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error message here"
}
```

---

## 📝 File Upload Specifications

### Allowed File Types
- PDF (`.pdf`)
- Word (`.doc`, `.docx`)
- Excel (`.xls`, `.xlsx`)

### File Size Limit
- Maximum: **5MB** per file

### File Naming Convention
- Format: `{timestamp}_{original_filename}.{ext}`
- Example: `1698765432_laporan_2021.pdf`

### Storage Folders
- **Bumdes Laporan**: `storage/uploads/bumdes_laporan_keuangan/`
- **Bumdes Dokumen**: `storage/uploads/bumdes_dokumen_badanhukum/`
- **Musdesus**: `storage/uploads/musdesus/`
- **Perjalanan Dinas**: `storage/uploads/perjalanan_dinas/`

---

## 🧪 Testing with cURL

### Example: Create BUMDES + Upload File

**Step 1: Create BUMDES**
```bash
curl -X POST http://localhost:3001/api/desa/bumdes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "namabumdesa": "BUMDes Test",
    "TahunPendirian": 2020,
    "Alamat": "Jl. Test",
    "NoTelp": "08123456789"
  }'
```

**Step 2: Upload File**
```bash
curl -X POST http://localhost:3001/api/desa/bumdes/upload-file \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.pdf" \
  -F "bumdes_id=1" \
  -F "field_name=LaporanKeuangan2021"
```

---

**END OF API REFERENCE**
