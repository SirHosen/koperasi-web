// notification.routes.js - Routes for notification system
import express from 'express'
import { pool } from '../db.js'
import { v4 as uuidv4 } from 'uuid'
import { checkRole, authenticateJWT } from '../middleware/auth.middleware.js'

const router = express.Router()

/**
 * Get all notifications for the authenticated user
 * GET /api/notifications
 */
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id

    const [notifications] = await pool.query(
      `SELECT id, type, title, message, link, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId],
    )

    // Get unread count
    const [unreadResult] = await pool.query(
      `SELECT COUNT(*) as unread_count
       FROM notifications
       WHERE user_id = ? AND is_read = false`,
      [userId],
    )

    return res.status(200).json({
      status: 'success',
      data: {
        notifications,
        unread_count: unreadResult[0].unread_count,
      },
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

/**
 * Mark a notification as read
 * PUT /api/notifications/:id/read
 */
router.put('/:id/read', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Update notification and ensure it belongs to the user
    const [result] = await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE id = ? AND user_id = ?`,
      [id, userId],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Notification not found' })
    }

    return res.status(200).json({
      status: 'success',
      data: {
        message: 'Notification marked as read',
      },
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

/**
 * Mark all notifications as read for a user
 * PUT /api/notifications/read-all
 */
router.put('/read-all', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id

    // Mark all as read
    await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE user_id = ?`,
      [userId],
    )

    return res.status(200).json({
      status: 'success',
      data: {
        message: 'All notifications marked as read',
      },
    })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

/**
 * Create a notification for a specific user (admin only)
 * POST /api/notifications/create
 */
router.post('/create', checkRole(['pengurus', 'pengawas']), async (req, res) => {
  try {
    const { userId, type, title, message, link = null } = req.body

    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID, type, title, and message are required',
      })
    }

    const notificationId = uuidv4()
    const now = new Date()

    await pool.query(
      `INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, false, ?)`,
      [notificationId, userId, type, title, message, link, now],
    )

    return res.status(201).json({
      status: 'success',
      data: {
        id: notificationId,
        message: 'Notification created successfully',
      },
    })
  } catch (error) {
    console.error('Error creating notification:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

/**
 * Helper function to create a document verification notification
 * This is not exposed as an endpoint, but used internally
 */
export const createDocumentNotification = async (userId, loanId, docType, status, notes = null) => {
  try {
    const notificationId = uuidv4()
    const now = new Date()

    // Create message based on status
    let title, message, type
    if (status === 'diterima') {
      type = 'document_approved'
      title = 'Dokumen Diterima'
      message = `Dokumen ${docType} untuk pinjaman Anda telah diverifikasi dan diterima.`
    } else {
      type = 'document_rejected'
      title = 'Dokumen Ditolak'
      message = `Dokumen ${docType} untuk pinjaman Anda ditolak. Mohon periksa kembali.`
      if (notes) {
        message += ` Catatan: ${notes}`
      }
    }

    const link = `/anggota/pinjaman/${loanId}/dokumen`

    await pool.query(
      `INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, false, ?)`,
      [notificationId, userId, type, title, message, link, now],
    )

    return notificationId
  } catch (error) {
    console.error('Error creating document notification:', error)
    return null
  }
}

/**
 * Helper function to create a loan status notification
 * This is not exposed as an endpoint, but used internally
 */
export const createLoanStatusNotification = async (userId, loanId, status, notes = null) => {
  try {
    const notificationId = uuidv4()
    const now = new Date()

    // Create message based on status
    let title, message, type
    if (status === 'disetujui') {
      type = 'loan_approved'
      title = 'Pinjaman Disetujui'
      message = 'Pengajuan pinjaman Anda telah disetujui.'
    } else if (status === 'ditolak') {
      type = 'loan_rejected'
      title = 'Pinjaman Ditolak'
      message = 'Maaf, pengajuan pinjaman Anda ditolak.'
      if (notes) {
        message += ` Alasan: ${notes}`
      }
    } else if (status === 'proses') {
      type = 'loan_processing'
      title = 'Pinjaman Diproses'
      message = 'Pinjaman Anda sedang dalam proses verifikasi.'
    } else if (status === 'antrean') {
      type = 'loan_queued'
      title = 'Pinjaman Masuk Antrean'
      message = 'Pengajuan pinjaman Anda telah masuk dalam antrean untuk diproses.'
    }

    const link = `/anggota/pinjaman/${loanId}`

    await pool.query(
      `INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, false, ?)`,
      [notificationId, userId, type, title, message, link, now],
    )

    return notificationId
  } catch (error) {
    console.error('Error creating loan status notification:', error)
    return null
  }
}

export default router
