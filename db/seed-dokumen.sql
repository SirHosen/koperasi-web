-- Add document records for sample loans
INSERT INTO dokumen_pinjaman (id, pinjaman_id, jenis_dokumen, nama_file, path_file, ukuran_file, status, catatan, uploaded_at) VALUES
-- Budi's loan documents
(UUID(), 'P-20250923-001', 'KTP', 'ktp_budi.pdf', 'uploads/documents/ktp_budi_20250923.pdf', 1240567, 'menunggu', NULL, '2025-09-23 09:15:03'),
(UUID(), 'P-20250923-001', 'Slip Gaji', 'slip_gaji_budi_agustus.pdf', 'uploads/documents/slip_gaji_budi_20250923.pdf', 987325, 'menunggu', NULL, '2025-09-23 09:15:03'),
(UUID(), 'P-20250923-001', 'Foto Rumah', 'rumah_budi.jpg', 'uploads/documents/rumah_budi_20250923.jpg', 2456890, 'menunggu', NULL, '2025-09-23 09:15:03'),

-- Dewi's loan documents
(UUID(), 'P-20250923-002', 'KTP', 'ktp_dewi.pdf', 'uploads/documents/ktp_dewi_20250923.pdf', 1102345, 'menunggu', NULL, '2025-09-23 10:22:17'),
(UUID(), 'P-20250923-002', 'SIUP', 'siup_dewi.pdf', 'uploads/documents/siup_dewi_20250923.pdf', 1567890, 'menunggu', NULL, '2025-09-23 10:22:17'),
(UUID(), 'P-20250923-002', 'Laporan Keuangan', 'laporan_keuangan_dewi.pdf', 'uploads/documents/laporan_keuangan_dewi_20250923.pdf', 2345678, 'menunggu', NULL, '2025-09-23 10:22:17'),
(UUID(), 'P-20250923-002', 'Foto Usaha', 'foto_usaha_dewi.jpg', 'uploads/documents/foto_usaha_dewi_20250923.jpg', 3456789, 'menunggu', NULL, '2025-09-23 10:22:17'),

-- Ahmad's loan documents
(UUID(), 'P-20250923-003', 'KTP', 'ktp_ahmad.pdf', 'uploads/documents/ktp_ahmad_20250923.pdf', 1078234, 'menunggu', NULL, '2025-09-23 11:45:30'),
(UUID(), 'P-20250923-003', 'Slip Gaji', 'slip_gaji_ahmad_agustus.pdf', 'uploads/documents/slip_gaji_ahmad_20250923.pdf', 876543, 'menunggu', NULL, '2025-09-23 11:45:30'),
(UUID(), 'P-20250923-003', 'Surat Keterangan Kuliah', 'surat_kuliah_ahmad.pdf', 'uploads/documents/surat_kuliah_ahmad_20250923.pdf', 567890, 'menunggu', NULL, '2025-09-23 11:45:30'),

-- Siti's loan documents
(UUID(), 'P-20250923-004', 'KTP', 'ktp_siti.pdf', 'uploads/documents/ktp_siti_20250923.pdf', 1023456, 'menunggu', NULL, '2025-09-23 13:12:55'),
(UUID(), 'P-20250923-004', 'Slip Gaji', 'slip_gaji_siti_agustus.pdf', 'uploads/documents/slip_gaji_siti_20250923.pdf', 945678, 'menunggu', NULL, '2025-09-23 13:12:55'),
(UUID(), 'P-20250923-004', 'Spesifikasi Laptop', 'spek_laptop_siti.pdf', 'uploads/documents/spek_laptop_siti_20250923.pdf', 345678, 'menunggu', NULL, '2025-09-23 13:12:55'),

-- Rudi's loan documents
(UUID(), 'P-20250923-005', 'KTP', 'ktp_rudi.pdf', 'uploads/documents/ktp_rudi_20250923.pdf', 1123456, 'menunggu', NULL, '2025-09-23 14:30:10'),
(UUID(), 'P-20250923-005', 'SIUP', 'siup_rudi.pdf', 'uploads/documents/siup_rudi_20250923.pdf', 1678901, 'menunggu', NULL, '2025-09-23 14:30:10'),
(UUID(), 'P-20250923-005', 'Laporan Keuangan', 'laporan_keuangan_rudi.pdf', 'uploads/documents/laporan_keuangan_rudi_20250923.pdf', 2456789, 'menunggu', NULL, '2025-09-23 14:30:10'),
(UUID(), 'P-20250923-005', 'Foto Toko', 'foto_toko_rudi.jpg', 'uploads/documents/foto_toko_rudi_20250923.jpg', 3567890, 'menunggu', NULL, '2025-09-23 14:30:10'),
(UUID(), 'P-20250923-005', 'RAB Renovasi', 'rab_renovasi_toko_rudi.pdf', 'uploads/documents/rab_renovasi_rudi_20250923.pdf', 1234567, 'menunggu', NULL, '2025-09-23 14:30:10'),

-- Lia's loan documents
(UUID(), 'P-20250923-006', 'KTP', 'ktp_lia.pdf', 'uploads/documents/ktp_lia_20250923.pdf', 967890, 'menunggu', NULL, '2025-09-23 15:05:22'),
(UUID(), 'P-20250923-006', 'Slip Gaji', 'slip_gaji_lia_agustus.pdf', 'uploads/documents/slip_gaji_lia_20250923.pdf', 876543, 'menunggu', NULL, '2025-09-23 15:05:22'),
(UUID(), 'P-20250923-006', 'Surat Keterangan Sakit', 'surat_sakit_lia.pdf', 'uploads/documents/surat_sakit_lia_20250923.pdf', 567890, 'menunggu', NULL, '2025-09-23 15:05:22'),

-- Doni's loan documents
(UUID(), 'P-20250923-007', 'KTP', 'ktp_doni.pdf', 'uploads/documents/ktp_doni_20250923.pdf', 1023456, 'menunggu', NULL, '2025-09-23 16:20:05'),
(UUID(), 'P-20250923-007', 'Slip Gaji', 'slip_gaji_doni_agustus.pdf', 'uploads/documents/slip_gaji_doni_20250923.pdf', 923456, 'menunggu', NULL, '2025-09-23 16:20:05'),
(UUID(), 'P-20250923-007', 'Brosur Motor', 'brosur_motor_doni.pdf', 'uploads/documents/brosur_motor_doni_20250923.pdf', 434567, 'menunggu', NULL, '2025-09-23 16:20:05');

-- Add a few verified documents as examples
UPDATE dokumen_pinjaman SET status = 'diterima', catatan = 'Dokumen lengkap dan valid' WHERE pinjaman_id = 'P-20250923-001' AND jenis_dokumen = 'KTP';
UPDATE dokumen_pinjaman SET status = 'diterima', catatan = 'Slip gaji sesuai dengan pengajuan' WHERE pinjaman_id = 'P-20250923-001' AND jenis_dokumen = 'Slip Gaji';
UPDATE dokumen_pinjaman SET status = 'ditolak', catatan = 'Foto tidak jelas, mohon kirim ulang dengan resolusi lebih tinggi' WHERE pinjaman_id = 'P-20250923-001' AND jenis_dokumen = 'Foto Rumah';

UPDATE dokumen_pinjaman SET status = 'diterima', catatan = 'Dokumen KTP valid' WHERE pinjaman_id = 'P-20250923-002' AND jenis_dokumen = 'KTP';
UPDATE dokumen_pinjaman SET status = 'ditolak', catatan = 'SIUP sudah kadaluarsa, mohon lampirkan yang terbaru' WHERE pinjaman_id = 'P-20250923-002' AND jenis_dokumen = 'SIUP';