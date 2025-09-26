-- Performance Optimization: Database Indexes
-- Run this script to add indexes for better query performance

-- 1. Indexes for frequently used WHERE clauses
CREATE INDEX IF NOT EXISTS idx_anggota_user_id ON anggota(user_id);
CREATE INDEX IF NOT EXISTS idx_anggota_status_aktif ON anggota(status_aktif);
CREATE INDEX IF NOT EXISTS idx_anggota_nik ON anggota(nik);
CREATE INDEX IF NOT EXISTS idx_anggota_nomor_anggota ON anggota(nomor_anggota);

-- 2. Indexes for simpanan queries
CREATE INDEX IF NOT EXISTS idx_simpanan_anggota_id ON simpanan(anggota_id);
CREATE INDEX IF NOT EXISTS idx_simpanan_status ON simpanan(status);
CREATE INDEX IF NOT EXISTS idx_simpanan_tanggal ON simpanan(tanggal);
CREATE INDEX IF NOT EXISTS idx_simpanan_jenis ON simpanan(jenis);
CREATE INDEX IF NOT EXISTS idx_simpanan_anggota_status ON simpanan(anggota_id, status);
CREATE INDEX IF NOT EXISTS idx_simpanan_anggota_tanggal ON simpanan(anggota_id, tanggal DESC);

-- 3. Indexes for pinjaman queries
CREATE INDEX IF NOT EXISTS idx_pinjaman_anggota_id ON pinjaman(anggota_id);
CREATE INDEX IF NOT EXISTS idx_pinjaman_status ON pinjaman(status);
CREATE INDEX IF NOT EXISTS idx_pinjaman_tanggal_pengajuan ON pinjaman(tanggal_pengajuan);
CREATE INDEX IF NOT EXISTS idx_pinjaman_anggota_status ON pinjaman(anggota_id, status);
CREATE INDEX IF NOT EXISTS idx_pinjaman_status_tanggal ON pinjaman(status, tanggal_pengajuan DESC);

-- 4. Indexes for user authentication
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- 5. Indexes for document queries
CREATE INDEX IF NOT EXISTS idx_dokumen_anggota_id ON dokumen_pinjaman(anggota_id);
CREATE INDEX IF NOT EXISTS idx_dokumen_pinjaman_id ON dokumen_pinjaman(pinjaman_id);
CREATE INDEX IF NOT EXISTS idx_dokumen_status ON dokumen_pinjaman(status);

-- 6. Indexes for activity logging (if exists)
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON activity_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);

-- 7. Indexes for FCFS queue
CREATE INDEX IF NOT EXISTS idx_fcfs_queue_status ON fcfs_queue(status);
CREATE INDEX IF NOT EXISTS idx_fcfs_queue_priority ON fcfs_queue(priority_score);
CREATE INDEX IF NOT EXISTS idx_fcfs_queue_created ON fcfs_queue(created_at);

-- 8. Composite indexes for common query patterns
-- Anggota with user info
CREATE INDEX IF NOT EXISTS idx_anggota_user_composite ON anggota(user_id, status_aktif);

-- Simpanan summary queries
CREATE INDEX IF NOT EXISTS idx_simpanan_summary ON simpanan(anggota_id, jenis, status, tanggal);

-- Pinjaman verification queries  
CREATE INDEX IF NOT EXISTS idx_pinjaman_verification ON pinjaman(status, tanggal_pengajuan, anggota_id);

-- Monthly/yearly reporting
CREATE INDEX IF NOT EXISTS idx_simpanan_monthly ON simpanan(YEAR(tanggal), MONTH(tanggal), status);
CREATE INDEX IF NOT EXISTS idx_pinjaman_monthly ON pinjaman(YEAR(tanggal_pengajuan), MONTH(tanggal_pengajuan), status);

-- 9. Full-text search indexes (for MySQL 5.7+)
-- For member search functionality
ALTER TABLE anggota ADD FULLTEXT(name, email, alamat);
ALTER TABLE users ADD FULLTEXT(name, username);

-- 10. Analyze tables to update statistics
ANALYZE TABLE anggota;
ANALYZE TABLE users;
ANALYZE TABLE simpanan;
ANALYZE TABLE pinjaman;
ANALYZE TABLE dokumen_pinjaman;

-- 11. Show index usage for verification
-- Run these queries to check if indexes are being used:
-- EXPLAIN SELECT * FROM simpanan WHERE anggota_id = 1 AND status = 'diverifikasi';
-- EXPLAIN SELECT * FROM pinjaman WHERE anggota_id = 1 AND status = 'pending';
-- EXPLAIN SELECT a.*, u.username FROM anggota a JOIN users u ON a.user_id = u.id WHERE a.status_aktif = 1;

-- 12. Performance monitoring views (optional)
CREATE OR REPLACE VIEW v_slow_queries AS
SELECT 
    DIGEST_TEXT as query_pattern,
    COUNT_STAR as exec_count,
    AVG_TIMER_WAIT/1000000000 as avg_time_ms,
    MAX_TIMER_WAIT/1000000000 as max_time_ms,
    SUM_TIMER_WAIT/1000000000 as total_time_ms
FROM performance_schema.events_statements_summary_by_digest 
WHERE AVG_TIMER_WAIT > 100000000  -- Queries taking more than 100ms
ORDER BY AVG_TIMER_WAIT DESC
LIMIT 20;

-- 13. Index size monitoring
CREATE OR REPLACE VIEW v_index_usage AS
SELECT 
    TABLE_SCHEMA,
    TABLE_NAME,
    INDEX_NAME,
    ROUND(STAT_VALUE * @@innodb_page_size / 1024 / 1024, 2) AS size_mb
FROM INFORMATION_SCHEMA.INNODB_SYS_TABLESTATS
WHERE TABLE_SCHEMA = 'koperasi_db'
ORDER BY size_mb DESC;

-- Note: After running this script, monitor query performance using:
-- 1. EXPLAIN statements for critical queries
-- 2. MySQL slow query log
-- 3. Performance schema tables
-- 4. Regular ANALYZE TABLE operations

-- Remember to test in development first before applying to production!