# Kelembagaan Activity Logs - Dokumentasi Lengkap

## 📋 Overview

Sistem pencatatan aktivitas untuk semua jenis kelembagaan di DPMD Kabupaten Bogor:
- **RW** (Rukun Warga)
- **RT** (Rukun Tetangga)
- **Posyandu** (Pos Pelayanan Terpadu)
- **Karang Taruna**
- **LPM** (Lembaga Pemberdayaan Masyarakat)
- **PKK** (Pembinaan Kesejahteraan Keluarga)
- **Satlinmas** (Satuan Perlindungan Masyarakat)

## 🗄️ Database Schema

### Tabel: `kelembagaan_activity_logs`

```sql
CREATE TABLE `kelembagaan_activity_logs` (
    `id` CHAR(36) PRIMARY KEY,
    `kelembagaan_type` VARCHAR(50) NOT NULL,      -- rw, rt, posyandu, dll
    `kelembagaan_id` CHAR(36) NOT NULL,           -- UUID kelembagaan
    `kelembagaan_nama` VARCHAR(255),              -- Nama/Nomor untuk display
    `desa_id` BIGINT UNSIGNED NOT NULL,           -- ID Desa
    `activity_type` VARCHAR(50) NOT NULL,         -- create, update, verify, dll
    `entity_type` VARCHAR(50) NOT NULL,           -- lembaga atau pengurus
    `entity_id` CHAR(36),                         -- UUID pengurus (jika ada)
    `entity_name` VARCHAR(255),                   -- Nama pengurus (jika ada)
    `action_description` TEXT NOT NULL,           -- Deskripsi user-friendly
    `old_value` JSON,                             -- Data lama
    `new_value` JSON,                             -- Data baru
    `user_id` BIGINT UNSIGNED NOT NULL,           -- User yang melakukan
    `user_name` VARCHAR(255),                     -- Nama user
    `user_role` VARCHAR(50),                      -- Role user
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`desa_id`) REFERENCES `desas`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    
    INDEX `idx_kelembagaan_type_id` (`kelembagaan_type`, `kelembagaan_id`),
    INDEX `idx_entity_type` (`entity_type`),
    INDEX `idx_desa_id` (`desa_id`),
    INDEX `idx_activity_type` (`activity_type`),
    INDEX `idx_created_at` (`created_at`),
    INDEX `idx_user_id` (`user_id`)
);
```

## 📊 Activity Types

### Aktivitas Lembaga (`entity_type: 'lembaga'`)
1. **`create`** - Pembuatan lembaga baru
2. **`update`** - Perubahan data lembaga
3. **`toggle_status`** - Aktif/Nonaktif lembaga
4. **`verify`** - Verifikasi admin

### Aktivitas Pengurus (`entity_type: 'pengurus'`)
1. **`add_pengurus`** - Penambahan pengurus baru
2. **`update_pengurus`** - Perubahan data pengurus
3. **`toggle_pengurus_status`** - Aktif/Nonaktif pengurus
4. **`verify_pengurus`** - Verifikasi pengurus oleh admin

## 🔌 API Endpoints

### 1. Get Activity Logs untuk List Page
**Endpoint:** `GET /api/kelembagaan/activity-logs/list`

**Purpose:** Menampilkan log aktivitas di halaman list kelembagaan (khusus RT, RW, Posyandu)

**Query Parameters:**
- `type` (required): Tipe kelembagaan (rw, rt, posyandu, dll)
- `desa_id` (required): ID Desa
- `limit` (optional): Jumlah log (default: 20)

**Response:**
```json
{
  "success": true,
  "message": "Activity logs berhasil diambil",
  "data": {
    "kelembagaan_type": "rw",
    "desa_id": 123,
    "total": 15,
    "logs": [
      {
        "id": "uuid-xxx",
        "kelembagaan_nama": "RW 01",
        "activity_type": "create",
        "action_description": "Membuat RW baru: RW 01",
        "user_name": "Admin Desa",
        "user_role": "desa",
        "created_at": "2024-12-12T10:30:00Z",
        "new_value": { "nomor": "01", "status": "aktif" }
      }
    ]
  }
}
```

**Filter:** Hanya menampilkan aktivitas lembaga (`entity_type: 'lembaga'`)

---

### 2. Get Activity Logs untuk Detail Page
**Endpoint:** `GET /api/kelembagaan/activity-logs/detail/:type/:id`

**Purpose:** Menampilkan semua log aktivitas di halaman detail kelembagaan (termasuk pengurus)

**Path Parameters:**
- `type`: Tipe kelembagaan (rw, rt, posyandu, dll)
- `id`: UUID kelembagaan

**Query Parameters:**
- `limit` (optional): Jumlah log (default: 50)

**Response:**
```json
{
  "success": true,
  "message": "Activity logs berhasil diambil",
  "data": {
    "kelembagaan_type": "rw",
    "kelembagaan_id": "uuid-xxx",
    "total": 25,
    "logs": [
      {
        "id": "uuid-log",
        "kelembagaan_type": "rw",
        "kelembagaan_nama": "RW 01",
        "activity_type": "add_pengurus",
        "entity_type": "pengurus",
        "entity_id": "uuid-pengurus",
        "entity_name": "Budi Santoso",
        "action_description": "Menambah pengurus baru: Budi Santoso sebagai Ketua RW",
        "old_value": null,
        "new_value": {
          "nama_lengkap": "Budi Santoso",
          "jabatan": "Ketua RW",
          "status_jabatan": "aktif"
        },
        "user_name": "Admin Desa",
        "user_role": "desa",
        "created_at": "2024-12-12T10:30:00Z",
        "user": {
          "id": 1,
          "name": "Admin Desa",
          "email": "admin@desa.id",
          "role": "desa"
        }
      }
    ]
  }
}
```

**Filter:** Menampilkan SEMUA aktivitas (lembaga + pengurus)

---

### 3. Get All Activity Logs (Admin/Monitoring)
**Endpoint:** `GET /api/kelembagaan/activity-logs`

**Purpose:** Endpoint fleksibel untuk admin/monitoring dengan filter lengkap

**Query Parameters:**
- `type` (optional): Tipe kelembagaan
- `kelembagaan_id` (optional): UUID kelembagaan tertentu
- `desa_id` (optional): ID Desa
- `entity_type` (optional): Filter by lembaga/pengurus
- `limit` (optional): Jumlah log (default: 50)

## 💻 Cara Penggunaan di Controller

### Example 1: Log Pembuatan RW Baru

```javascript
const { logKelembagaanActivity, ENTITY_TYPES, ACTIVITY_TYPES } = require('../utils/kelembagaanActivityLogger');

// Di controller create RW
const createRW = async (req, res) => {
  try {
    // ... create RW logic ...
    const newRW = await prisma.rws.create({ data: rwData });
    
    // Log activity
    await logKelembagaanActivity({
      kelembagaanType: 'rw',
      kelembagaanId: newRW.id,
      kelembagaanNama: `RW ${newRW.nomor}`,
      desaId: newRW.desa_id,
      activityType: ACTIVITY_TYPES.CREATE,
      entityType: ENTITY_TYPES.LEMBAGA,
      oldValue: null,
      newValue: newRW,
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role
    });
    
    return res.status(201).json({ success: true, data: newRW });
  } catch (error) {
    // ...
  }
};
```

### Example 2: Log Penambahan Pengurus

```javascript
// Di controller create pengurus
const addPengurus = async (req, res) => {
  try {
    // ... create pengurus logic ...
    const newPengurus = await prisma.pengurus.create({ data: pengurusData });
    
    // Get kelembagaan data untuk nama
    const kelembagaan = await prisma.rws.findUnique({ 
      where: { id: newPengurus.pengurusable_id } 
    });
    
    // Log activity
    await logKelembagaanActivity({
      kelembagaanType: 'rw',
      kelembagaanId: newPengurus.pengurusable_id,
      kelembagaanNama: `RW ${kelembagaan.nomor}`,
      desaId: newPengurus.desa_id,
      activityType: ACTIVITY_TYPES.ADD_PENGURUS,
      entityType: ENTITY_TYPES.PENGURUS,
      entityId: newPengurus.id,
      entityName: newPengurus.nama_lengkap,
      oldValue: null,
      newValue: newPengurus,
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role
    });
    
    return res.status(201).json({ success: true, data: newPengurus });
  } catch (error) {
    // ...
  }
};
```

### Example 3: Log Update Status

```javascript
// Di controller toggle status
const toggleRWStatus = async (req, res) => {
  try {
    const rw = await prisma.rws.findUnique({ where: { id: req.params.id } });
    const oldValue = { ...rw };
    
    const updatedRW = await prisma.rws.update({
      where: { id: req.params.id },
      data: { status_kelembagaan: newStatus }
    });
    
    // Log activity
    await logKelembagaanActivity({
      kelembagaanType: 'rw',
      kelembagaanId: updatedRW.id,
      kelembagaanNama: `RW ${updatedRW.nomor}`,
      desaId: updatedRW.desa_id,
      activityType: ACTIVITY_TYPES.TOGGLE_STATUS,
      entityType: ENTITY_TYPES.LEMBAGA,
      oldValue: oldValue,
      newValue: updatedRW,
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role
    });
    
    return res.status(200).json({ success: true, data: updatedRW });
  } catch (error) {
    // ...
  }
};
```

### Example 4: Log Verifikasi Admin

```javascript
// Di controller verify
const verifyRW = async (req, res) => {
  try {
    const rw = await prisma.rws.findUnique({ where: { id: req.params.id } });
    const oldValue = { ...rw };
    
    const verifiedRW = await prisma.rws.update({
      where: { id: req.params.id },
      data: { status_verifikasi: 'verified' }
    });
    
    // Log activity
    await logKelembagaanActivity({
      kelembagaanType: 'rw',
      kelembagaanId: verifiedRW.id,
      kelembagaanNama: `RW ${verifiedRW.nomor}`,
      desaId: verifiedRW.desa_id,
      activityType: ACTIVITY_TYPES.VERIFY,
      entityType: ENTITY_TYPES.LEMBAGA,
      oldValue: oldValue,
      newValue: verifiedRW,
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role
    });
    
    return res.status(200).json({ success: true, data: verifiedRW });
  } catch (error) {
    // ...
  }
};
```

## 🎨 Frontend Integration

### Tampilan di List Page (Tab Activity Logs)

```jsx
// Khusus untuk RW, RT, Posyandu
import { useState, useEffect } from 'react';
import api from '../api';

function KelembagaanListPage({ type, desaId }) {
  const [activityLogs, setActivityLogs] = useState([]);
  
  useEffect(() => {
    fetchActivityLogs();
  }, [type, desaId]);
  
  const fetchActivityLogs = async () => {
    try {
      const response = await api.get('/kelembagaan/activity-logs/list', {
        params: { type, desa_id: desaId, limit: 20 }
      });
      setActivityLogs(response.data.data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };
  
  return (
    <div className="activity-logs-tab">
      <h3>Riwayat Aktivitas</h3>
      {activityLogs.map(log => (
        <div key={log.id} className="log-item">
          <div className="log-description">{log.action_description}</div>
          <div className="log-meta">
            <span>{log.user_name} ({log.user_role})</span>
            <span>{new Date(log.created_at).toLocaleString('id-ID')}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Tampilan di Detail Page (Card Activity Logs)

```jsx
// Untuk semua kelembagaan
function KelembagaanDetailPage({ type, id }) {
  const [activityLogs, setActivityLogs] = useState([]);
  
  useEffect(() => {
    fetchActivityLogs();
  }, [type, id]);
  
  const fetchActivityLogs = async () => {
    try {
      const response = await api.get(`/kelembagaan/activity-logs/detail/${type}/${id}`, {
        params: { limit: 50 }
      });
      setActivityLogs(response.data.data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };
  
  return (
    <div className="activity-logs-card">
      <h3>Timeline Aktivitas</h3>
      {activityLogs.map(log => (
        <div key={log.id} className={`log-item ${log.entity_type}`}>
          <div className="log-icon">
            {log.entity_type === 'lembaga' ? '🏢' : '👤'}
          </div>
          <div className="log-content">
            <div className="log-description">{log.action_description}</div>
            {log.entity_name && (
              <div className="log-entity">Pengurus: {log.entity_name}</div>
            )}
            <div className="log-meta">
              <span>{log.user_name}</span>
              <span>{new Date(log.created_at).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## 🔍 Query Examples

### Get logs RW di Desa X
```
GET /api/kelembagaan/activity-logs/list?type=rw&desa_id=123
```

### Get all logs untuk RW tertentu (termasuk pengurus)
```
GET /api/kelembagaan/activity-logs/detail/rw/uuid-rw-xxx
```

### Get logs verifikasi admin saja
```
GET /api/kelembagaan/activity-logs?activity_type=verify&desa_id=123
```

### Get logs pengurus saja
```
GET /api/kelembagaan/activity-logs?entity_type=pengurus&desa_id=123
```

## ✅ Features

1. ✅ **Auto-generate deskripsi user-friendly** - Tidak perlu manual tulis deskripsi
2. ✅ **Track old/new values** - Bisa lihat perubahan data
3. ✅ **User context** - Tahu siapa yang melakukan aksi
4. ✅ **Flexible filtering** - Filter by type, desa, entity, dll
5. ✅ **Separate list/detail logs** - List page hanya lembaga, detail page semua
6. ✅ **Non-blocking** - Jika log gagal, operasi utama tetap jalan
7. ✅ **Indexed queries** - Cepat meskipun banyak data

## 📝 Notes

- Log tidak bisa diedit atau dihapus (audit trail)
- Log otomatis cascade delete jika desa/user dihapus
- Gunakan UUID untuk kelembagaan_id dan entity_id (pengurus)
- `entity_type` = 'lembaga' untuk aktivitas lembaga
- `entity_type` = 'pengurus' untuk aktivitas pengurus
- List page hanya tampilkan logs `entity_type='lembaga'`
- Detail page tampilkan semua logs (lembaga + pengurus)

## 🚀 Next Steps

1. Integrate logger ke semua controllers kelembagaan (RW, RT, Posyandu, dll)
2. Integrate logger ke pengurus controllers
3. Buat UI components di frontend untuk tampilkan logs
4. Testing dengan berbagai skenario
5. (Optional) Add export logs feature untuk admin

---

**Created by:** DPMD Bogor Development Team  
**Date:** December 12, 2024  
**Version:** 1.0.0
