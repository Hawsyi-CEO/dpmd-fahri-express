-- Add Kepala Dinas User
-- Password: kepaladinas123 (hashed with bcrypt)

INSERT INTO `users` (`name`, `email`, `password`, `role`, `created_at`, `updated_at`)
VALUES (
  'Kepala Dinas DPMD',
  'kepaladinas@dpmd.bogorkab.go.id',
  '$2y$12$UWX0.c5TRc.ozBSNOd.k9eLHsOWKMGvHeALkZ3mjQPRqu78s709Ly',
  'kepala_dinas',
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  `name` = 'Kepala Dinas DPMD',
  `role` = 'kepala_dinas',
  `updated_at` = NOW();
