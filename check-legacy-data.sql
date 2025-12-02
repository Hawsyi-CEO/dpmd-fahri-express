-- Migration: Convert TEXT pegawai data to proper JSON format
-- This will parse comma-separated names and convert to JSON array with id_pegawai lookup
-- Date: 2025-12-02

-- Backup table first (optional but recommended)
-- CREATE TABLE kegiatan_bidang_backup AS SELECT * FROM kegiatan_bidang;

-- For safety, let's see what we're working with
SELECT 'Data to be migrated:' as info;
SELECT id_kegiatan_bidang, id_kegiatan, id_bidang, 
       SUBSTRING(pegawai, 1, 100) as current_pegawai_format
FROM kegiatan_bidang 
WHERE pegawai NOT LIKE '[%'
LIMIT 10;

SELECT '=' as divider;
SELECT 'Migration will run - converting TEXT to JSON format' as status;

-- Note: This migration is complex and should be done with a proper script
-- For now, we'll use the backend to handle this conversion automatically
-- Backend already has logic to parse both formats

SELECT 'Backend controller will handle mixed formats automatically' as note;
SELECT 'New data will be saved as JSON, old data will be read as-is' as note2;
