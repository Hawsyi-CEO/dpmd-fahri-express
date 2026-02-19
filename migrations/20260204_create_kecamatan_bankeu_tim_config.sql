-- Migration: Create kecamatan_bankeu_tim_config table
-- Date: 2026-02-04
-- Description: Konfigurasi tim verifikasi bankeu kecamatan (ketua, sekretaris, 3 anggota)

CREATE TABLE IF NOT EXISTS `kecamatan_bankeu_tim_config` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `kecamatan_id` INT UNSIGNED NOT NULL,
  `posisi` ENUM('ketua', 'sekretaris', 'anggota_1', 'anggota_2', 'anggota_3') NOT NULL,
  `nama` VARCHAR(255) NOT NULL,
  `nip` VARCHAR(50) DEFAULT NULL,
  `jabatan` VARCHAR(255) NOT NULL,
  `ttd_path` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_kecamatan_posisi` (`kecamatan_id`, `posisi`),
  INDEX `idx_kecamatan` (`kecamatan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: 
-- - Setiap kecamatan punya 5 anggota tim (ketua, sekretaris, anggota_1, anggota_2, anggota_3)
-- - Masing-masing anggota mengisi questionnaire terpisah
-- - verifier_id di bankeu_verification_questionnaire akan menggunakan id dari tabel ini
