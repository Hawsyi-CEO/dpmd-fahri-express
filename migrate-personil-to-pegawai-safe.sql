-- Safe Migration: Rename table personil to pegawai
-- Date: 2025-12-02

-- Step 1: Check if personil table exists
SET @tableExists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'dpmd' AND table_name = 'personil');

-- Step 2: Rename table if exists
SET @sql1 = IF(@tableExists > 0, 'ALTER TABLE personil RENAME TO pegawai', 'SELECT "Table personil does not exist, skipping rename" AS message');
PREPARE stmt1 FROM @sql1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

-- Step 3: Check if pegawai table exists now
SET @pegawaiExists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'dpmd' AND table_name = 'pegawai');

-- Step 4: Rename columns if pegawai table exists
SET @sql2 = IF(@pegawaiExists > 0 AND EXISTS(SELECT * FROM information_schema.columns WHERE table_schema = 'dpmd' AND table_name = 'pegawai' AND column_name = 'id_personil'),
    'ALTER TABLE pegawai CHANGE id_personil id_pegawai BIGINT UNSIGNED NOT NULL AUTO_INCREMENT',
    'SELECT "Column id_personil already renamed or does not exist" AS message');
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

SET @sql3 = IF(@pegawaiExists > 0 AND EXISTS(SELECT * FROM information_schema.columns WHERE table_schema = 'dpmd' AND table_name = 'pegawai' AND column_name = 'nama_personil'),
    'ALTER TABLE pegawai CHANGE nama_personil nama_pegawai VARCHAR(255) NOT NULL',
    'SELECT "Column nama_personil already renamed or does not exist" AS message');
PREPARE stmt3 FROM @sql3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

-- Step 5: Update kegiatan table foreign key
-- Drop old foreign key if exists
SET @fkExists = (SELECT COUNT(*) FROM information_schema.table_constraints 
    WHERE constraint_schema = 'dpmd' 
    AND table_name = 'kegiatan' 
    AND constraint_name = 'kegiatan_id_personil_foreign');
    
SET @sql4 = IF(@fkExists > 0, 
    'ALTER TABLE kegiatan DROP FOREIGN KEY kegiatan_id_personil_foreign',
    'SELECT "Foreign key kegiatan_id_personil_foreign does not exist" AS message');
PREPARE stmt4 FROM @sql4;
EXECUTE stmt4;
DEALLOCATE PREPARE stmt4;

-- Rename column in kegiatan table
SET @colExists = (SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_schema = 'dpmd' 
    AND table_name = 'kegiatan' 
    AND column_name = 'id_personil');
    
SET @sql5 = IF(@colExists > 0,
    'ALTER TABLE kegiatan CHANGE id_personil id_pegawai BIGINT UNSIGNED NULL',
    'SELECT "Column id_personil in kegiatan already renamed" AS message');
PREPARE stmt5 FROM @sql5;
EXECUTE stmt5;
DEALLOCATE PREPARE stmt5;

-- Add new foreign key if pegawai table exists
SET @sql6 = IF(@pegawaiExists > 0 AND NOT EXISTS(
    SELECT * FROM information_schema.table_constraints 
    WHERE constraint_schema = 'dpmd' 
    AND table_name = 'kegiatan' 
    AND constraint_name = 'kegiatan_id_pegawai_foreign'),
    'ALTER TABLE kegiatan ADD CONSTRAINT kegiatan_id_pegawai_foreign FOREIGN KEY (id_pegawai) REFERENCES pegawai(id_pegawai) ON DELETE SET NULL ON UPDATE CASCADE',
    'SELECT "Foreign key kegiatan_id_pegawai_foreign already exists" AS message');
PREPARE stmt6 FROM @sql6;
EXECUTE stmt6;
DEALLOCATE PREPARE stmt6;

-- Verification
SELECT 'Migration completed' AS status;
SELECT COUNT(*) AS total_pegawai FROM pegawai;
SELECT COUNT(*) AS kegiatan_with_pegawai FROM kegiatan WHERE id_pegawai IS NOT NULL;
