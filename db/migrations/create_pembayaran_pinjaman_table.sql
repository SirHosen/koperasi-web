-- Migration: Create pembayaran_pinjaman table
-- Date: 2025-01-01

CREATE TABLE IF NOT EXISTS pembayaran_pinjaman (
  id VARCHAR(36) PRIMARY KEY,
  loan_id VARCHAR(36) NOT NULL,
  anggota_id VARCHAR(36) NOT NULL,
  jumlah_bayar DECIMAL(15,2) NOT NULL,
  tanggal_bayar DATE NOT NULL,
  metode_pembayaran ENUM('transfer', 'tunai', 'auto_debit') DEFAULT 'transfer',
  nomor_referensi VARCHAR(100),
  bukti_transfer VARCHAR(255),
  keterangan TEXT,
  status ENUM('menunggu', 'diverifikasi', 'ditolak') DEFAULT 'menunggu',
  catatan_verifikasi TEXT,
  verified_by VARCHAR(36),
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (loan_id) REFERENCES pinjaman(id) ON DELETE CASCADE,
  FOREIGN KEY (anggota_id) REFERENCES anggota(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_loan_id (loan_id),
  INDEX idx_anggota_id (anggota_id),
  INDEX idx_status (status),
  INDEX idx_tanggal_bayar (tanggal_bayar)
);

-- Add comment to table
ALTER TABLE pembayaran_pinjaman COMMENT = 'Table to store manual loan payment submissions from members';