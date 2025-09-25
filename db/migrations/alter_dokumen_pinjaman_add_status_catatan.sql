-- Migration: Add status and catatan fields to dokumen_pinjaman table
USE koperasi_db;

-- Add status field (default to 'menunggu')
ALTER TABLE dokumen_pinjaman ADD COLUMN status ENUM('menunggu', 'diterima', 'ditolak') NOT NULL DEFAULT 'menunggu';

-- Add catatan field for verification notes
ALTER TABLE dokumen_pinjaman ADD COLUMN catatan TEXT;

-- Update timestamp to track verification changes
ALTER TABLE dokumen_pinjaman ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;