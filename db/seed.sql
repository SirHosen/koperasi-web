-- Koperasi Simpan Pinjam Sample Data for Development and Testing
USE koperasi_db;

-- Insert sample users for each role
-- Passwords are set to 'password123' (hashed)
INSERT INTO users (id, username, password, email, role, name, is_active) VALUES
-- Pengurus (Admin) users
(UUID(), 'admin1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin1@koperasi.id', 'pengurus', 'Admin Pertama', 1),
(UUID(), 'admin2', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin2@koperasi.id', 'pengurus', 'Admin Kedua', 1),

-- Pengawas (Supervisor) users
(UUID(), 'pengawas1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pengawas1@koperasi.id', 'pengawas', 'Pengawas Pertama', 1),
(UUID(), 'pengawas2', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pengawas2@koperasi.id', 'pengawas', 'Pengawas Kedua', 1),

-- Anggota (Member) users
(UUID(), 'budi', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'budi@gmail.com', 'anggota', 'Budi Santoso', 1),
(UUID(), 'dewi', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'dewi@gmail.com', 'anggota', 'Dewi Lestari', 1),
(UUID(), 'ahmad', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ahmad@gmail.com', 'anggota', 'Ahmad Fadli', 1),
(UUID(), 'siti', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'siti@gmail.com', 'anggota', 'Siti Nurhaliza', 1),
(UUID(), 'rudi', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'rudi@gmail.com', 'anggota', 'Rudi Hermawan', 1),
(UUID(), 'lia', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lia@gmail.com', 'anggota', 'Lia Indrawati', 1),
(UUID(), 'doni', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doni@gmail.com', 'anggota', 'Doni Kusuma', 1);

-- Get user IDs for referencing in other tables
SET @admin1_id = (SELECT id FROM users WHERE username = 'admin1');
SET @admin2_id = (SELECT id FROM users WHERE username = 'admin2');
SET @pengawas1_id = (SELECT id FROM users WHERE username = 'pengawas1');
SET @pengawas2_id = (SELECT id FROM users WHERE username = 'pengawas2');
SET @budi_id = (SELECT id FROM users WHERE username = 'budi');
SET @dewi_id = (SELECT id FROM users WHERE username = 'dewi');
SET @ahmad_id = (SELECT id FROM users WHERE username = 'ahmad');
SET @siti_id = (SELECT id FROM users WHERE username = 'siti');
SET @rudi_id = (SELECT id FROM users WHERE username = 'rudi');
SET @lia_id = (SELECT id FROM users WHERE username = 'lia');
SET @doni_id = (SELECT id FROM users WHERE username = 'doni');

-- Insert sample anggota (members)
INSERT INTO anggota (id, user_id, nomor_anggota, nik, alamat, telepon, tanggal_bergabung, status_aktif) VALUES
(UUID(), @budi_id, 'A-20230056', '3201122909800001', 'Jl. Merdeka No. 123, Jakarta Selatan', '08123456789', '2023-01-15', 1),
(UUID(), @dewi_id, 'A-20210034', '3201122001850002', 'Jl. Mawar No. 45, Jakarta Pusat', '08234567890', '2021-03-22', 1),
(UUID(), @ahmad_id, 'A-20230001', '3201120505790003', 'Jl. Cempaka No. 67, Jakarta Timur', '08345678901', '2023-01-05', 1),
(UUID(), @siti_id, 'A-20220078', '3201122112830004', 'Jl. Melati No. 89, Jakarta Barat', '08456789012', '2022-05-18', 1),
(UUID(), @rudi_id, 'A-20210092', '3201120708760005', 'Jl. Anggrek No. 112, Jakarta Utara', '08567890123', '2021-06-30', 1),
(UUID(), @lia_id, 'A-20240012', '3201122510910006', 'Jl. Dahlia No. 134, Bekasi', '08678901234', '2024-01-10', 1),
(UUID(), @doni_id, 'A-20240045', '3201121503880007', 'Jl. Tulip No. 156, Depok', '08789012345', '2024-03-05', 1);

-- Get anggota IDs
SET @budi_anggota_id = (SELECT id FROM anggota WHERE nomor_anggota = 'A-20230056');
SET @dewi_anggota_id = (SELECT id FROM anggota WHERE nomor_anggota = 'A-20210034');
SET @ahmad_anggota_id = (SELECT id FROM anggota WHERE nomor_anggota = 'A-20230001');
SET @siti_anggota_id = (SELECT id FROM anggota WHERE nomor_anggota = 'A-20220078');
SET @rudi_anggota_id = (SELECT id FROM anggota WHERE nomor_anggota = 'A-20210092');
SET @lia_anggota_id = (SELECT id FROM anggota WHERE nomor_anggota = 'A-20240012');
SET @doni_anggota_id = (SELECT id FROM anggota WHERE nomor_anggota = 'A-20240045');

-- Insert sample simpanan (savings)
-- Simpanan Pokok (one-time)
INSERT INTO simpanan (id, anggota_id, jenis, jumlah, tanggal, status, keterangan, diverifikasi_oleh) VALUES
(UUID(), @budi_anggota_id, 'pokok', 100000, '2023-01-15', 'diverifikasi', 'Simpanan pokok awal', @admin1_id),
(UUID(), @dewi_anggota_id, 'pokok', 100000, '2021-03-22', 'diverifikasi', 'Simpanan pokok awal', @admin1_id),
(UUID(), @ahmad_anggota_id, 'pokok', 100000, '2023-01-05', 'diverifikasi', 'Simpanan pokok awal', @admin1_id),
(UUID(), @siti_anggota_id, 'pokok', 100000, '2022-05-18', 'diverifikasi', 'Simpanan pokok awal', @admin2_id),
(UUID(), @rudi_anggota_id, 'pokok', 100000, '2021-06-30', 'diverifikasi', 'Simpanan pokok awal', @admin2_id),
(UUID(), @lia_anggota_id, 'pokok', 100000, '2024-01-10', 'diverifikasi', 'Simpanan pokok awal', @admin1_id),
(UUID(), @doni_anggota_id, 'pokok', 100000, '2024-03-05', 'diverifikasi', 'Simpanan pokok awal', @admin1_id);

-- Simpanan Wajib (monthly)
INSERT INTO simpanan (id, anggota_id, jenis, jumlah, tanggal, status, keterangan, diverifikasi_oleh) VALUES
-- Budi's monthly payments
(UUID(), @budi_anggota_id, 'wajib', 50000, '2023-01-15', 'diverifikasi', 'Simpanan wajib Jan 2023', @admin1_id),
(UUID(), @budi_anggota_id, 'wajib', 50000, '2023-02-15', 'diverifikasi', 'Simpanan wajib Feb 2023', @admin2_id),
(UUID(), @budi_anggota_id, 'wajib', 50000, '2023-03-15', 'diverifikasi', 'Simpanan wajib Mar 2023', @admin1_id),
-- Add more months as needed

-- Dewi's monthly payments
(UUID(), @dewi_anggota_id, 'wajib', 50000, '2021-03-22', 'diverifikasi', 'Simpanan wajib Mar 2021', @admin1_id),
(UUID(), @dewi_anggota_id, 'wajib', 50000, '2021-04-22', 'diverifikasi', 'Simpanan wajib Apr 2021', @admin2_id),
(UUID(), @dewi_anggota_id, 'wajib', 50000, '2021-05-22', 'diverifikasi', 'Simpanan wajib May 2021', @admin1_id),
-- Add more months as needed

-- Simpanan Sukarela (voluntary)
INSERT INTO simpanan (id, anggota_id, jenis, jumlah, tanggal, status, keterangan, diverifikasi_oleh) VALUES
(UUID(), @budi_anggota_id, 'sukarela', 500000, '2023-02-20', 'diverifikasi', 'Simpanan sukarela tambahan', @admin1_id),
(UUID(), @dewi_anggota_id, 'sukarela', 1000000, '2021-07-15', 'diverifikasi', 'Simpanan sukarela tambahan', @admin2_id),
(UUID(), @rudi_anggota_id, 'sukarela', 2500000, '2022-01-10', 'diverifikasi', 'Simpanan sukarela tambahan', @admin1_id);

-- Insert sample pinjaman (loans) in queue (FCFS)
INSERT INTO pinjaman (id, anggota_id, jumlah, tenor, bunga, tujuan, arrival_time, status_pinjaman, posisi_antrean, burst_time) VALUES
('P-20250923-001', @budi_anggota_id, 5000000, 12, 1.5, 'Renovasi rumah', '2025-09-23 09:15:03', 'antrean', 1, 25),
('P-20250923-002', @dewi_anggota_id, 10000000, 24, 1.5, 'Modal usaha', '2025-09-23 10:22:17', 'antrean', 2, 40),
('P-20250923-003', @ahmad_anggota_id, 3000000, 12, 1.5, 'Biaya pendidikan', '2025-09-23 11:45:30', 'antrean', 3, 20),
('P-20250923-004', @siti_anggota_id, 7500000, 18, 1.5, 'Pembelian laptop', '2025-09-23 13:12:55', 'antrean', 4, 30),
('P-20250923-005', @rudi_anggota_id, 15000000, 36, 1.5, 'Renovasi toko', '2025-09-23 14:30:10', 'antrean', 5, 45),
('P-20250923-006', @lia_anggota_id, 2500000, 12, 1.5, 'Biaya kesehatan', '2025-09-23 15:05:22', 'antrean', 6, 15),
('P-20250923-007', @doni_anggota_id, 8000000, 24, 1.5, 'Pembelian sepeda motor', '2025-09-23 16:20:05', 'antrean', 7, 35);

-- Insert sample notifications
INSERT INTO notifications (id, user_id, title, message, is_read, type) VALUES
(UUID(), @budi_id, 'Pengingat Simpanan Wajib', 'Simpanan wajib Anda untuk bulan September 2025 belum dibayarkan.', 0, 'warning'),
(UUID(), @dewi_id, 'Status Pinjaman', 'Pengajuan pinjaman Anda telah masuk dalam antrean dan sedang diproses.', 0, 'info'),
(UUID(), @ahmad_id, 'RAT 2025', 'Rapat Anggota Tahunan akan diselenggarakan pada tanggal 15 Oktober 2025.', 0, 'info');

-- Insert system settings for FCFS parameters
INSERT INTO system_settings (id, setting_key, setting_value, setting_type, description) VALUES
(UUID(), 'fcfs_enabled', 'true', 'boolean', 'Whether FCFS queue system is enabled'),
(UUID(), 'fcfs_auto_process', 'true', 'boolean', 'Whether to automatically process next item in queue'),
(UUID(), 'fcfs_max_queue_display', '10', 'integer', 'Maximum number of queue items to display');

-- Insert activity logs for demonstration
INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, description, ip_address) VALUES
(UUID(), @admin1_id, 'login', 'user', @admin1_id, 'Admin logged in to the system', '192.168.1.100'),
(UUID(), @admin1_id, 'approve', 'pinjaman', 'P-20250922-001', 'Loan application approved', '192.168.1.100'),
(UUID(), @budi_id, 'apply', 'pinjaman', 'P-20250923-001', 'New loan application submitted', '192.168.1.101');