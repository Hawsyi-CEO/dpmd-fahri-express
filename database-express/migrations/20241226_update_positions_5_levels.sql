-- Migration: Update positions to 5 levels only
-- Date: 2024-12-26
-- Description: Remove Sekretariat position and keep only 5 staff positions

-- First, backup any users with sekretariat position (shouldn't exist for pegawai)
-- We'll set them to NULL since sekretariat is admin role, not pegawai position

UPDATE users 
SET position_id = NULL 
WHERE position_id = (SELECT id FROM positions WHERE code = 'sekretariat');

-- Delete sekretariat position
DELETE FROM positions WHERE code = 'sekretariat';

-- Update remaining positions to ensure correct data
UPDATE positions SET 
    name = 'Kepala Dinas',
    level = 2,
    description = 'Kepala Dinas Pemberdayaan Masyarakat dan Desa'
WHERE code = 'kepala_dinas';

UPDATE positions SET 
    name = 'Sekretaris Dinas',
    level = 3,
    description = 'Sekretaris Dinas Pemberdayaan Masyarakat dan Desa'
WHERE code = 'sekretaris_dinas';

UPDATE positions SET 
    name = 'Kepala Bidang Sarana Prasarana',
    level = 4,
    description = 'Kepala Bidang Sarana Prasarana Kewilayahan dan Ekonomi Desa'
WHERE code = 'kepala_bidang_sarpras';

UPDATE positions SET 
    name = 'Kepala Bidang Kekayaan Keuangan',
    level = 4,
    description = 'Kepala Bidang Kekayaan Keuangan Desa'
WHERE code = 'kepala_bidang_kkd';

UPDATE positions SET 
    name = 'Kepala Bidang Pemberdayaan Masyarakat',
    level = 4,
    description = 'Kepala Bidang Pemberdayaan Masyarakat'
WHERE code = 'kepala_bidang_pemmas';

UPDATE positions SET 
    name = 'Kepala Bidang Pemerintahan Desa',
    level = 4,
    description = 'Kepala Bidang Pemerintahan Desa'
WHERE code = 'kepala_bidang_pemdes';

UPDATE positions SET 
    name = 'Kepala Bidang Sekretariat',
    level = 4,
    description = 'Kepala Bidang Sekretariat'
WHERE code = 'kepala_bidang_sekretariat';

UPDATE positions SET 
    name = 'Ketua Tim',
    level = 5,
    description = 'Ketua Tim dalam struktur organisasi'
WHERE code = 'ketua_tim';

UPDATE positions SET 
    name = 'Pegawai/Staff',
    level = 6,
    description = 'Pegawai/Staff pelaksana'
WHERE code = 'pegawai';

-- Verify the result
SELECT id, code, name, level, description 
FROM positions 
ORDER BY level ASC;
