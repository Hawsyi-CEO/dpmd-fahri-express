# Project Structure

```
dpmd-express-backend/
│
├── src/
│   ├── config/
│   │   └── database.js              # Sequelize MySQL configuration
│   │
│   ├── controllers/
│   │   ├── bumdes.controller.js     # BUMDES business logic (8 methods)
│   │   ├── musdesus.controller.js   # Musdesus business logic (7 methods)
│   │   └── perjalananDinas.controller.js  # Perjalanan Dinas logic (7 methods)
│   │
│   ├── middlewares/
│   │   ├── auth.js                  # JWT authentication + role checking
│   │   ├── errorHandler.js          # Global error handler
│   │   └── upload.js                # Multer file upload (3 configs)
│   │
│   ├── models/
│   │   ├── Bumdes.js                # Sequelize model (50+ fields)
│   │   ├── Musdesus.js              # Sequelize model (16 fields)
│   │   └── PerjalananDinas.js       # Sequelize model (7 fields)
│   │
│   ├── routes/
│   │   ├── auth.routes.js           # Auth routes (placeholder)
│   │   ├── bumdes.routes.js         # BUMDES REST API
│   │   ├── musdesus.routes.js       # Musdesus REST API
│   │   └── perjalananDinas.routes.js # Perjalanan Dinas REST API
│   │
│   ├── utils/
│   │   └── logger.js                # Winston logger setup
│   │
│   └── server.js                    # Main Express application
│
├── storage/
│   └── uploads/
│       ├── bumdes_laporan_keuangan/      # BUMDES financial reports
│       ├── bumdes_dokumen_badanhukum/    # BUMDES legal documents
│       ├── musdesus/                     # Musdesus files
│       └── perjalanan_dinas/             # Perjalanan Dinas files
│
├── logs/
│   ├── combined.log                 # All logs
│   └── error.log                    # Error logs only
│
├── .env                             # Environment variables (not in git)
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore file
├── package.json                     # Dependencies and scripts
├── package-lock.json                # Lock file
│
├── README.md                        # Project overview
├── SETUP_GUIDE.md                   # Setup and deployment guide
├── API_REFERENCE.md                 # Complete API documentation
├── IMPLEMENTATION_SUMMARY.md        # Implementation details
└── PROJECT_STRUCTURE.md             # This file

```

---

## 📁 Detailed File Descriptions

### `/src/server.js`
Main Express application file with:
- Middleware configuration
- Route registration
- Error handling setup
- Server startup

**Key features:**
- Helmet (security headers)
- CORS (cross-origin)
- Rate limiting (100 req/15min)
- Compression
- Morgan (HTTP logging)
- Body parsers

---

### `/src/config/database.js`
Sequelize configuration for MySQL connection.

**Features:**
- Connection pooling (max: 5, idle: 10s)
- Auto-timestamps (created_at, updated_at)
- Underscored naming disabled
- Logging integrated with Winston

---

### `/src/models/`
Sequelize models matching Laravel database schema.

#### `Bumdes.js`
- 50+ fields (identitas, legalitas, pengurus, files)
- Virtual method: `getFileUrl()`
- Table: `bumdes`

#### `Musdesus.js`
- 16 fields (file info, uploader, status)
- Virtual method: `getFileUrl()`
- Table: `musdesus`

#### `PerjalananDinas.js`
- 7 fields (kegiatan info, tanggal, lokasi)
- Table: `kegiatan`

---

### `/src/controllers/`
Business logic for each module.

#### `bumdes.controller.js`
**Methods:**
1. `getDesaBumdes()` - Get BUMDES for desa user
2. `storeDesaBumdes()` - Create/Update (Step 1)
3. `uploadDesaBumdesFile()` - Upload file (Step 2)
4. `updateDesaBumdes()` - Update BUMDES
5. `deleteDesaBumdes()` - Delete with file cleanup
6. `getAllBumdes()` - Get all (admin)
7. `getStatistics()` - Statistics (admin)
8. `getProdukHukumFiles()` - Get produk hukum files

#### `musdesus.controller.js`
**Methods:**
1. `getAllMusdesus()` - Get all files (admin)
2. `getDesaMusdesus()` - Get desa files
3. `uploadMusdesusFile()` - Upload file
4. `updateStatus()` - Update approval status
5. `deleteMusdesus()` - Delete file
6. `getStatistics()` - Statistics
7. `checkDesaUploadStatus()` - Check upload status

#### `perjalananDinas.controller.js`
**Methods:**
1. `getAllKegiatan()` - Get all kegiatan
2. `getKegiatanById()` - Get detail
3. `createKegiatan()` - Create new
4. `updateKegiatan()` - Update existing
5. `deleteKegiatan()` - Delete kegiatan
6. `getDashboardStats()` - Dashboard statistics
7. `getWeeklySchedule()` - Weekly schedule

---

### `/src/middlewares/`

#### `auth.js`
**Exports:**
- `auth()` - JWT verification middleware
- `checkRole(...roles)` - Role-based access control

**Usage:**
```javascript
router.get('/endpoint', auth, checkRole('desa'), controller);
```

#### `errorHandler.js`
Global error handler for:
- Sequelize errors (database)
- JWT errors (authentication)
- Multer errors (file upload)
- Validation errors
- General errors

#### `upload.js`
**Exports:**
- `uploadBumdes` - Multer for BUMDES (field-based routing)
- `uploadMusdesus` - Multer for Musdesus
- `uploadPerjadinDinas` - Multer for Perjalanan Dinas

**Features:**
- Auto-create directories
- Unique filename generation
- File type validation
- Size limit (5MB)

---

### `/src/routes/`

#### `bumdes.routes.js`
**Desa Routes:**
- `GET /` - Get BUMDES
- `POST /` - Create/Update
- `POST /upload-file` - Upload file
- `PUT /:id` - Update
- `DELETE /:id` - Delete

**Admin Routes:**
- `GET /all` - Get all
- `GET /statistics` - Statistics
- `GET /produk-hukum` - Produk hukum files

#### `musdesus.routes.js`
**Desa Routes:**
- `GET /desa` - Get files
- `POST /desa` - Upload file
- `DELETE /desa/:id` - Delete file

**Admin Routes:**
- `GET /all` - Get all
- `GET /statistics` - Statistics
- `PUT /:id/status` - Update status
- `DELETE /:id` - Delete
- `GET /check-upload/:desa_id` - Check status

#### `perjalananDinas.routes.js`
**Dashboard:**
- `GET /dashboard` - Statistics
- `GET /dashboard/weekly-schedule` - Weekly schedule

**Kegiatan:**
- `GET /kegiatan` - Get all
- `GET /kegiatan/:id` - Get detail
- `POST /kegiatan` - Create
- `PUT /kegiatan/:id` - Update
- `DELETE /kegiatan/:id` - Delete

#### `auth.routes.js`
Placeholder - auth still via Laravel.

---

### `/src/utils/logger.js`
Winston logger configuration.

**Transports:**
- Console (colorized, dev mode)
- File: `logs/error.log` (errors only)
- File: `logs/combined.log` (all logs)

**Format:**
```
YYYY-MM-DD HH:mm:ss [level]: message {metadata}
```

---

### `/storage/uploads/`
File storage directories (auto-created by upload middleware).

**Folders:**
- `bumdes_laporan_keuangan/` - Financial reports (2021-2024)
- `bumdes_dokumen_badanhukum/` - Legal documents
- `musdesus/` - Musdesus files
- `perjalanan_dinas/` - Perjalanan Dinas files

**File naming:**
```
{timestamp}_{original_name}.{ext}
Example: 1698765432_laporan_2021.pdf
```

---

### `/logs/`
Application logs (created by Winston).

- `combined.log` - All logs (info, warn, error)
- `error.log` - Error logs only

**Rotation:** Manual (consider adding log rotation in production)

---

### Configuration Files

#### `.env`
Environment variables (not committed to git).

**Required:**
- `NODE_ENV` - development/production
- `PORT` - Server port (3001)
- `DB_*` - Database credentials
- `JWT_SECRET` - JWT signing key
- `MAX_FILE_SIZE` - File upload limit
- `CORS_ORIGIN` - Frontend URL

#### `package.json`
Dependencies and npm scripts.

**Scripts:**
- `npm start` - Production mode
- `npm run dev` - Development mode (nodemon)

**Dependencies:**
- express, sequelize, mysql2
- jsonwebtoken, multer
- winston, helmet, cors
- compression, morgan

---

## 🔧 Middleware Flow

### Request → Response Flow

```
Client Request
    ↓
[helmet] - Security headers
    ↓
[cors] - Cross-origin check
    ↓
[rateLimit] - Rate limiting
    ↓
[compression] - Response compression
    ↓
[morgan] - HTTP logging
    ↓
[express.json/urlencoded] - Body parsing
    ↓
[Route Matching]
    ↓
[auth] - JWT verification (if required)
    ↓
[checkRole] - Role validation (if required)
    ↓
[upload] - File processing (if file upload)
    ↓
[Controller] - Business logic
    ↓
[Response]
    ↓
[errorHandler] - Global error handling (if error)
    ↓
Client Response
```

---

## 📊 Database Relationships

### BUMDES
- No direct relationships in Express
- References `desas` table (desa_id)
- References `kecamatans` table (kecamatan_id)

### MUSDESUS
- `belongsTo` Desa (desa_id)
- `belongsTo` Kecamatan (kecamatan_id)
- `belongsTo` User (petugas_id) - for approval

### PERJALANAN DINAS
- No relationships defined yet
- Can add `hasMany` KegiatanBidang in future

---

## 🎯 Code Organization Principles

1. **Separation of Concerns**
   - Models: Data structure
   - Controllers: Business logic
   - Routes: Endpoint definitions
   - Middlewares: Reusable logic

2. **DRY (Don't Repeat Yourself)**
   - Shared middlewares (auth, upload)
   - Global error handler
   - Centralized logger

3. **Security First**
   - JWT authentication required
   - Role-based access control
   - File type validation
   - Rate limiting

4. **Maintainability**
   - Clear file structure
   - Comprehensive comments
   - Detailed logging
   - Error messages

---

**END OF PROJECT STRUCTURE**
