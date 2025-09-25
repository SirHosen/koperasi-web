import express from 'express'
import { pool } from '../db.js'
import { authenticateJWT, checkRole } from '../middleware/auth.middleware.js'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Get savings summary for current member
router.get('/summary', authenticateJWT, async (req, res) => {
  try {
    const userId = req.userId

    // Get anggota_id from user_id
    const [anggotaRows] = await pool.execute('SELECT id FROM anggota WHERE user_id = ?', [userId])

    if (anggotaRows.length === 0) {
      return res.status(404).json({ message: 'Anggota tidak ditemukan' })
    }

    const anggotaId = anggotaRows[0].id

    // Get summary of verified savings by type
    const [rows] = await pool.execute(
      `SELECT
        jenis,
        SUM(jumlah) as total
       FROM simpanan
       WHERE anggota_id = ? AND status = 'diverifikasi'
       GROUP BY jenis`,
      [anggotaId],
    )

    // Format the response
    const summary = {
      pokok: 0,
      wajib: 0,
      sukarela: 0,
      total: 0,
    }

    rows.forEach((row) => {
      summary[row.jenis] = parseFloat(row.total)
      summary.total += parseFloat(row.total)
    })

    res.json(summary)
  } catch (error) {
    console.error('Error getting savings summary:', error)
    res.status(500).json({ message: 'Error getting savings summary' })
  }
})

// Get savings history for current member with filters
router.get('/riwayat', authenticateJWT, async (req, res) => {
  try {
    const userId = req.userId
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    const jenis = req.query.jenis
    const startDate = req.query.startDate
    const endDate = req.query.endDate

    // Get anggota_id from user_id
    const [anggotaRows] = await pool.execute('SELECT id FROM anggota WHERE user_id = ?', [userId])

    if (anggotaRows.length === 0) {
      return res.status(404).json({ message: 'Anggota tidak ditemukan' })
    }

    const anggotaId = anggotaRows[0].id

    // Build the query with filters
    let query = `
      SELECT * FROM simpanan
      WHERE anggota_id = ?
    `

    const queryParams = [anggotaId]

    if (jenis && jenis !== 'semua') {
      query += ` AND jenis = ?`
      queryParams.push(jenis)
    }

    if (startDate) {
      query += ` AND tanggal >= ?`
      queryParams.push(startDate)
    }

    if (endDate) {
      query += ` AND tanggal <= ?`
      queryParams.push(endDate)
    }

    // Add order by and limit
    query += ` ORDER BY tanggal DESC LIMIT ? OFFSET ?`
    queryParams.push(limit, offset)

    // Execute the query
    const [rows] = await pool.execute(query, queryParams)

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total FROM simpanan
      WHERE anggota_id = ?
    `

    const countParams = [anggotaId]

    if (jenis && jenis !== 'semua') {
      countQuery += ` AND jenis = ?`
      countParams.push(jenis)
    }

    if (startDate) {
      countQuery += ` AND tanggal >= ?`
      countParams.push(startDate)
    }

    if (endDate) {
      countQuery += ` AND tanggal <= ?`
      countParams.push(endDate)
    }

    const [countRows] = await pool.execute(countQuery, countParams)
    const totalItems = countRows[0].total
    const totalPages = Math.ceil(totalItems / limit)

    res.json({
      simpanan: rows,
      totalItems,
      totalPages,
      currentPage: page,
    })
  } catch (error) {
    console.error('Error getting savings history:', error)
    res.status(500).json({ message: 'Error getting savings history' })
  }
})

// Submit voluntary savings
router.post('/setor/sukarela', authenticateJWT, async (req, res) => {
  try {
    const userId = req.userId
    const { jumlah, keterangan } = req.body

    if (!jumlah || jumlah <= 0) {
      return res.status(400).json({ message: 'Jumlah simpanan tidak valid' })
    }

    // Get anggota_id from user_id
    const [anggotaRows] = await pool.execute('SELECT id FROM anggota WHERE user_id = ?', [userId])

    if (anggotaRows.length === 0) {
      return res.status(404).json({ message: 'Anggota tidak ditemukan' })
    }

    const anggotaId = anggotaRows[0].id

    // Insert new voluntary savings entry
    await pool.execute(
      `INSERT INTO simpanan
        (id, anggota_id, jenis, jumlah, tanggal, status, keterangan)
       VALUES (?, ?, 'sukarela', ?, CURDATE(), 'menunggu', ?)`,
      [uuidv4(), anggotaId, jumlah, keterangan || 'Simpanan sukarela'],
    )

    res.status(201).json({ message: 'Simpanan sukarela berhasil diajukan' })
  } catch (error) {
    console.error('Error submitting voluntary savings:', error)
    res.status(500).json({ message: 'Error submitting voluntary savings' })
  }
})

// Request withdrawal of voluntary savings
router.post('/tarik/sukarela', authenticateJWT, async (req, res) => {
  try {
    const userId = req.userId
    const { jumlah, keterangan } = req.body

    if (!jumlah || jumlah <= 0) {
      return res.status(400).json({ message: 'Jumlah penarikan tidak valid' })
    }

    if (!keterangan) {
      return res.status(400).json({ message: 'Keterangan penarikan wajib diisi' })
    }

    // Get anggota_id from user_id
    const [anggotaRows] = await pool.execute('SELECT id FROM anggota WHERE user_id = ?', [userId])

    if (anggotaRows.length === 0) {
      return res.status(404).json({ message: 'Anggota tidak ditemukan' })
    }

    const anggotaId = anggotaRows[0].id

    // Check available sukarela balance
    const [balanceRows] = await pool.execute(
      `SELECT SUM(jumlah) as total
       FROM simpanan
       WHERE anggota_id = ? AND jenis = 'sukarela' AND status = 'diverifikasi'`,
      [anggotaId],
    )

    const balance = parseFloat(balanceRows[0].total || 0)

    if (jumlah > balance) {
      return res.status(400).json({
        message: 'Saldo simpanan sukarela tidak mencukupi',
        available: balance,
      })
    }

    // Insert withdrawal as negative amount
    await pool.execute(
      `INSERT INTO simpanan
        (id, anggota_id, jenis, jumlah, tanggal, status, keterangan)
       VALUES (?, ?, 'sukarela', ?, CURDATE(), 'menunggu', ?)`,
      [uuidv4(), anggotaId, -jumlah, `Penarikan: ${keterangan}`],
    )

    res.status(201).json({ message: 'Permintaan penarikan berhasil diajukan' })
  } catch (error) {
    console.error('Error requesting withdrawal:', error)
    res.status(500).json({ message: 'Error requesting withdrawal' })
  }
})

// For admin - get pending savings transactions
router.get('/pending', [authenticateJWT, checkRole(['pengurus', 'admin'])], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    const jenis = req.query.jenis
    const status = req.query.status || 'menunggu'

    // Build the query with filters
    let query = `
      SELECT s.*, a.nomor_anggota, u.name as nama_anggota
      FROM simpanan s
      JOIN anggota a ON s.anggota_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE s.status = ?
    `

    const queryParams = [status]

    if (jenis && jenis !== 'semua') {
      query += ` AND s.jenis = ?`
      queryParams.push(jenis)
    }

    // Add order by and limit
    query += ` ORDER BY s.tanggal ASC LIMIT ? OFFSET ?`
    queryParams.push(limit, offset)

    // Execute the query
    const [rows] = await pool.execute(query, queryParams)

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total FROM simpanan s
      WHERE s.status = ?
    `

    const countParams = [status]

    if (jenis && jenis !== 'semua') {
      countQuery += ` AND s.jenis = ?`
      countParams.push(jenis)
    }

    const [countRows] = await pool.execute(countQuery, countParams)
    const totalItems = countRows[0].total
    const totalPages = Math.ceil(totalItems / limit)

    res.json({
      simpanan: rows,
      totalItems,
      totalPages,
      currentPage: page,
    })
  } catch (error) {
    console.error('Error getting pending savings:', error)
    res.status(500).json({ message: 'Error getting pending savings' })
  }
})

// For admin - verify savings transaction
router.put(
  '/:id/verifikasi',
  [authenticateJWT, checkRole(['pengurus', 'admin'])],
  async (req, res) => {
    try {
      const simpananId = req.params.id
      const adminId = req.userId
      const { status, catatan } = req.body

      if (status !== 'diverifikasi' && status !== 'ditolak') {
        return res.status(400).json({ message: 'Status tidak valid' })
      }

      // Check if simpanan exists
      const [simpananRows] = await pool.execute('SELECT * FROM simpanan WHERE id = ?', [simpananId])

      if (simpananRows.length === 0) {
        return res.status(404).json({ message: 'Simpanan tidak ditemukan' })
      }

      // Update simpanan status
      const newKeterangan =
        simpananRows[0].keterangan +
        ` (${status} pada ${new Date().toISOString().split('T')[0]})` +
        (catatan ? `\nCatatan: ${catatan}` : '')

      await pool.execute(
        `UPDATE simpanan
       SET status = ?, diverifikasi_oleh = ?, keterangan = ?
       WHERE id = ?`,
        [status, adminId, newKeterangan, simpananId],
      )

      res.json({
        message: status === 'diverifikasi' ? 'Simpanan berhasil diverifikasi' : 'Simpanan ditolak',
      })
    } catch (error) {
      console.error('Error verifying savings:', error)
      res.status(500).json({ message: 'Error verifying savings' })
    }
  },
)

// Export savings report
router.get('/export/:format', authenticateJWT, async (req, res) => {
  try {
    const userId = req.userId
    const format = req.params.format // 'pdf' or 'excel'
    const jenis = req.query.jenis
    const startDate = req.query.startDate
    const endDate = req.query.endDate

    // Get anggota_id from user_id
    const [anggotaRows] = await pool.execute('SELECT id FROM anggota WHERE user_id = ?', [userId])

    if (anggotaRows.length === 0) {
      return res.status(404).json({ message: 'Anggota tidak ditemukan' })
    }

    const anggotaId = anggotaRows[0].id

    // Build query for export data
    let query = `
      SELECT * FROM simpanan
      WHERE anggota_id = ?
    `

    const queryParams = [anggotaId]

    if (jenis && jenis !== 'semua') {
      query += ` AND jenis = ?`
      queryParams.push(jenis)
    }

    if (startDate) {
      query += ` AND tanggal >= ?`
      queryParams.push(startDate)
    }

    if (endDate) {
      query += ` AND tanggal <= ?`
      queryParams.push(endDate)
    }

    query += ` ORDER BY tanggal DESC`

    const [rows] = await pool.execute(query, queryParams)

    // For now, just return JSON data
    // In a real implementation, you would generate PDF/Excel here
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename=laporan-simpanan.pdf')
    } else if (format === 'excel') {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      )
      res.setHeader('Content-Disposition', 'attachment; filename=laporan-simpanan.xlsx')
    }

    // Return mock data for now
    res.json({
      message: `Export ${format} berhasil`,
      data: rows,
      summary: {
        total_records: rows.length,
        date_range: { startDate, endDate },
        filter: jenis,
      },
    })
  } catch (error) {
    console.error('Error exporting savings report:', error)
    res.status(500).json({ message: 'Error exporting savings report' })
  }
})

export default router
