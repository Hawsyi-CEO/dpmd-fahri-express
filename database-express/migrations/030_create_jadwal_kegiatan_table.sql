-- Migration: Create jadwal_kegiatan table
-- Date: 2025-12-28
-- Purpose: Manage activity schedules across all DPMD roles

CREATE TABLE IF NOT EXISTS `jadwal_kegiatan` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `judul` VARCHAR(255) NOT NULL COMMENT 'Judul kegiatan',
  `deskripsi` TEXT NOT NULL COMMENT 'Deskripsi detail kegiatan',
  `bidang_id` BIGINT UNSIGNED NULL COMMENT 'Bidang yang bertanggung jawab',
  `tanggal_mulai` DATETIME NOT NULL COMMENT 'Tanggal dan waktu mulai',
  `tanggal_selesai` DATETIME NOT NULL COMMENT 'Tanggal dan waktu selesai',
  `lokasi` VARCHAR(255) NULL COMMENT 'Lokasi kegiatan',
  `pic_name` VARCHAR(255) NULL COMMENT 'Person in charge',
  `pic_contact` VARCHAR(50) NULL COMMENT 'Kontak PIC',
  `status` ENUM('draft', 'pending', 'approved', 'rejected', 'completed', 'cancelled') NOT NULL DEFAULT 'draft' COMMENT 'Status kegiatan',
  `prioritas` ENUM('rendah', 'sedang', 'tinggi', 'urgent') NOT NULL DEFAULT 'sedang' COMMENT 'Prioritas kegiatan',
  `kategori` ENUM('rapat', 'pelatihan', 'monitoring', 'kunjungan', 'acara', 'lainnya') NOT NULL DEFAULT 'lainnya' COMMENT 'Kategori kegiatan',
  `anggaran` DECIMAL(15, 2) NULL COMMENT 'Anggaran kegiatan (optional)',
  `catatan_approval` TEXT NULL COMMENT 'Catatan dari approver',
  `created_by` BIGINT UNSIGNED NOT NULL COMMENT 'User yang membuat',
  `approved_by` BIGINT UNSIGNED NULL COMMENT 'User yang approve',
  `approved_at` DATETIME NULL COMMENT 'Waktu approval',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_bidang_id` (`bidang_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_prioritas` (`prioritas`),
  INDEX `idx_kategori` (`kategori`),
  INDEX `idx_tanggal_mulai` (`tanggal_mulai`),
  INDEX `idx_tanggal_selesai` (`tanggal_selesai`),
  INDEX `idx_created_by` (`created_by`),
  INDEX `idx_approved_by` (`approved_by`),
  
  FOREIGN KEY (`bidang_id`) REFERENCES `bidangs`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Jadwal kegiatan DPMD';

-- Sample data
INSERT INTO `jadwal_kegiatan` (
  `judul`, 
  `deskripsi`, 
  `bidang_id`, 
  `tanggal_mulai`, 
  `tanggal_selesai`, 
  `lokasi`, 
  `pic_name`, 
  `pic_contact`, 
  `status`, 
  `prioritas`, 
  `kategori`, 
  `created_by`
) VALUES 
(
  'Rapat Koordinasi Bulanan',
  'Rapat koordinasi rutin untuk membahas progress kegiatan bulan ini dan rencana bulan depan',
  2,
  '2025-01-05 09:00:00',
  '2025-01-05 12:00:00',
  'Aula DPMD Lantai 2',
  'Endang Hari Mulyadinata',
  '081234567890',
  'approved',
  'tinggi',
  'rapat',
  1
),
(
  'Pelatihan Penggunaan Aplikasi DPMD',
  'Pelatihan untuk admin desa tentang cara menggunakan aplikasi DPMD versi terbaru',
  2,
  '2025-01-10 08:00:00',
  '2025-01-10 16:00:00',
  'Aula Besar Pemkab Bogor',
  'Lisna Susanti',
  '081298765432',
  'pending',
  'sedang',
  'pelatihan',
  1
);
