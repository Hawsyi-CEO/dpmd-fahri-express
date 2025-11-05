-- Create hero_galleries table for Hero Gallery feature
CREATE TABLE IF NOT EXISTS `hero_galleries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_path` varchar(500) NOT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample hero gallery data
INSERT INTO `hero_galleries` (`title`, `description`, `image_path`, `display_order`, `is_active`) VALUES
('Selamat Datang di DPMD Kabupaten Bogor', 'Sistem Informasi Manajemen Desa Terpadu', 'placeholder-hero-1.jpg', 1, 1),
('Pemberdayaan Masyarakat Desa', 'Membangun desa yang mandiri dan sejahtera', 'placeholder-hero-2.jpg', 2, 1),
('Transparansi Pemerintahan Desa', 'Tata kelola pemerintahan yang baik dan akuntabel', 'placeholder-hero-3.jpg', 3, 1);
