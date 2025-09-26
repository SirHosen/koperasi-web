-- Performance Optimization: Essential Database Indexes
-- Simple and effective indexes for the koperasi application

-- 1. Basic indexes for anggota table
CREATE INDEX IF NOT EXISTS idx_anggota_user_id ON anggota(user_id);
CREATE INDEX IF NOT EXISTS idx_anggota_status_aktif ON anggota(status_aktif);
CREATE INDEX IF NOT EXISTS idx_anggota_nik ON anggota(nik);

-- 2. Essential indexes for simpanan table
CREATE INDEX IF NOT EXISTS idx_simpanan_anggota_id ON simpanan(anggota_id);
CREATE INDEX IF NOT EXISTS idx_simpanan_status ON simpanan(status);
CREATE INDEX IF NOT EXISTS idx_simpanan_tanggal ON simpanan(tanggal);
CREATE INDEX IF NOT EXISTS idx_simpanan_jenis ON simpanan(jenis);

-- 3. Critical indexes for pinjaman table
CREATE INDEX IF NOT EXISTS idx_pinjaman_anggota_id ON pinjaman(anggota_id);
CREATE INDEX IF NOT EXISTS idx_pinjaman_status ON pinjaman(status_pinjaman);
CREATE INDEX IF NOT EXISTS idx_pinjaman_arrival_time ON pinjaman(arrival_time);
CREATE INDEX IF NOT EXISTS idx_pinjaman_posisi_antrean ON pinjaman(posisi_antrean);

-- 4. User authentication indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 5. Composite indexes for frequent query patterns
CREATE INDEX IF NOT EXISTS idx_simpanan_anggota_status ON simpanan(anggota_id, status);
CREATE INDEX IF NOT EXISTS idx_pinjaman_anggota_status ON pinjaman(anggota_id, status_pinjaman);

-- 6. Analyze tables to update statistics
ANALYZE TABLE anggota;
ANALYZE TABLE users;
ANALYZE TABLE simpanan;
ANALYZE TABLE pinjaman;

-- 7. Show current indexes
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'koperasi_db'
  AND TABLE_NAME IN ('anggota', 'simpanan', 'pinjaman', 'users')
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;