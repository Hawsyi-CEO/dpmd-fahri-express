-- ================================================
-- CREATE DINAS USERS
-- Password untuk semua user: password
-- ================================================

-- Daftar Master Dinas yang sudah dibuat:
-- 1  = UPT_PU
-- 2  = DPTR
-- 3  = DPKP
-- 4  = UPT_DLH
-- 5  = DISKOMINFO
-- 6  = BAPPERIDA
-- 7  = DPMD
-- 8  = BPBD
-- 9  = DINKES
-- 10 = DINSOS
-- 11 = DP3AP2KB
-- 12 = DINKOPUKM
-- 13 = DKP
-- 14 = DISNAKER

-- Insert User Dinas Terkait
-- Password: password (bcrypt hash)
INSERT INTO users (name, email, password, role, dinas_id, is_active, created_at, updated_at) VALUES
('Admin UPT Pekerjaan Umum', 'upt.pu@bogorkab.go.id', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'dinas_terkait', 1, true, NOW(), NOW()),
('Admin Dinas Perumahan dan Tata Ruang', 'dptr@bogorkab.go.id', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'dinas_terkait', 2, true, NOW(), NOW()),
('Admin Dinas PU Kebersihan Pertamanan', 'dpkp@bogorkab.go.id', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'dinas_terkait', 3, true, NOW(), NOW()),
('Admin UPT Dinas Lingkungan Hidup', 'upt.dlh@bogorkab.go.id', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'dinas_terkait', 4, true, NOW(), NOW()),
('Admin Dinas Kominfo', 'diskominfo@bogorkab.go.id', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'dinas_terkait', 5, true, NOW(), NOW()),
('Admin Bappeda', 'bapperida@bogorkab.go.id', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'dinas_terkait', 6, true, NOW(), NOW()),
('Admin DPMD', 'dpmd@bogorkab.go.id', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'dinas_terkait', 7, true, NOW(), NOW()),
('Admin BPBD', 'bpbd@bogorkab.go.id', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'dinas_terkait', 8, true, NOW(), NOW()),
('Admin Dinas Kesehatan', 'dinkes@bogorkab.go.id', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'dinas_terkait', 9, true, NOW(), NOW()),
('Admin Dinas Sosial', 'dinsos@bogorkab.go.id', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'dinas_terkait', 10, true, NOW(), NOW()),
('Admin DP3AP2KB', 'dp3ap2kb@bogorkab.go.id', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'dinas_terkait', 11, true, NOW(), NOW()),
('Admin Dinas Koperasi UKM', 'dinkopukm@bogorkab.go.id', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'dinas_terkait', 12, true, NOW(), NOW()),
('Admin Dinas Ketahanan Pangan', 'dkp@bogorkab.go.id', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'dinas_terkait', 13, true, NOW(), NOW()),
('Admin Dinas Tenaga Kerja', 'disnaker@bogorkab.go.id', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'dinas_terkait', 14, true, NOW(), NOW());

-- Verifikasi user yang sudah dibuat
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.dinas_id,
    md.kode_dinas,
    md.nama_dinas,
    md.singkatan,
    u.is_active
FROM users u
LEFT JOIN master_dinas md ON u.dinas_id = md.id
WHERE u.role = 'dinas_terkait'
ORDER BY u.dinas_id;

-- Verifikasi mapping kegiatan dengan dinas
SELECT 
    bmk.id,
    bmk.jenis_kegiatan,
    bmk.nama_kegiatan,
    bmk.dinas_terkait,
    GROUP_CONCAT(md.singkatan SEPARATOR ', ') as nama_dinas
FROM bankeu_master_kegiatan bmk
LEFT JOIN master_dinas md ON FIND_IN_SET(md.kode_dinas, bmk.dinas_terkait) > 0
GROUP BY bmk.id
ORDER BY bmk.jenis_kegiatan, bmk.id;
