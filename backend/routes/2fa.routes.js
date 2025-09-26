// 2fa.routes.js - TOTP-based 2FA scaffolding
import express from 'express'
import { pool } from '../db.js'
import { authenticateJWT } from '../middleware/auth.middleware.js'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

const router = express.Router()

// Enroll TOTP: generate secret and QR for current user
router.post('/enroll', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id
    const secret = speakeasy.generateSecret({ name: `KSP:${userId}` })
    const otpauth = secret.otpauth_url
    const qr = await QRCode.toDataURL(otpauth)

    await pool.query(
      `INSERT INTO user_2fa (user_id, secret_base32, enabled, created_at)
       VALUES (?, ?, false, NOW())
       ON DUPLICATE KEY UPDATE secret_base32 = VALUES(secret_base32), updated_at = NOW()`,
      [userId, secret.base32],
    )

    res.json({ success: true, data: { base32: secret.base32, qr } })
  } catch (error) {
    console.error('2FA enroll error:', error)
    res.status(500).json({ success: false, message: 'Gagal melakukan enroll 2FA' })
  }
})

// Verify token and enable 2FA
router.post('/verify', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id
    const { token } = req.body
    const [[row]] = await pool.query('SELECT secret_base32 FROM user_2fa WHERE user_id = ?', [
      userId,
    ])
    if (!row) return res.status(400).json({ success: false, message: 'Belum enroll 2FA' })

    const verified = speakeasy.totp.verify({ secret: row.secret_base32, encoding: 'base32', token })
    if (!verified) return res.status(400).json({ success: false, message: 'Token tidak valid' })

    await pool.query('UPDATE user_2fa SET enabled = true, updated_at = NOW() WHERE user_id = ?', [
      userId,
    ])
    res.json({ success: true, message: '2FA diaktifkan' })
  } catch (error) {
    console.error('2FA verify error:', error)
    res.status(500).json({ success: false, message: 'Gagal verifikasi 2FA' })
  }
})

// Validate token (for login flow integration)
router.post('/validate', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id
    const { token } = req.body
    const [[row]] = await pool.query(
      'SELECT secret_base32, enabled FROM user_2fa WHERE user_id = ?',
      [userId],
    )
    if (!row || !row.enabled)
      return res.status(400).json({ success: false, message: '2FA belum diaktifkan' })

    const verified = speakeasy.totp.verify({ secret: row.secret_base32, encoding: 'base32', token })
    if (!verified) return res.status(400).json({ success: false, message: 'Token tidak valid' })
    res.json({ success: true, message: 'Token valid' })
  } catch (error) {
    console.error('2FA validate error:', error)
    res.status(500).json({ success: false, message: 'Gagal validasi 2FA' })
  }
})

export default router



