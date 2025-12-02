-- Migration: Rename table personil to pegawai and update related columns
-- Date: 2025-12-02
-- Description: Mengganti nama table personil menjadi pegawai beserta semua field terkait

-- Step 1: Rename table personil to pegawai
RENAME TABLE `personil` TO `pegawai`;

-- Step 2: Rename primary key column
ALTER TABLE `pegawai` 
  CHANGE COLUMN `id_personil` `id_pegawai` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT;

-- Step 3: Rename nama_personil column
ALTER TABLE `pegawai` 
  CHANGE COLUMN `nama_personil` `nama_pegawai` VARCHAR(255) NOT NULL;

-- Step 4: Drop old foreign key constraint first
ALTER TABLE `pegawai` 
  DROP FOREIGN KEY `personil_id_bidang_foreign`;

-- Step 5: Drop old index (now safe after FK removed)
ALTER TABLE `pegawai` 
  DROP INDEX `personil_id_bidang_foreign`;

-- Step 6: Add new index with new name
ALTER TABLE `pegawai` 
  ADD INDEX `pegawai_id_bidang_foreign` (`id_bidang`);

-- Step 7: Add new foreign key constraint
ALTER TABLE `pegawai` 
  ADD CONSTRAINT `pegawai_id_bidang_foreign` 
  FOREIGN KEY (`id_bidang`) REFERENCES `bidangs` (`id`) ON DELETE CASCADE;

-- Step 8: Rename column in kegiatan_bidang table
ALTER TABLE `kegiatan_bidang` 
  CHANGE COLUMN `personil` `pegawai` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

-- Verify migration
SELECT 'Migration completed successfully. Table personil renamed to pegawai.' AS status;
