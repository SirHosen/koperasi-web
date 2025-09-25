// db.js - Database connection configuration
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'koperasi_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log('Connected to MySQL database successfully!')
    connection.release()
    return true
  } catch (error) {
    console.error('Failed to connect to the database:', error)
    return false
  }
}

export { pool, testConnection }
