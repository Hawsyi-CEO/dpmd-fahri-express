-- Migration: Add Dinas Verification Flow
-- Date: 2026-01-28
-- Description: Add dinas terkait verification layer between desa and kecamatan

-- 1. Create master_dinas table
CREATE TABLE IF NOT EXISTS `master_dinas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `kode_dinas` VARCHAR(50) NOT NULL UNIQUE,
  `nama_dinas` VARCHAR(255) NOT NULL,
  `singkatan` VARCHAR(100) NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_kode_dinas` (`kode_dinas`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Insert master dinas data
INSERT IGNORE INTO `master_dinas` (`kode_dinas`, `nama_dinas`, `singkatan`) VALUES
('UPT_PU', 'Unit Pelaksana Teknis Pekerjaan Umum', 'UPT PU'),
('DPTR', 'Dinas Perumahan dan Tata Ruang', 'DPTR'),
('DPKP', 'Dinas Pekerjaan Umum dan Kebersihan dan Pertamanan', 'DPKP'),
('UPT_DLH', 'Unit Pelaksana Teknis Dinas Lingkungan Hidup', 'UPT DLH'),
('DISKOMINFO', 'Dinas Komunikasi dan Informatika', 'DISKOMINFO'),
('BAPPERIDA', 'Badan Perencanaan Pembangunan dan Penelitian Daerah', 'BAPPERIDA'),
('DPMD', 'Dinas Pemberdayaan Masyarakat dan Desa', 'DPMD'),
('BPBD', 'Badan Penanggulangan Bencana Daerah', 'BPBD'),
('DINKES', 'Dinas Kesehatan', 'DINKES'),
('DINSOS', 'Dinas Sosial', 'DINSOS'),
('DP3AP2KB', 'Dinas Pemberdayaan Perempuan Perlindungan Anak dan Pengendalian Penduduk KB', 'DP3AP2KB'),
('DINKOPUKM', 'Dinas Koperasi dan UKM', 'DINKOPUKM'),
('DKP', 'Dinas Ketahanan Pangan', 'DKP'),
('DISNAKER', 'Dinas Tenaga Kerja', 'DISNAKER');

-- 3. Add dinas_terkait column to bankeu_master_kegiatan
ALTER TABLE `bankeu_master_kegiatan` 
ADD COLUMN `dinas_terkait` VARCHAR(255) NULL COMMENT 'Comma-separated dinas codes for multiple dinas' AFTER `nama_kegiatan`,
ADD INDEX `idx_dinas_terkait` (`dinas_terkait`);

-- 4. Update master kegiatan with dinas mapping
UPDATE `bankeu_master_kegiatan` SET `dinas_terkait` = 'UPT_PU' 
WHERE `nama_kegiatan` LIKE '%Jalan Desa%Jembatan%';

UPDATE `bankeu_master_kegiatan` SET `dinas_terkait` = 'UPT_PU' 
WHERE `nama_kegiatan` = 'Dinding penahan tanah, tebing, tembok tanah, pasangan bronjong';

UPDATE `bankeu_master_kegiatan` SET `dinas_terkait` = 'DPTR' 
WHERE `nama_kegiatan` = 'Pembangunan/Rehabilitasi/rekonstruksi Kantor Desa';

UPDATE `bankeu_master_kegiatan` SET `dinas_terkait` = 'DPKP' 
WHERE `nama_kegiatan` = 'Sanitasi lingkungan';

UPDATE `bankeu_master_kegiatan` SET `dinas_terkait` = 'DPKP' 
WHERE `nama_kegiatan` = 'Pembangunan/rehabilitasi sarana dan prasarana air bersih berskala desa';

UPDATE `bankeu_master_kegiatan` SET `dinas_terkait` = 'UPT_PU' 
WHERE `nama_kegiatan` = 'Infrastruktur pendukung program Koperasi Desa Merah Putih';

UPDATE `bankeu_master_kegiatan` SET `dinas_terkait` = 'UPT_DLH' 
WHERE `nama_kegiatan` = 'Infrastruktur pendukung pengelolaan sampah berskala Desa';

UPDATE `bankeu_master_kegiatan` SET `dinas_terkait` = 'UPT_DLH' 
WHERE `nama_kegiatan` = 'Pendukung program pengelolaan sampah berskala desa';

UPDATE `bankeu_master_kegiatan` SET `dinas_terkait` = 'DISKOMINFO' 
WHERE `nama_kegiatan` = 'Pengembangan Data Digital Desa';

UPDATE `bankeu_master_kegiatan` SET `dinas_terkait` = 'BAPPERIDA' 
WHERE `nama_kegiatan` = 'Program Minimal Satu Sarjana Satu Desa';

UPDATE `bankeu_master_kegiatan` SET `dinas_terkait` = 'DPMD' 
WHERE `nama_kegiatan` = 'Pendukung sekolah Pemerintahan Desa';

UPDATE `bankeu_master_kegiatan` SET `dinas_terkait` = 'BPBD,DINKES,DINSOS' 
WHERE `nama_kegiatan` = 'Pendukung program Desa Siaga';

UPDATE `bankeu_master_kegiatan` SET `dinas_terkait` = 'DP3AP2KB' 
WHERE `nama_kegiatan` LIKE '%Peranan Wanita%P2WKSS%';

UPDATE `bankeu_master_kegiatan` SET `dinas_terkait` = 'DP3AP2KB' 
WHERE `nama_kegiatan` = 'Pendukung program Sekolah Pra Nikah';

UPDATE `bankeu_master_kegiatan` SET `dinas_terkait` = 'DINKOPUKM' 
WHERE `nama_kegiatan` = 'Pendukung program Koperasi Desa Merah Putih' AND `jenis_kegiatan` = 'non_infrastruktur';

UPDATE `bankeu_master_kegiatan` SET `dinas_terkait` = 'DKP' 
WHERE `nama_kegiatan` = 'Pendukung program Gerakan Pangan Murah';

UPDATE `bankeu_master_kegiatan` SET `dinas_terkait` = 'DINSOS' 
WHERE `nama_kegiatan` = 'Pemberdayaan lembaga kemasyarakatan di Desa';

UPDATE `bankeu_master_kegiatan` SET `dinas_terkait` = 'DP3AP2KB' 
WHERE `nama_kegiatan` = 'Pendukung pembelajaran Sekolah Perempuan';

UPDATE `bankeu_master_kegiatan` SET `dinas_terkait` = 'DISNAKER' 
WHERE `nama_kegiatan` LIKE '%jaminan ketenagakerjaan%';

-- 5. Add dinas verification fields to bankeu_proposals
ALTER TABLE `bankeu_proposals` 
ADD COLUMN `dinas_status` ENUM('pending', 'in_review', 'approved', 'rejected', 'revision') NULL COMMENT 'Status verifikasi dinas' AFTER `status`,
ADD COLUMN `submitted_to_dinas_at` TIMESTAMP NULL AFTER `dinas_status`,
ADD COLUMN `dinas_verified_at` TIMESTAMP NULL AFTER `submitted_to_dinas_at`,
ADD COLUMN `dinas_verified_by` INT NULL COMMENT 'User ID from users table' AFTER `dinas_verified_at`,
ADD COLUMN `dinas_catatan` TEXT NULL AFTER `dinas_verified_by`,
ADD INDEX `idx_dinas_status` (`dinas_status`),
ADD INDEX `idx_dinas_verified_by` (`dinas_verified_by`);

-- 6. Add dinas_terkait role to users table (if not already exists)
-- First check and add if needed
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'users'
AND COLUMN_NAME = 'role'
AND COLUMN_TYPE LIKE '%dinas_terkait%';

-- Only alter if dinas_terkait role doesn't exist
SET @alter_sql = IF(@col_exists = 0,
  "ALTER TABLE `users` MODIFY COLUMN `role` ENUM('superadmin', 'kepala_dinas', 'sekretaris_dinas', 'kepala_bidang', 'ketua_tim', 'pegawai', 'desa', 'kecamatan', 'dinas_terkait') NOT NULL DEFAULT 'desa'",
  "SELECT 'Role dinas_terkait already exists' AS message"
);

PREPARE stmt FROM @alter_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 7. Rename existing bankeu_verification_questionnaires to support both kecamatan and dinas
-- Add verifikasi_type column to distinguish between dinas and kecamatan questionnaires
ALTER TABLE `bankeu_verification_questionnaires` 
ADD COLUMN `verifikasi_type` ENUM('dinas', 'kecamatan') NOT NULL DEFAULT 'kecamatan' AFTER `proposal_id`,
ADD COLUMN `dinas_id` INT NULL COMMENT 'ID dari master_dinas jika verifikasi_type=dinas' AFTER `tim_verifikasi_id`,
ADD INDEX `idx_verifikasi_type` (`verifikasi_type`),
ADD INDEX `idx_dinas_id` (`dinas_id`);

-- 8. Add foreign key constraints
ALTER TABLE `bankeu_verification_questionnaires`
ADD CONSTRAINT `fk_questionnaire_dinas` FOREIGN KEY (`dinas_id`) REFERENCES `master_dinas` (`id`) ON DELETE SET NULL;

ALTER TABLE `bankeu_proposals`
ADD CONSTRAINT `fk_proposal_dinas_verified_by` FOREIGN KEY (`dinas_verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

-- 9. Create view for easy proposal tracking with dinas info
CREATE OR REPLACE VIEW `v_bankeu_proposals_with_dinas` AS
SELECT 
  bp.*,
  bmk.dinas_terkait,
  md.nama_dinas,
  md.singkatan as dinas_singkatan,
  u_dinas.name as dinas_verifier_name,
  u_dinas.email as dinas_verifier_email
FROM bankeu_proposals bp
LEFT JOIN bankeu_master_kegiatan bmk ON bp.kegiatan_id = bmk.id
LEFT JOIN master_dinas md ON FIND_IN_SET(md.kode_dinas, bmk.dinas_terkait) > 0
LEFT JOIN users u_dinas ON bp.dinas_verified_by = u_dinas.id;
