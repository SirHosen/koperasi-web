-- Koperasi Simpan Pinjam Database Schema

-- Drop existing database if exists
DROP DATABASE IF EXISTS koperasi_db;

-- Create database
CREATE DATABASE koperasi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE koperasi_db;

-- User Authentication Table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  role ENUM('anggota', 'pengurus', 'pengawas') NOT NULL DEFAULT 'anggota',
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Anggota (Member) Table
CREATE TABLE anggota (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  nomor_anggota VARCHAR(20) NOT NULL UNIQUE,
  nik VARCHAR(20) NOT NULL UNIQUE,
  alamat TEXT NOT NULL,
  telepon VARCHAR(20) NOT NULL,
  tanggal_bergabung DATE NOT NULL,
  status_aktif BOOLEAN NOT NULL DEFAULT TRUE,
  foto_profil VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Simpanan (Savings) Table
CREATE TABLE simpanan (
  id VARCHAR(36) PRIMARY KEY,
  anggota_id VARCHAR(36) NOT NULL,
  jenis ENUM('pokok', 'wajib', 'sukarela') NOT NULL,
  jumlah DECIMAL(15, 2) NOT NULL,
  tanggal DATE NOT NULL,
  metode_pembayaran VARCHAR(50),
  bukti_pembayaran VARCHAR(255),
  status ENUM('menunggu', 'diverifikasi', 'ditolak') NOT NULL DEFAULT 'menunggu',
  keterangan TEXT,
  diverifikasi_oleh VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (anggota_id) REFERENCES anggota(id) ON DELETE CASCADE,
  FOREIGN KEY (diverifikasi_oleh) REFERENCES users(id) ON DELETE SET NULL
);

-- Pengaturan Simpanan (Savings Settings) Table
CREATE TABLE pengaturan_simpanan (
  id INT PRIMARY KEY AUTO_INCREMENT,
  jenis ENUM('pokok', 'wajib', 'sukarela') NOT NULL,
  jumlah_minimal DECIMAL(15, 2) NOT NULL,
  persentase_bunga DECIMAL(5, 2),
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (jenis)
);

-- Pinjaman (Loan) Table
CREATE TABLE pinjaman (
  id VARCHAR(36) PRIMARY KEY,
  anggota_id VARCHAR(36) NOT NULL,
  jumlah DECIMAL(15, 2) NOT NULL,
  tenor INT NOT NULL COMMENT 'in months',
  bunga DECIMAL(5, 2) NOT NULL COMMENT 'in percentage',
  tujuan TEXT NOT NULL,
  arrival_time DATETIME NOT NULL,
  start_process_time DATETIME,
  finish_process_time DATETIME,
  status_pinjaman ENUM('antrean', 'verifikasi', 'disetujui', 'ditolak', 'pencairan', 'aktif', 'lunas') NOT NULL DEFAULT 'antrean',
  posisi_antrean INT,
  burst_time INT COMMENT 'estimated processing time in minutes',
  waiting_time INT COMMENT 'in minutes',
  catatan TEXT,
  diproses_oleh VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (anggota_id) REFERENCES anggota(id) ON DELETE CASCADE,
  FOREIGN KEY (diproses_oleh) REFERENCES users(id) ON DELETE SET NULL
);

-- Dokumen Pendukung Pinjaman (Loan Supporting Documents) Table
CREATE TABLE dokumen_pinjaman (
  id VARCHAR(36) PRIMARY KEY,
  pinjaman_id VARCHAR(36) NOT NULL,
  jenis_dokumen VARCHAR(100) NOT NULL,
  nama_file VARCHAR(255) NOT NULL,
  path_file VARCHAR(255) NOT NULL,
  ukuran_file INT NOT NULL,
  status ENUM('menunggu', 'diterima', 'ditolak') NOT NULL DEFAULT 'menunggu',
  catatan TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pinjaman_id) REFERENCES pinjaman(id) ON DELETE CASCADE
);

-- Verifikasi Pinjaman (Loan Verification) Table
CREATE TABLE verifikasi_pinjaman (
  id VARCHAR(36) PRIMARY KEY,
  pinjaman_id VARCHAR(36) NOT NULL,
  pengurus_id VARCHAR(36) NOT NULL,
  character_score INT,
  capacity_score INT,
  capital_score INT,
  collateral_score INT,
  condition_score INT,
  catatan TEXT,
  keputusan ENUM('disetujui', 'ditolak') NOT NULL,
  tanggal_verifikasi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pinjaman_id) REFERENCES pinjaman(id) ON DELETE CASCADE,
  FOREIGN KEY (pengurus_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Angsuran (Loan Installment) Table
CREATE TABLE angsuran (
  id VARCHAR(36) PRIMARY KEY,
  pinjaman_id VARCHAR(36) NOT NULL,
  anggota_id VARCHAR(36) NOT NULL,
  nomor_angsuran INT NOT NULL,
  jumlah_pokok DECIMAL(15, 2) NOT NULL,
  jumlah_bunga DECIMAL(15, 2) NOT NULL,
  total_bayar DECIMAL(15, 2) NOT NULL,
  tanggal_jatuh_tempo DATE NOT NULL,
  tanggal_bayar DATE,
  metode_pembayaran VARCHAR(50),
  bukti_pembayaran VARCHAR(255),
  status ENUM('belum', 'lunas', 'terlambat') NOT NULL DEFAULT 'belum',
  denda DECIMAL(15, 2) DEFAULT 0,
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pinjaman_id) REFERENCES pinjaman(id) ON DELETE CASCADE,
  FOREIGN KEY (anggota_id) REFERENCES anggota(id) ON DELETE CASCADE
);

-- SHU (Sisa Hasil Usaha) Table
CREATE TABLE shu (
  id VARCHAR(36) PRIMARY KEY,
  tahun INT NOT NULL,
  total_shu DECIMAL(15, 2) NOT NULL,
  persentase_jasa_simpanan DECIMAL(5, 2) NOT NULL,
  persentase_jasa_pinjaman DECIMAL(5, 2) NOT NULL,
  status ENUM('perhitungan', 'finalisasi', 'dibagikan') NOT NULL DEFAULT 'perhitungan',
  tanggal_perhitungan DATE NOT NULL,
  tanggal_pembagian DATE,
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (tahun)
);

-- SHU Anggota (Member's SHU) Table
CREATE TABLE shu_anggota (
  id VARCHAR(36) PRIMARY KEY,
  shu_id VARCHAR(36) NOT NULL,
  anggota_id VARCHAR(36) NOT NULL,
  tahun INT NOT NULL,
  jasa_simpanan DECIMAL(15, 2) NOT NULL,
  jasa_pinjaman DECIMAL(15, 2) NOT NULL,
  total_shu DECIMAL(15, 2) NOT NULL,
  persentase DECIMAL(5, 2) NOT NULL,
  status_pembayaran ENUM('belum', 'sudah') NOT NULL DEFAULT 'belum',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shu_id) REFERENCES shu(id) ON DELETE CASCADE,
  FOREIGN KEY (anggota_id) REFERENCES anggota(id) ON DELETE CASCADE,
  UNIQUE KEY (anggota_id, tahun)
);

-- Notification Table
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  type ENUM('info', 'warning', 'success', 'error') NOT NULL DEFAULT 'info',
  link VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Activity Log Table
CREATE TABLE activity_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(36),
  description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- System Settings Table
CREATE TABLE system_settings (
  id VARCHAR(36) PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Populate System Settings with default values
INSERT INTO system_settings (id, setting_key, setting_value, setting_type, description) VALUES
(UUID(), 'simpanan_pokok', '100000', 'decimal', 'Jumlah simpanan pokok untuk anggota baru'),
(UUID(), 'simpanan_wajib', '50000', 'decimal', 'Jumlah simpanan wajib bulanan'),
(UUID(), 'bunga_pinjaman', '1.5', 'decimal', 'Persentase bunga pinjaman per bulan'),
(UUID(), 'bunga_simpanan_sukarela', '0.5', 'decimal', 'Persentase bunga simpanan sukarela per bulan'),
(UUID(), 'denda_keterlambatan', '1', 'decimal', 'Persentase denda keterlambatan pembayaran pinjaman');

-- Create indexes for faster queries
CREATE INDEX idx_pinjaman_anggota_id ON pinjaman(anggota_id);
CREATE INDEX idx_pinjaman_status ON pinjaman(status_pinjaman);
CREATE INDEX idx_pinjaman_arrival ON pinjaman(arrival_time);
CREATE INDEX idx_simpanan_anggota_id ON simpanan(anggota_id);
CREATE INDEX idx_simpanan_jenis ON simpanan(jenis);
CREATE INDEX idx_angsuran_pinjaman_id ON angsuran(pinjaman_id);
CREATE INDEX idx_angsuran_status ON angsuran(status);
CREATE INDEX idx_notification_user_id ON notifications(user_id);
CREATE INDEX idx_activity_log_user_id ON activity_logs(user_id);
CREATE INDEX idx_shu_anggota_anggota_id ON shu_anggota(anggota_id);