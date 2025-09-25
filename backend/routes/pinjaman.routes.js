// pinjaman.routes.js - Routes for loan management
import express from 'express'
import { pool } from '../db.js'
import { v4 as uuidv4 } from 'uuid'
import { checkRole } from '../middleware/auth.middleware.js'
import { createDocumentNotification, createLoanStatusNotification } from './notification.routes.js'
import multer from 'multer'
import path from 'path'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, `document-${uniqueSuffix}${ext}`)
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'))
    }
  },
})

/**
 * Get all loan applications in verification status
 * GET /api/pinjaman/verification
 */
router.get('/verification', checkRole(['pengurus']), async (req, res) => {
  try {
    const [loans] = await pool.query(
      `SELECT p.id, p.anggota_id, p.jumlah, p.tenor, p.bunga, p.tujuan,
       p.status_pinjaman, p.arrival_time, p.created_at, p.updated_at,
       a.nomor_anggota, u.name
       FROM pinjaman p
       JOIN anggota a ON p.anggota_id = a.id
       JOIN users u ON a.user_id = u.id
       WHERE p.status_pinjaman = 'verifikasi'
       ORDER BY p.created_at DESC`,
    )

    return res.status(200).json({
      status: 'success',
      data: {
        loans,
      },
    })
  } catch (error) {
    console.error('Error fetching verification loans:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

/**
 * Get a specific loan application with documents
 * GET /api/pinjaman/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Get loan details
    const [loans] = await pool.query(
      `SELECT p.id, p.anggota_id, p.jumlah, p.tenor, p.bunga, p.tujuan,
       p.status_pinjaman, p.arrival_time, p.catatan, p.created_at, p.updated_at,
       a.nomor_anggota, u.name
       FROM pinjaman p
       JOIN anggota a ON p.anggota_id = a.id
       JOIN users u ON a.user_id = u.id
       WHERE p.id = ?`,
      [id],
    )

    if (loans.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Loan not found' })
    }

    // Get documents
    const [documents] = await pool.query(
      `SELECT id, jenis_dokumen as jenisDokumen, nama_file as namaFile,
       path_file as pathFile, status, catatan
       FROM dokumen_pinjaman
       WHERE pinjaman_id = ?`,
      [id],
    )

    // Add documents to loan object
    const loan = {
      ...loans[0],
      dokumenPendukung: documents,
    }

    return res.status(200).json({
      status: 'success',
      data: {
        loan,
      },
    })
  } catch (error) {
    console.error('Error fetching loan details:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

/**
 * Verify a document
 * POST /api/pinjaman/:loanId/verify-document/:docId
 */
router.post('/:loanId/verify-document/:docId', checkRole(['pengurus']), async (req, res) => {
  try {
    const { loanId, docId } = req.params
    const { status, notes } = req.body

    if (!['diterima', 'ditolak'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Status must be either "diterima" or "ditolak"',
      })
    }

    // Get document details first
    const [documents] = await pool.query(
      `SELECT dp.jenis_dokumen, p.anggota_id
       FROM dokumen_pinjaman dp
       JOIN pinjaman p ON dp.pinjaman_id = p.id
       WHERE dp.id = ? AND dp.pinjaman_id = ?`,
      [docId, loanId],
    )

    if (documents.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found or does not belong to the specified loan',
      })
    }

    // Update document status
    await pool.query(
      `UPDATE dokumen_pinjaman
       SET status = ?, catatan = ?
       WHERE id = ? AND pinjaman_id = ?`,
      [status, notes, docId, loanId],
    )

    // Get user ID for notification
    const anggotaId = documents[0].anggota_id
    const [userResult] = await pool.query(`SELECT user_id FROM anggota WHERE id = ?`, [anggotaId])

    if (userResult.length > 0) {
      // Send notification to the user
      await createDocumentNotification(
        userResult[0].user_id,
        loanId,
        documents[0].jenis_dokumen,
        status,
        notes,
      )
    }

    return res.status(200).json({
      status: 'success',
      data: {
        success: true,
      },
    })
  } catch (error) {
    console.error('Error verifying document:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

/**
 * Complete loan verification
 * POST /api/pinjaman/:loanId/complete-verification
 */
router.post('/:loanId/complete-verification', checkRole(['pengurus']), async (req, res) => {
  try {
    const { loanId } = req.params
    const { isApproved, notes } = req.body

    // Get loan details first to verify status
    const [loans] = await pool.query(
      `SELECT p.status_pinjaman, p.anggota_id, a.user_id
       FROM pinjaman p
       JOIN anggota a ON p.anggota_id = a.id
       WHERE p.id = ?`,
      [loanId],
    )

    if (loans.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Loan not found' })
    }

    if (loans[0].status_pinjaman !== 'verifikasi') {
      return res.status(400).json({
        status: 'error',
        message: 'Loan is not in verification status',
      })
    }

    // Check if all documents are verified
    const [pendingDocs] = await pool.query(
      `SELECT COUNT(*) as count
       FROM dokumen_pinjaman
       WHERE pinjaman_id = ? AND status = 'menunggu'`,
      [loanId],
    )

    if (pendingDocs[0].count > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'All documents must be verified before completing verification',
      })
    }

    // Update loan status based on approval
    const newStatus = isApproved ? 'disetujui' : 'ditolak'

    await pool.query(
      `UPDATE pinjaman
       SET status_pinjaman = ?, catatan = CONCAT(COALESCE(catatan, ''), '\n', ?)
       WHERE id = ?`,
      [newStatus, notes, loanId],
    )

    // Send notification to the loan applicant
    if (loans[0].user_id) {
      await createLoanStatusNotification(loans[0].user_id, loanId, newStatus, notes)
    }

    return res.status(200).json({
      status: 'success',
      data: {
        success: true,
      },
    })
  } catch (error) {
    console.error('Error completing verification:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

/**
 * Submit a new loan application
 * POST /api/pinjaman/submit
 */
router.post('/submit', checkRole(['anggota']), upload.array('dokumen', 5), async (req, res) => {
  try {
    const { jumlah, tenor, bunga, tujuan, jenisDokumen } = req.body

    const userId = req.user.id
    const loanId = uuidv4()

    // Get anggota_id from users
    const [anggotaResult] = await pool.query(
      'SELECT a.id FROM anggota a JOIN users u ON a.user_id = u.id WHERE u.id = ?',
      [userId],
    )

    if (anggotaResult.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Anggota tidak ditemukan' })
    }

    const anggotaId = anggotaResult[0].id
    const now = new Date()

    // Create loan record
    await pool.query(
      `INSERT INTO pinjaman (
        id, anggota_id, jumlah, tenor, bunga, tujuan,
        arrival_time, status_pinjaman, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'antrean', ?, ?)`,
      [loanId, anggotaId, jumlah, tenor, bunga, tujuan, now, now, now],
    )

    // Process uploaded documents
    if (req.files && req.files.length > 0) {
      const jenisDokumenArray = Array.isArray(jenisDokumen) ? jenisDokumen : [jenisDokumen]

      // Process each uploaded file
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i]
        const docId = uuidv4()
        const docType = jenisDokumenArray[i] || 'Dokumen Pendukung'

        // Save document record
        await pool.query(
          `INSERT INTO dokumen_pinjaman (
            id, pinjaman_id, jenis_dokumen, nama_file,
            path_file, ukuran_file, status, uploaded_at
          ) VALUES (?, ?, ?, ?, ?, ?, 'menunggu', ?)`,
          [docId, loanId, docType, file.originalname, file.path, file.size, now],
        )
      }
    }

    // Update queue position (get current max position and add 1)
    const [queueResult] = await pool.query(
      'SELECT MAX(posisi_antrean) as max_pos FROM pinjaman WHERE status_pinjaman = "antrean"',
    )

    const newPosition = (queueResult[0].max_pos || 0) + 1

    await pool.query('UPDATE pinjaman SET posisi_antrean = ? WHERE id = ?', [newPosition, loanId])

    return res.status(201).json({
      status: 'success',
      data: {
        id: loanId,
        posisiAntrean: newPosition,
        message: 'Permohonan pinjaman berhasil diajukan',
      },
    })
  } catch (error) {
    console.error('Error submitting loan application:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

/**
 * Get verification statistics for admin dashboard
 * GET /api/pinjaman/verification/statistics
 */
router.get('/verification/statistics', checkRole(['pengurus']), async (req, res) => {
  try {
    // Get overall statistics
    const [overallStats] = await pool.query(
      `SELECT
         COUNT(DISTINCT p.id) as total_loans,
         SUM(CASE WHEN p.status_pinjaman = 'verifikasi' THEN 1 ELSE 0 END) as pending_verification,
         SUM(CASE WHEN p.status_pinjaman = 'disetujui' THEN 1 ELSE 0 END) as approved,
         SUM(CASE WHEN p.status_pinjaman = 'ditolak' THEN 1 ELSE 0 END) as rejected,
         AVG(TIMESTAMPDIFF(HOUR, p.arrival_time,
             CASE WHEN p.finish_process_time IS NOT NULL THEN p.finish_process_time
                  WHEN p.start_process_time IS NOT NULL THEN p.start_process_time
                  ELSE NOW() END)) as avg_processing_time_hours
       FROM pinjaman p
       WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
    )

    // Get document statistics
    const [docStats] = await pool.query(
      `SELECT
         COUNT(*) as total_documents,
         SUM(CASE WHEN status = 'diterima' THEN 1 ELSE 0 END) as accepted_documents,
         SUM(CASE WHEN status = 'ditolak' THEN 1 ELSE 0 END) as rejected_documents,
         SUM(CASE WHEN status = 'menunggu' THEN 1 ELSE 0 END) as pending_documents
       FROM dokumen_pinjaman
       WHERE uploaded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
    )

    // Get daily verification counts for the last 7 days
    const [dailyStats] = await pool.query(
      `SELECT
         DATE(p.updated_at) as date,
         COUNT(DISTINCT p.id) as total_processed,
         SUM(CASE WHEN p.status_pinjaman = 'disetujui' THEN 1 ELSE 0 END) as approved,
         SUM(CASE WHEN p.status_pinjaman = 'ditolak' THEN 1 ELSE 0 END) as rejected
       FROM pinjaman p
       WHERE p.updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         AND p.status_pinjaman IN ('disetujui', 'ditolak')
       GROUP BY DATE(p.updated_at)
       ORDER BY date DESC`,
    )

    // Get verification officer performance
    const [officerStats] = await pool.query(
      `SELECT
         u.name as officer_name,
         COUNT(DISTINCT p.id) as total_processed,
         SUM(CASE WHEN p.status_pinjaman = 'disetujui' THEN 1 ELSE 0 END) as approved,
         SUM(CASE WHEN p.status_pinjaman = 'ditolak' THEN 1 ELSE 0 END) as rejected,
         AVG(TIMESTAMPDIFF(MINUTE, p.start_process_time, p.finish_process_time)) as avg_processing_minutes
       FROM pinjaman p
       JOIN users u ON p.diproses_oleh = u.id
       WHERE p.finish_process_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY p.diproses_oleh, u.name
       ORDER BY total_processed DESC`,
    )

    return res.status(200).json({
      status: 'success',
      data: {
        overall: overallStats[0],
        documents: docStats[0],
        daily: dailyStats,
        officers: officerStats,
      },
    })
  } catch (error) {
    console.error('Error fetching verification statistics:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

/**
 * Get document verification status for anggota's loans
 * GET /api/pinjaman/member/documents
 */
router.get('/member/documents', checkRole(['anggota']), async (req, res) => {
  try {
    const userId = req.user.id

    // Get anggota_id from users
    const [anggotaResult] = await pool.query(
      'SELECT a.id FROM anggota a JOIN users u ON a.user_id = u.id WHERE u.id = ?',
      [userId],
    )

    if (anggotaResult.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Anggota tidak ditemukan' })
    }

    const anggotaId = anggotaResult[0].id

    // Get all loans for this anggota with document verification status
    const [loans] = await pool.query(
      `SELECT p.id, p.jumlah, p.tenor, p.bunga, p.tujuan, p.status_pinjaman,
              p.created_at, COUNT(dp.id) as total_documents,
              SUM(CASE WHEN dp.status = 'diterima' THEN 1 ELSE 0 END) as accepted_documents,
              SUM(CASE WHEN dp.status = 'ditolak' THEN 1 ELSE 0 END) as rejected_documents,
              SUM(CASE WHEN dp.status = 'menunggu' THEN 1 ELSE 0 END) as pending_documents
       FROM pinjaman p
       LEFT JOIN dokumen_pinjaman dp ON p.id = dp.pinjaman_id
       WHERE p.anggota_id = ?
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [anggotaId],
    )

    // For each loan, get detailed document status
    const loansWithDocDetails = await Promise.all(
      loans.map(async (loan) => {
        const [documents] = await pool.query(
          `SELECT id, jenis_dokumen, nama_file, status, catatan, uploaded_at, updated_at
           FROM dokumen_pinjaman
           WHERE pinjaman_id = ?
           ORDER BY jenis_dokumen`,
          [loan.id],
        )

        return {
          ...loan,
          documents,
        }
      }),
    )

    return res.status(200).json({
      status: 'success',
      data: {
        loans: loansWithDocDetails,
      },
    })
  } catch (error) {
    console.error('Error fetching document status:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

// Get active loans for current user
router.get('/active', async (req, res) => {
  try {
    const userId = req.user.id

    const [loans] = await pool.execute(
      `SELECT p.*,
        COALESCE(SUM(pp.jumlah_bayar), 0) as total_dibayar
       FROM pinjaman p
       LEFT JOIN pembayaran_pinjaman pp ON p.id = pp.loan_id AND pp.status = 'diverifikasi'
       WHERE p.anggota_id = ?
       AND p.status_pinjaman IN ('aktif', 'pencairan')
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [userId],
    )

    res.json({
      success: true,
      data: loans,
    })
  } catch (error) {
    console.error('Error fetching active loans:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat pinjaman aktif',
    })
  }
})

// Submit manual payment
router.post('/payments/manual', upload.single('bukti_transfer'), async (req, res) => {
  try {
    const userId = req.user.id
    const { loan_id, jumlah_bayar, tanggal_bayar, metode_pembayaran, nomor_referensi, keterangan } =
      req.body

    // Validate loan ownership
    const [loanCheck] = await pool.execute(
      'SELECT id, jenis_pinjaman FROM pinjaman WHERE id = ? AND anggota_id = ?',
      [loan_id, userId],
    )

    if (loanCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pinjaman tidak ditemukan',
      })
    }

    // Insert payment record
    const paymentId = uuidv4()
    const buktiPath = req.file ? `/uploads/payments/${req.file.filename}` : null

    await pool.execute(
      `INSERT INTO pembayaran_pinjaman
       (id, loan_id, anggota_id, jumlah_bayar, tanggal_bayar,
        metode_pembayaran, nomor_referensi, bukti_transfer,
        keterangan, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'menunggu', NOW())`,
      [
        paymentId,
        loan_id,
        userId,
        jumlah_bayar,
        tanggal_bayar,
        metode_pembayaran,
        nomor_referensi,
        buktiPath,
        keterangan,
      ],
    )

    res.json({
      success: true,
      message: 'Pembayaran berhasil diinput dan menunggu verifikasi',
      data: { id: paymentId },
    })
  } catch (error) {
    console.error('Error submitting manual payment:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal menginput pembayaran',
    })
  }
})

// Get payment history for current user
router.get('/payments/history', async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    const [payments] = await pool.execute(
      `SELECT pp.*, p.jenis_pinjaman, p.jumlah_pinjaman
       FROM pembayaran_pinjaman pp
       JOIN pinjaman p ON pp.loan_id = p.id
       WHERE pp.anggota_id = ?
       ORDER BY pp.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), offset],
    )

    // Get total count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM pembayaran_pinjaman WHERE anggota_id = ?',
      [userId],
    )

    const total = countResult[0].total
    const totalPages = Math.ceil(total / limit)

    res.json({
      success: true,
      data: payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    })
  } catch (error) {
    console.error('Error fetching payment history:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat riwayat pembayaran',
    })
  }
})

export default router
