-- Migration: Rename table personil to pegawai
-- Date: 2025-12-02

-- Rename table
ALTER TABLE `personil` RENAME TO `pegawai`;

-- Rename columns
ALTER TABLE `pegawai` 
  CHANGE COLUMN `id_personil` `id_pegawai` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  CHANGE COLUMN `nama_personil` `nama_pegawai` VARCHAR(100) NOT NULL;

-- Update foreign key in kegiatan_bidang if exists
ALTER TABLE `kegiatan_bidang` 
  DROP FOREIGN KEY IF EXISTS `kegiatan_bidang_ibfk_3`;

-- Recreate foreign key with new name (if needed in future)
-- Note: kegiatan_bidang.pegawai is TEXT/JSON, not direct FK to pegawai table

-- Update indexes if needed
-- PRIMARY KEY already renamed with column

SELECT '✅ Migration completed: personil → pegawai' as status;
