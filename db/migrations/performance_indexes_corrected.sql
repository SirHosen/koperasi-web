-- Performance Optimization: Database Indexes (Corrected for actual schema)
-- Run this script to add indexes for better query performance

-- 1. Indexes for frequently used WHERE clauses
CREATE INDEX IF NOT EXISTS idx_anggota_user_id ON anggota(user_id);
CREATE INDEX IF NOT EXISTS idx_anggota_status_aktif ON anggota(status_aktif);
CREATE INDEX IF NOT EXISTS idx_anggota_nik ON anggota(nik);
CREATE INDEX IF NOT EXISTS idx_anggota_nomor_anggota ON anggota(nomor_anggota);

-- 2. Indexes for simpanan queries (columns confirmed)
CREATE INDEX IF NOT EXISTS idx_simpanan_anggota_id ON simpanan(anggota_id);
CREATE INDEX IF NOT EXISTS idx_simpanan_status ON simpanan(status);
CREATE INDEX IF NOT EXISTS idx_simpanan_tanggal ON simpanan(tanggal);
CREATE INDEX IF NOT EXISTS idx_simpanan_jenis ON simpanan(jenis);
CREATE INDEX IF NOT EXISTS idx_simpanan_anggota_status ON simpanan(anggota_id, status);
CREATE INDEX IF NOT EXISTS idx_simpanan_anggota_tanggal ON simpanan(anggota_id, tanggal DESC);

-- 3. Indexes for pinjaman queries (using correct column names)
CREATE INDEX IF NOT EXISTS idx_pinjaman_anggota_id ON pinjaman(anggota_id);
CREATE INDEX IF NOT EXISTS idx_pinjaman_status ON pinjaman(status_pinjaman);
CREATE INDEX IF NOT EXISTS idx_pinjaman_arrival_time ON pinjaman(arrival_time);
CREATE INDEX IF NOT EXISTS idx_pinjaman_anggota_status ON pinjaman(anggota_id, status_pinjaman);
CREATE INDEX IF NOT EXISTS idx_pinjaman_status_arrival ON pinjaman(status_pinjaman, arrival_time DESC);

-- 4. Indexes for user authentication
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- 5. Indexes for FCFS queue optimization
CREATE INDEX IF NOT EXISTS idx_pinjaman_posisi_antrean ON pinjaman(posisi_antrean);
CREATE INDEX IF NOT EXISTS idx_pinjaman_waiting_time ON pinjaman(waiting_time);
CREATE INDEX IF NOT EXISTS idx_pinjaman_burst_time ON pinjaman(burst_time);

-- 6. Composite indexes for common query patterns
-- Anggota with user info
CREATE INDEX IF NOT EXISTS idx_anggota_user_composite ON anggota(user_id, status_aktif);

-- Simpanan summary queries
CREATE INDEX IF NOT EXISTS idx_simpanan_summary ON simpanan(anggota_id, jenis, status, tanggal);

-- Pinjaman verification queries  
CREATE INDEX IF NOT EXISTS idx_pinjaman_verification ON pinjaman(status_pinjaman, arrival_time, anggota_id);

-- Monthly/yearly reporting
CREATE INDEX IF NOT EXISTS idx_simpanan_monthly ON simpanan(YEAR(tanggal), MONTH(tanggal), status);
CREATE INDEX IF NOT EXISTS idx_pinjaman_monthly ON pinjaman(YEAR(arrival_time), MONTH(arrival_time), status_pinjaman);

-- 7. Full-text search indexes (for MySQL 5.7+)
-- Check if columns exist first
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'koperasi_db' 
     AND TABLE_NAME = 'anggota' 
     AND COLUMN_NAME IN ('name', 'email', 'alamat')) = 3,
    'ALTER TABLE anggota ADD FULLTEXT(name, email, alamat)',
    'SELECT "Skipping anggota fulltext - columns not found"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 8. Analyze tables to update statistics
ANALYZE TABLE anggota;
ANALYZE TABLE users;
ANALYZE TABLE simpanan;
ANALYZE TABLE pinjaman;

-- 9. Show existing indexes
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS COLUMNS,
    INDEX_TYPE,
    NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'koperasi_db'
  AND TABLE_NAME IN ('anggota', 'simpanan', 'pinjaman', 'users')
GROUP BY TABLE_NAME, INDEX_NAME
ORDER BY TABLE_NAME, INDEX_NAME;

-- Note: Run EXPLAIN on your critical queries to verify index usage:
-- EXPLAIN SELECT * FROM simpanan WHERE anggota_id = 'xxx' AND status = 'diverifikasi';
-- EXPLAIN SELECT * FROM pinjaman WHERE anggota_id = 'xxx' AND status_pinjaman = 'antrean';