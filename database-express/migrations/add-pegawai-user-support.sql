-- Migration: Add pegawai user support
-- Date: 2025-12-02
-- Description: Add pegawai_id to users table and add 'pegawai' role

-- Step 1: Add pegawai_id column to users table
ALTER TABLE users 
ADD COLUMN pegawai_id BIGINT UNSIGNED NULL AFTER bidang_id,
ADD CONSTRAINT users_pegawai_id_foreign 
  FOREIGN KEY (pegawai_id) 
  REFERENCES pegawai(id_pegawai) 
  ON DELETE CASCADE 
  ON UPDATE NO ACTION;

-- Step 2: Add index for better query performance
ALTER TABLE users 
ADD INDEX users_pegawai_id_index (pegawai_id);

-- Step 3: Modify enum users_role to add 'pegawai'
ALTER TABLE users 
MODIFY COLUMN role ENUM(
  'superadmin',
  'admin', 
  'desa',
  'kecamatan',
  'dinas',
  'kepala_dinas',
  'sarpras',
  'sekretariat',
  'sarana_prasarana',
  'kekayaan_keuangan',
  'pemberdayaan_masyarakat',
  'pemerintahan_desa',
  'pegawai'
) NOT NULL DEFAULT 'desa';

-- Step 4: Add is_active column for account management
ALTER TABLE users 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE AFTER password;

-- Rollback commands (if needed):
-- ALTER TABLE users DROP FOREIGN KEY users_pegawai_id_foreign;
-- ALTER TABLE users DROP COLUMN pegawai_id;
-- ALTER TABLE users DROP COLUMN is_active;
-- ALTER TABLE users MODIFY COLUMN role ENUM(...) NOT NULL DEFAULT 'desa'; -- use old enum values
