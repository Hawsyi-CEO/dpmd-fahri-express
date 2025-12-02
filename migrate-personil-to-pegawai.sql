-- Migration: Rename table personil to pegawai
-- Date: 2025-12-02

-- Step 1: Rename table
ALTER TABLE personil RENAME TO pegawai;

-- Step 2: Rename columns
ALTER TABLE pegawai CHANGE id_personil id_pegawai BIGINT UNSIGNED NOT NULL AUTO_INCREMENT;
ALTER TABLE pegawai CHANGE nama_personil nama_pegawai VARCHAR(255) NOT NULL;

-- Step 3: Update foreign key in kegiatan table
ALTER TABLE kegiatan DROP FOREIGN KEY kegiatan_id_personil_foreign;
ALTER TABLE kegiatan CHANGE id_personil id_pegawai BIGINT UNSIGNED NULL;
ALTER TABLE kegiatan ADD CONSTRAINT kegiatan_id_pegawai_foreign 
  FOREIGN KEY (id_pegawai) REFERENCES pegawai(id_pegawai) ON DELETE SET NULL ON UPDATE CASCADE;

-- Verification queries
SELECT 'Table renamed successfully' AS status;
SELECT COUNT(*) AS total_pegawai FROM pegawai;
SELECT COUNT(*) AS kegiatan_with_pegawai FROM kegiatan WHERE id_pegawai IS NOT NULL;
