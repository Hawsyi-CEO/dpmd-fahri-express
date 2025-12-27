-- Migration: Cleanup Old Roles
-- Date: 2025-12-27
-- Description: Remove old/unused roles and update to new role structure

-- Step 1: Backup users with old roles before migration
CREATE TABLE IF NOT EXISTS users_role_backup_20251227 AS
SELECT id, email, nama, role, bidang_id, created_at
FROM users
WHERE role IN ('admin', 'dinas', 'sarpras', 'sekretariat', 'sarana_prasarana', 'kekayaan_keuangan', 'pemberdayaan_masyarakat', 'pemerintahan_desa');

-- Step 2: Update users with old roles to appropriate new roles
-- Map staff roles to 'pegawai' with appropriate bidang_id
UPDATE users 
SET role = 'pegawai', bidang_id = 2 
WHERE role = 'sekretariat';

UPDATE users 
SET role = 'pegawai', bidang_id = 3 
WHERE role IN ('sarana_prasarana', 'sarpras');

UPDATE users 
SET role = 'pegawai', bidang_id = 4 
WHERE role = 'kekayaan_keuangan';

UPDATE users 
SET role = 'pegawai', bidang_id = 5 
WHERE role = 'pemberdayaan_masyarakat';

UPDATE users 
SET role = 'pegawai', bidang_id = 6 
WHERE role = 'pemerintahan_desa';

-- Update 'admin' role to 'superadmin' (if they should be superadmin)
-- Or to appropriate role based on business logic
-- UPDATE users SET role = 'superadmin' WHERE role = 'admin' AND email = 'specific@email.com';

-- Update 'dinas' role to 'kepala_dinas' or 'pegawai' based on business logic
-- UPDATE users SET role = 'kepala_dinas' WHERE role = 'dinas' AND kondisi_tertentu;

-- Step 3: Verify the migration
SELECT 
    role, 
    COUNT(*) as total_users,
    GROUP_CONCAT(DISTINCT bidang_id) as bidang_ids
FROM users
GROUP BY role
ORDER BY role;

-- Step 4: After verification, update the enum
-- NOTE: This requires manual execution as ALTER TYPE is database-specific
-- For MySQL:
ALTER TABLE users MODIFY role ENUM(
    'superadmin',
    'kepala_dinas',
    'sekretaris_dinas',
    'kepala_bidang',
    'ketua_tim',
    'pegawai',
    'desa',
    'kecamatan'
) NOT NULL;

-- Step 5: Verify final state
SELECT 
    role,
    bidang_id,
    COUNT(*) as total
FROM users
GROUP BY role, bidang_id
ORDER BY role, bidang_id;
