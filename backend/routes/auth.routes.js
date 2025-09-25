// auth.routes.js - Authentication routes
import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { pool } from '../db.js'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

/**
 * Login route
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Username and password are required' })
    }

    // Get user from database
    const [users] = await pool.query(
      'SELECT id, username, password, email, role, name, is_active FROM users WHERE username = ?',
      [username],
    )

    if (users.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' })
    }

    const user = users[0]

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ status: 'error', message: 'Account is disabled' })
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' })
    }

    // Create token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET || 'default_secret_change_this',
      { expiresIn: '8h' },
    )

    // Update last login time
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id])

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, description, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), user.id, 'login', 'user', user.id, 'User logged in', req.ip],
    )

    // Return token and user info
    return res.status(200).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          name: user.name,
        },
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

/**
 * Register route
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, name, nik, alamat, telepon } = req.body

    if (!username || !password || !email || !name || !nik || !alamat || !telepon) {
      return res.status(400).json({ status: 'error', message: 'All fields are required' })
    }

    // Check if username or email already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email],
    )

    if (existingUsers.length > 0) {
      return res.status(409).json({ status: 'error', message: 'Username or email already exists' })
    }

    // Check if NIK already exists
    const [existingNik] = await pool.query('SELECT id FROM anggota WHERE nik = ?', [nik])

    if (existingNik.length > 0) {
      return res.status(409).json({ status: 'error', message: 'NIK already registered' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate UUIDs
    const userId = uuidv4()
    const anggotaId = uuidv4()

    // Begin transaction
    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // Create user
      await connection.query(
        'INSERT INTO users (id, username, password, email, role, name, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, username, hashedPassword, email, 'anggota', name, true],
      )

      // Generate anggota number (format: A-YYYYMMDD-XXX)
      const today = new Date()
      const year = today.getFullYear()

      const [lastAnggota] = await connection.query(
        'SELECT nomor_anggota FROM anggota WHERE nomor_anggota LIKE ? ORDER BY nomor_anggota DESC LIMIT 1',
        [`A-${year}%`],
      )

      let anggotaNumber
      if (lastAnggota.length > 0) {
        const lastNumber = parseInt(lastAnggota[0].nomor_anggota.split('-')[2], 10)
        anggotaNumber = `A-${year}-${(lastNumber + 1).toString().padStart(3, '0')}`
      } else {
        anggotaNumber = `A-${year}-001`
      }

      // Create anggota
      await connection.query(
        'INSERT INTO anggota (id, user_id, nomor_anggota, nik, alamat, telepon, tanggal_bergabung, status_aktif) VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?)',
        [anggotaId, userId, anggotaNumber, nik, alamat, telepon, true],
      )

      // Get simpanan pokok amount from settings
      const [simpananPokokSetting] = await connection.query(
        'SELECT setting_value FROM system_settings WHERE setting_key = ?',
        ['simpanan_pokok'],
      )

      const simpananPokok = parseFloat(simpananPokokSetting[0]?.setting_value || 100000)

      // Create initial simpanan pokok record (pending verification)
      await connection.query(
        'INSERT INTO simpanan (id, anggota_id, jenis, jumlah, tanggal, status, keterangan) VALUES (?, ?, ?, ?, CURDATE(), ?, ?)',
        [uuidv4(), anggotaId, 'pokok', simpananPokok, 'menunggu', 'Simpanan pokok awal'],
      )

      // Commit transaction
      await connection.commit()

      // Return success
      return res.status(201).json({
        status: 'success',
        message: 'Registration successful. You can now log in.',
        data: {
          nomor_anggota: anggotaNumber,
          simpanan_pokok: simpananPokok,
        },
      })
    } catch (err) {
      // Rollback on error
      await connection.rollback()
      throw err
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

/**
 * Verify token route
 * GET /api/auth/verify
 */
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ status: 'error', message: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_change_this')

    // Check if user still exists and is active
    const [users] = await pool.query(
      'SELECT id, username, email, role, name, is_active FROM users WHERE id = ?',
      [decoded.id],
    )

    if (users.length === 0 || !users[0].is_active) {
      return res.status(401).json({ status: 'error', message: 'User not found or inactive' })
    }

    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: users[0].id,
          username: users[0].username,
          email: users[0].email,
          role: users[0].role,
          name: users[0].name,
        },
      },
    })
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'error', message: 'Token expired' })
    }

    return res.status(403).json({ status: 'error', message: 'Invalid token' })
  }
})

/**
 * Logout route (just for activity logging)
 * POST /api/auth/logout
 */
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_change_this')

        // Log logout activity
        await pool.query(
          'INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, description, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [uuidv4(), decoded.id, 'logout', 'user', decoded.id, 'User logged out', req.ip],
        )
      } catch (error) {
        // Token may be invalid, but we'll still respond with success
        console.error('Logout token error:', error)
      }
    }

    return res.status(200).json({ status: 'success', message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

export default router
