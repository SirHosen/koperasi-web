-- Migration: Create user sessions table for secure token management
-- This table stores refresh tokens securely with session management

USE koperasi_db;

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  refresh_token_hash VARCHAR(255) NOT NULL,
  session_id VARCHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_session (user_id, session_id),
  INDEX idx_session_id (session_id),
  INDEX idx_expires_at (expires_at)
);

-- Add indexes for performance
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Add cleanup for expired sessions (optional stored procedure)
DELIMITER //
CREATE PROCEDURE CleanupExpiredSessions()
BEGIN
  DELETE FROM user_sessions WHERE expires_at < NOW();
END//
DELIMITER ;

-- Create event to automatically cleanup expired sessions every hour
CREATE EVENT IF NOT EXISTS cleanup_expired_sessions
ON SCHEDULE EVERY 1 HOUR
DO
  CALL CleanupExpiredSessions();