-- Koperasi Simpan Pinjam Demo Accounts
USE koperasi_db;

-- Demo user accounts
INSERT INTO users (id, username, password, email, role, name, is_active) VALUES
-- Anggota demo
(UUID(), 'anggota', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'anggota@demo.id', 'anggota', 'Demo Anggota', 1),

-- Pengurus demo 
(UUID(), 'pengurus', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pengurus@demo.id', 'pengurus', 'Demo Pengurus', 1),

-- Pengawas demo
(UUID(), 'pengawas', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pengawas@demo.id', 'pengawas', 'Demo Pengawas', 1);

-- Get user IDs for referencing in other tables
SET @anggota_id = (SELECT id FROM users WHERE username = 'anggota');
SET @anggota_uuid = UUID();

-- Create anggota record
INSERT INTO anggota (id, user_id, nomor_anggota, nik, alamat, telepon, tanggal_bergabung, status_aktif) VALUES
(@anggota_uuid, @anggota_id, 'A-2025-001', '1234567890123456', 'Jl. Demo No. 123, Kota Demo', '081234567890', CURDATE(), true);

-- Create simpanan pokok
INSERT INTO simpanan (id, anggota_id, jenis, jumlah, tanggal, status, keterangan) VALUES
(UUID(), @anggota_uuid, 'pokok', 100000, CURDATE(), 'disetujui', 'Simpanan pokok demo');

-- Create simpanan wajib
INSERT INTO simpanan (id, anggota_id, jenis, jumlah, tanggal, status, keterangan) VALUES
(UUID(), @anggota_uuid, 'wajib', 50000, CURDATE(), 'disetujui', 'Simpanan wajib bulan ini');

-- Insert activity logs
INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, description, ip_address) VALUES
(UUID(), @anggota_id, 'login', 'user', @anggota_id, 'Demo user logged in', '127.0.0.1');