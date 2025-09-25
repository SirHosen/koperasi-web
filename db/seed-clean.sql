-- Koperasi Simpan Pinjam Clean Seed Data
USE koperasi_db;

-- Insert essential users only: 1 admin and 1 pengawas
-- Passwords are set to 'password123' (hashed)
INSERT INTO users (id, username, password, email, role, name, is_active) VALUES
-- Admin user
(UUID(), 'admin1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@koperasi.id', 'pengurus', 'Administrator', 1),

-- Pengawas user
(UUID(), 'pengawas1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pengawas@koperasi.id', 'pengawas', 'Pengawas Koperasi', 1);

-- Get user IDs for referencing in other tables
SET @admin1_id = (SELECT id FROM users WHERE username = 'admin1');
SET @pengawas1_id = (SELECT id FROM users WHERE username = 'pengawas1');

-- Insert system settings for FCFS parameters
INSERT INTO system_settings (id, setting_key, setting_value, setting_type, description) VALUES
(UUID(), 'fcfs_enabled', 'true', 'boolean', 'Whether FCFS queue system is enabled'),
(UUID(), 'fcfs_auto_process', 'true', 'boolean', 'Whether to automatically process next item in queue'),
(UUID(), 'fcfs_max_queue_display', '10', 'integer', 'Maximum number of queue items to display'),
(UUID(), 'loan_interest_rate', '1.5', 'decimal', 'Default loan interest rate per month'),
(UUID(), 'mandatory_savings_amount', '50000', 'integer', 'Monthly mandatory savings amount');

-- Insert activity logs for admin login
INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, description, ip_address) VALUES
(UUID(), @admin1_id, 'system_setup', 'system', NULL, 'Koperasi system initialized with clean data', '127.0.0.1');

-- Note: No member data is inserted here. Members will register themselves through the registration system.
-- This ensures the system starts clean with only essential administrative accounts.