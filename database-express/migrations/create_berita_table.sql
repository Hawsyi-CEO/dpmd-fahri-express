-- Migration: Create berita table
-- Created: 2025-11-12

CREATE TABLE IF NOT EXISTS `berita` (
  `id_berita` INT(11) NOT NULL AUTO_INCREMENT,
  `judul` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `konten` TEXT NOT NULL,
  `ringkasan` VARCHAR(500) DEFAULT NULL,
  `gambar` VARCHAR(255) DEFAULT NULL,
  `kategori` ENUM('umum', 'bumdes', 'perjadin', 'musdesus', 'pengumuman') DEFAULT 'umum',
  `status` ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  `tanggal_publish` DATETIME DEFAULT NULL,
  `penulis` VARCHAR(100) DEFAULT NULL,
  `views` INT(11) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_berita`),
  KEY `idx_slug` (`slug`),
  KEY `idx_status` (`status`),
  KEY `idx_kategori` (`kategori`),
  KEY `idx_tanggal_publish` (`tanggal_publish`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data
INSERT INTO `berita` (`judul`, `slug`, `konten`, `ringkasan`, `kategori`, `status`, `tanggal_publish`, `penulis`) VALUES
('Launching Sistem Informasi DPMD Kabupaten Bogor', 'launching-sistem-informasi-dpmd', '<p>Dinas Pemberdayaan Masyarakat dan Desa Kabupaten Bogor dengan bangga mengumumkan peluncuran Sistem Informasi terpadu untuk meningkatkan pelayanan kepada masyarakat.</p><p>Sistem ini mencakup manajemen BUMDes, Perjalanan Dinas, dan Musyawarah Desa.</p>', 'Peluncuran sistem informasi terpadu DPMD untuk meningkatkan pelayanan masyarakat', 'pengumuman', 'published', NOW(), 'Admin DPMD'),
('Pelatihan Manajemen BUMDes se-Kabupaten Bogor', 'pelatihan-manajemen-bumdes', '<p>DPMD Kabupaten Bogor mengadakan pelatihan manajemen BUMDes yang diikuti oleh 188 BUMDes dari seluruh kecamatan.</p><p>Pelatihan ini bertujuan untuk meningkatkan kapasitas pengelola BUMDes dalam mengelola usaha desa.</p>', 'Pelatihan manajemen BUMDes diikuti 188 peserta dari seluruh kabupaten', 'bumdes', 'published', NOW(), 'Admin DPMD'),
('Sosialisasi Aplikasi Musdesus Digital', 'sosialisasi-aplikasi-musdesus', '<p>Musyawarah Desa kini dapat dilakukan secara digital melalui aplikasi Musdesus yang telah dikembangkan oleh DPMD.</p><p>Aplikasi ini memudahkan desa dalam mendokumentasikan dan melaporkan hasil musyawarah.</p>', 'Aplikasi Musdesus digital memudahkan desa dalam dokumentasi musyawarah', 'musdesus', 'published', NOW(), 'Admin DPMD');
