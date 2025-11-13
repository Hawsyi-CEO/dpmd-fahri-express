-- Add Kepala Dinas user
-- Password: kepaladinas123 (hashed with bcrypt)

INSERT INTO `users` (`name`, `email`, `password`, `role`, `kecamatan_id`, `desa_id`, `bidang_id`, `dinas_id`, `created_at`, `updated_at`)
VALUES 
('Kepala Dinas DPMD', 'kepaladinas@dpmd.bogorkab.go.id', '$2y$12$8KZg5sL.9Hn4VXb9vCE8zOQH5NZYKGcYJ.xD3qWZ8mF9pE1rT2jKu', 'kepala_dinas', NULL, NULL, NULL, NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
`name` = VALUES(`name`),
`password` = VALUES(`password`),
`role` = VALUES(`role`),
`updated_at` = NOW();
