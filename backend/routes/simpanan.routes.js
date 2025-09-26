import express from 'express'
import { pool } from '../db.js'
import { authenticateJWT, checkRole } from '../middleware/auth.middleware.js'
import { v4 as uuidv4 } from 'uuid'
import PDFDocument from 'pdfkit'
import ExcelJS from 'exceljs'
import DatabaseHelper from '../utils/database.helper.js'

const router = express.Router()

// Get savings summary for current member
router.get('/summary', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user?.id

    // Optimized: Get anggota_id using helper
    const anggotaId = await DatabaseHelper.getAnggotaIdByUserId(userId)
    if (!anggotaId) {
      return res.status(404).json({ message: 'Anggota tidak ditemukan' })
    }

    // Optimized: Get summary with single query using helper
    const summaryData = await DatabaseHelper.getSimpananSummaryBatch([anggotaId])
    const summary = summaryData[anggotaId] || {}

    // Get additional statistics in parallel
    const [totalRows, recentRows] = await Promise.all([
      pool.execute(
        'SELECT COUNT(*) as total_transaksi, SUM(jumlah) as total_keseluruhan FROM simpanan WHERE anggota_id = ?',
        [anggotaId],
      ),
      pool.execute('SELECT * FROM simpanan WHERE anggota_id = ? ORDER BY tanggal DESC LIMIT 5', [
        anggotaId,
      ]),
    ])

    const stats = totalRows[0][0]
    const recentTransactions = recentRows[0]

    // Format the response
    const response = {
      summary: {
        pokok: summary.pokok || 0,
        wajib: summary.wajib || 0,
        sukarela: summary.sukarela || 0,
        total: Object.values(summary).reduce((sum, val) => sum + (val || 0), 0),
      },
      statistics: {
        total_transaksi: stats.total_transaksi,
        total_keseluruhan: stats.total_keseluruhan || 0,
      },
      recent_transactions: recentTransactions,
    }

    res.json(response)
  } catch (error) {
    console.error('Error getting savings summary:', error)
    res.status(500).json({ message: 'Error getting savings summary' })
  }
})

// Get savings history for current member with filters
router.get('/riwayat', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user?.id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const jenis = req.query.jenis
    const startDate = req.query.startDate
    const endDate = req.query.endDate

    // Optimized: Get anggota_id using helper
    const anggotaId = await DatabaseHelper.getAnggotaIdByUserId(userId)
    if (!anggotaId) {
      return res.status(404).json({ message: 'Anggota tidak ditemukan' })
    }

    // Build optimized query with filters
    const baseQuery = 'SELECT * FROM simpanan'
    const filters = {
      anggota_id: anggotaId,
      jenis,
      startDate,
      endDate,
    }

    const { whereClause, params } = DatabaseHelper.buildOptimizedWhere(filters)
    const fullQuery = `${baseQuery} ${whereClause} ORDER BY tanggal DESC`

    // Use optimized pagination helper
    const result = await DatabaseHelper.getPaginatedResults(fullQuery, params, page, limit)

    res.json({
      simpanan: result.data,
      ...result.pagination,
    })
  } catch (error) {
    console.error('Error getting savings history:', error)
    res.status(500).json({ message: 'Error getting savings history' })
  }
})

// Charts: summary by jenis and monthly aggregation
router.get('/charts/summary', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user?.id
    const year = parseInt(req.query.year) || new Date().getFullYear()

    // Optimized: Get anggota_id using helper
    const anggotaId = await DatabaseHelper.getAnggotaIdByUserId(userId)
    if (!anggotaId) {
      return res.status(404).json({ message: 'Anggota tidak ditemukan' })
    }

    // Total per jenis (verified only)
    const [byJenis] = await pool.execute(
      `SELECT jenis, COALESCE(SUM(jumlah), 0) as total
       FROM simpanan
       WHERE anggota_id = ? AND status = 'diverifikasi'
       GROUP BY jenis`,
      [anggotaId],
    )

    // Monthly series for the given year (net amount including withdrawal as negative)
    const [monthly] = await pool.execute(
      `SELECT MONTH(tanggal) as bulan, COALESCE(SUM(jumlah), 0) as total
       FROM simpanan
       WHERE anggota_id = ? AND status = 'diverifikasi' AND YEAR(tanggal) = ?
       GROUP BY MONTH(tanggal)
       ORDER BY bulan ASC`,
      [anggotaId, year],
    )

    res.json({
      year,
      byJenis,
      monthly,
    })
  } catch (error) {
    console.error('Error generating simpanan charts summary:', error)
    res.status(500).json({ message: 'Error generating charts data' })
  }
})

// Submit voluntary savings
router.post('/setor/sukarela', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user?.id
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
    const userId = req.user?.id
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
      const adminId = req.user?.id
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
    const userId = req.user?.id
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

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename=laporan-simpanan.pdf')

      const doc = new PDFDocument({ size: 'A4', margin: 36 })
      doc.pipe(res)

      doc.fontSize(16).text('Laporan Simpanan Anggota', { align: 'center' })
      doc.moveDown(0.5)
      doc.fontSize(10).text(`Periode: ${startDate || '-'} s.d. ${endDate || '-'}`)
      doc.text(`Filter Jenis: ${jenis || 'semua'}`)
      doc.moveDown(0.5)

      // Table header
      doc.fontSize(11).text('Tanggal', { continued: true, width: 100 })
      doc.text('Jenis', { continued: true, width: 100 })
      doc.text('Jumlah', { continued: true, width: 120 })
      doc.text('Status', { width: 100 })
      doc.moveTo(doc.x, doc.y).lineTo(559, doc.y).stroke()

      // Table rows
      rows.forEach((r) => {
        doc.fontSize(10)
        doc.text(new Date(r.tanggal).toISOString().slice(0, 10), { continued: true, width: 100 })
        doc.text(r.jenis, { continued: true, width: 100 })
        doc.text(`Rp ${Number(r.jumlah).toLocaleString('id-ID')}`, { continued: true, width: 120 })
        doc.text(r.status || '-', { width: 100 })
      })

      doc.end()
      return
    }

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook()
      const sheet = workbook.addWorksheet('Simpanan')

      sheet.columns = [
        { header: 'Tanggal', key: 'tanggal', width: 15 },
        { header: 'Jenis', key: 'jenis', width: 15 },
        { header: 'Jumlah', key: 'jumlah', width: 18 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Keterangan', key: 'keterangan', width: 40 },
      ]

      rows.forEach((r) => {
        sheet.addRow({
          tanggal: new Date(r.tanggal).toISOString().slice(0, 10),
          jenis: r.jenis,
          jumlah: r.jumlah,
          status: r.status,
          keterangan: r.keterangan,
        })
      })

      // Format number column
      sheet.getColumn('jumlah').numFmt = '#,##0;[Red]-#,##0'

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      )
      res.setHeader('Content-Disposition', 'attachment; filename=laporan-simpanan.xlsx')

      await workbook.xlsx.write(res)
      res.end()
      return
    }

    // Default JSON if unknown format
    res.json({
      message: 'Format tidak dikenal, mengembalikan JSON',
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
