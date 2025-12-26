-- Migration: Add Position Management System
-- Date: 2024-12-26
-- Description: Add positions table and position_id to users for flexible role management

-- Step 1: Create positions table
CREATE TABLE IF NOT EXISTS positions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Unique identifier for position (kepala_dinas, sekretaris_dinas, etc)',
  name VARCHAR(100) NOT NULL COMMENT 'Display name for position',
  level INT NOT NULL COMMENT 'Hierarchy level (1=highest, 6=lowest)',
  description TEXT COMMENT 'Position description',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Insert default positions
INSERT INTO positions (code, name, level, description) VALUES
('sekretariat', 'Sekretariat', 1, 'Admin Sekretariat - Mengelola surat masuk dan disposisi'),
('kepala_dinas', 'Kepala Dinas', 2, 'Kepala Dinas DPMD - Pengambil keputusan tertinggi'),
('sekretaris_dinas', 'Sekretaris Dinas', 3, 'Sekretaris Dinas - Koordinator administratif'),
('kabid_sekretariat', 'Kepala Bidang Sekretariat', 4, 'Kepala Bidang Sekretariat'),
('kabid_pemerintahan_desa', 'Kepala Bidang Pemerintahan Desa', 4, 'Kepala Bidang Pemerintahan Desa'),
('kabid_spked', 'Kepala Bidang SPKED', 4, 'Kepala Bidang Sarana Prasarana & Keuangan Desa'),
('kabid_kekayaan_keuangan_desa', 'Kepala Bidang Kekayaan & Keuangan Desa', 4, 'Kepala Bidang Kekayaan & Keuangan Desa'),
('kabid_pemberdayaan_masyarakat_desa', 'Kepala Bidang Pemberdayaan Masyarakat Desa', 4, 'Kepala Bidang Pemberdayaan Masyarakat Desa'),
('ketua_tim', 'Ketua Tim', 5, 'Ketua Tim - Koordinator tim pelaksana'),
('pegawai', 'Pegawai', 6, 'Pegawai/Staff - Pelaksana tugas');

-- Step 3: Add position_id column to users table
ALTER TABLE users 
ADD COLUMN position_id INT NULL COMMENT 'Foreign key to positions table' AFTER role,
ADD CONSTRAINT fk_users_position FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL;

-- Step 4: Create position_history table for audit trail
CREATE TABLE IF NOT EXISTS position_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT 'User whose position changed',
  old_position_id INT NULL COMMENT 'Previous position (NULL if first assignment)',
  new_position_id INT NULL COMMENT 'New position (NULL if removed)',
  changed_by INT NOT NULL COMMENT 'User who made the change (typically admin)',
  reason TEXT COMMENT 'Reason for change',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (old_position_id) REFERENCES positions(id) ON DELETE SET NULL,
  FOREIGN KEY (new_position_id) REFERENCES positions(id) ON DELETE SET NULL,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 5: Migrate existing users to use positions (Optional - for existing data)
-- This maps current role values to position_id

UPDATE users u
LEFT JOIN positions p ON (
  CASE 
    WHEN u.role = 'kepala_dinas' THEN p.code = 'kepala_dinas'
    WHEN u.role = 'sekretaris_dinas' THEN p.code = 'sekretaris_dinas'
    WHEN u.role = 'kabid_sekretariat' THEN p.code = 'kabid_sekretariat'
    WHEN u.role = 'kabid_pemerintahan_desa' THEN p.code = 'kabid_pemerintahan_desa'
    WHEN u.role = 'kabid_spked' THEN p.code = 'kabid_spked'
    WHEN u.role = 'kabid_kekayaan_keuangan_desa' THEN p.code = 'kabid_kekayaan_keuangan_desa'
    WHEN u.role = 'kabid_pemberdayaan_masyarakat_desa' THEN p.code = 'kabid_pemberdayaan_masyarakat_desa'
    WHEN u.role = 'ketua_tim' THEN p.code = 'ketua_tim'
    WHEN u.role = 'pegawai' THEN p.code = 'pegawai'
    ELSE FALSE
  END
)
SET u.position_id = p.id
WHERE u.role IN (
  'kepala_dinas', 
  'sekretaris_dinas', 
  'kabid_sekretariat',
  'kabid_pemerintahan_desa',
  'kabid_spked',
  'kabid_kekayaan_keuangan_desa',
  'kabid_pemberdayaan_masyarakat_desa',
  'ketua_tim',
  'pegawai'
);

-- Step 6: Add indexes for performance
CREATE INDEX idx_users_position_id ON users(position_id);
CREATE INDEX idx_users_role ON users(role);

-- Verification queries
-- Check positions
SELECT * FROM positions ORDER BY level;

-- Check users with positions
SELECT 
  u.id,
  u.name,
  u.email,
  u.role as old_role,
  p.code as position_code,
  p.name as position_name,
  p.level as position_level
FROM users u
LEFT JOIN positions p ON u.position_id = p.id
ORDER BY u.id;

-- Check position distribution
SELECT 
  COALESCE(p.name, 'No Position') as position,
  COUNT(*) as user_count
FROM users u
LEFT JOIN positions p ON u.position_id = p.id
GROUP BY p.name, p.level
ORDER BY p.level;
