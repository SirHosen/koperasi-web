// fcfs.routes.js - Routes for FCFS loan queue management
import express from 'express'
import { pool } from '../db.js'
import { v4 as uuidv4 } from 'uuid'
import { checkRole } from '../middleware/auth.middleware.js'

const router = express.Router()

/**
 * Get current FCFS queue status
 * GET /api/fcfs/queue
 */
router.get('/queue', async (req, res) => {
  try {
    // Get queue items
    const [queueItems] = await pool.query(
      `SELECT p.id, p.anggota_id, p.jumlah, p.tenor, p.bunga, p.tujuan,
       p.arrival_time, p.status_pinjaman, p.posisi_antrean, p.burst_time,
       p.waiting_time, p.created_at, p.updated_at,
       a.nomor_anggota, u.name
       FROM pinjaman p
       JOIN anggota a ON p.anggota_id = a.id
       JOIN users u ON a.user_id = u.id
       WHERE p.status_pinjaman = 'antrean'
       ORDER BY p.posisi_antrean ASC`,
      [],
    )

    // Get queue statistics
    const [queueStats] = await pool.query(
      `SELECT
        COUNT(*) AS total_antrean,
        AVG(burst_time) AS avg_processing_time,
        MAX(burst_time) AS max_processing_time,
        COUNT(IF(DATE(arrival_time) = CURDATE(), 1, NULL)) AS arrived_today,
        COUNT(IF(DATE(updated_at) = CURDATE() AND status_pinjaman != 'antrean', 1, NULL)) AS processed_today
       FROM pinjaman`,
      [],
    )

    return res.status(200).json({
      status: 'success',
      data: {
        queue: queueItems,
        stats: queueStats[0],
      },
    })
  } catch (error) {
    console.error('FCFS queue fetch error:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

/**
 * Get a specific loan application in queue
 * GET /api/fcfs/queue/:id
 */
router.get('/queue/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Get queue item details
    const [queueItems] = await pool.query(
      `SELECT p.id, p.anggota_id, p.jumlah, p.tenor, p.bunga, p.tujuan,
       p.arrival_time, p.status_pinjaman, p.posisi_antrean, p.burst_time,
       p.waiting_time, p.created_at, p.updated_at,
       a.nomor_anggota, u.name
       FROM pinjaman p
       JOIN anggota a ON p.anggota_id = a.id
       JOIN users u ON a.user_id = u.id
       WHERE p.id = ?`,
      [id],
    )

    if (queueItems.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Loan application not found' })
    }

    // Get supporting documents
    const [documents] = await pool.query(
      `SELECT id, jenis_dokumen, nama_file, path_file
       FROM dokumen_pinjaman
       WHERE pinjaman_id = ?`,
      [id],
    )

    return res.status(200).json({
      status: 'success',
      data: {
        loan: queueItems[0],
        documents,
      },
    })
  } catch (error) {
    console.error('FCFS queue item fetch error:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

/**
 * Submit a new loan application (enters FCFS queue)
 * POST /api/fcfs/submit
 */
router.post('/submit', async (req, res) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const { jumlah, tenor, tujuan, anggotaId } = req.body

    if (!jumlah || !tenor || !tujuan || !anggotaId) {
      return res.status(400).json({ status: 'error', message: 'All fields are required' })
    }

    // Get system bunga setting
    const [bungaSetting] = await connection.query(
      'SELECT setting_value FROM system_settings WHERE setting_key = ?',
      ['bunga_pinjaman'],
    )

    const bunga = parseFloat(bungaSetting[0]?.setting_value || 1.5)

    // Generate loan ID (format: P-YYYYMMDD-XXX)
    const today = new Date()
    const year = today.getFullYear()
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const day = today.getDate().toString().padStart(2, '0')
    const dateStr = `${year}${month}${day}`

    const [lastPinjaman] = await connection.query(
      'SELECT id FROM pinjaman WHERE id LIKE ? ORDER BY id DESC LIMIT 1',
      [`P-${dateStr}%`],
    )

    let pinjamanId
    if (lastPinjaman.length > 0) {
      const lastNumber = parseInt(lastPinjaman[0].id.split('-')[2], 10)
      pinjamanId = `P-${dateStr}-${(lastNumber + 1).toString().padStart(3, '0')}`
    } else {
      pinjamanId = `P-${dateStr}-001`
    }

    // Get current position in queue
    const [currentQueue] = await connection.query(
      'SELECT COUNT(*) as count FROM pinjaman WHERE status_pinjaman = ?',
      ['antrean'],
    )

    const posisiAntrean = currentQueue[0].count + 1

    // Estimate burst time based on loan amount (simple formula for demo)
    const burstTime = Math.ceil(jumlah / 500000) * 5 + 15 // Base 15 min + 5 min per 500k

    // Insert new loan application
    await connection.query(
      `INSERT INTO pinjaman
       (id, anggota_id, jumlah, tenor, bunga, tujuan, arrival_time,
        status_pinjaman, posisi_antrean, burst_time)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)`,
      [pinjamanId, anggotaId, jumlah, tenor, bunga, tujuan, 'antrean', posisiAntrean, burstTime],
    )

    // Log activity
    await connection.query(
      `INSERT INTO activity_logs
       (id, user_id, action, entity_type, entity_id, description, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        req.user.id,
        'submit',
        'pinjaman',
        pinjamanId,
        `Submitted new loan application of ${jumlah} for ${tenor} months`,
        req.ip,
      ],
    )

    await connection.commit()

    return res.status(201).json({
      status: 'success',
      message: 'Loan application submitted successfully',
      data: {
        loanId: pinjamanId,
        posisiAntrean,
        burstTime,
        estimatedWaitingTime: burstTime * posisiAntrean, // Simple estimate
      },
    })
  } catch (error) {
    await connection.rollback()
    console.error('Loan submission error:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  } finally {
    connection.release()
  }
})

/**
 * Process the next loan in queue (for pengurus/admin)
 * POST /api/fcfs/process-next
 */
router.post('/process-next', checkRole(['pengurus']), async (req, res) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    // Get the next loan in queue
    const [nextInQueue] = await connection.query(
      `SELECT id, anggota_id FROM pinjaman
       WHERE status_pinjaman = 'antrean'
       ORDER BY posisi_antrean ASC
       LIMIT 1`,
    )

    if (nextInQueue.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No loans in queue' })
    }

    const { id: loanId, anggota_id: anggotaId } = nextInQueue[0]

    // Update loan status to 'verifikasi'
    await connection.query(
      `UPDATE pinjaman
       SET status_pinjaman = 'verifikasi',
           start_process_time = NOW(),
           diproses_oleh = ?,
           posisi_antrean = NULL
       WHERE id = ?`,
      [req.user.id, loanId],
    )

    // Update positions for remaining queue items
    await connection.query(
      `UPDATE pinjaman
       SET posisi_antrean = posisi_antrean - 1
       WHERE status_pinjaman = 'antrean'`,
    )

    // Log activity
    await connection.query(
      `INSERT INTO activity_logs
       (id, user_id, action, entity_type, entity_id, description, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        req.user.id,
        'process',
        'pinjaman',
        loanId,
        'Started processing loan from queue',
        req.ip,
      ],
    )

    await connection.commit()

    return res.status(200).json({
      status: 'success',
      message: 'Started processing next loan in queue',
      data: {
        loanId,
      },
    })
  } catch (error) {
    await connection.rollback()
    console.error('Process next loan error:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  } finally {
    connection.release()
  }
})

/**
 * Get member's loan status in queue
 * GET /api/fcfs/status/:anggotaId
 */
router.get('/status/:anggotaId', async (req, res) => {
  try {
    const { anggotaId } = req.params

    // Check if user has permission to access this anggota's data
    if (req.user.role === 'anggota') {
      const [anggota] = await pool.query('SELECT id FROM anggota WHERE user_id = ?', [req.user.id])

      if (anggota.length === 0 || anggota[0].id !== anggotaId) {
        return res
          .status(403)
          .json({ status: 'error', message: 'You do not have permission to access this data' })
      }
    }

    // Get loan status in queue
    const [loanStatus] = await pool.query(
      `SELECT p.id, p.jumlah, p.tenor, p.bunga, p.tujuan,
       p.arrival_time, p.status_pinjaman, p.posisi_antrean, p.burst_time,
       p.start_process_time, p.finish_process_time,
       p.created_at, p.updated_at
       FROM pinjaman p
       WHERE p.anggota_id = ?
       AND p.status_pinjaman IN ('antrean', 'verifikasi', 'disetujui', 'ditolak', 'pencairan')
       ORDER BY p.arrival_time DESC
       LIMIT 1`,
      [anggotaId],
    )

    if (loanStatus.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No active loan application found' })
    }

    // Get queue statistics
    const [queueStats] = await pool.query(
      `SELECT
        COUNT(*) AS total_antrean,
        COUNT(IF(DATE(updated_at) = CURDATE() AND status_pinjaman != 'antrean', 1, NULL)) AS processed_today
       FROM pinjaman
       WHERE status_pinjaman = 'antrean'`,
    )

    // Calculate estimated waiting time
    let estimatedWaitingTime = 0
    if (loanStatus[0].posisi_antrean) {
      const [waitingTime] = await pool.query(
        `SELECT SUM(burst_time) AS total_burst_time
         FROM pinjaman
         WHERE status_pinjaman = 'antrean'
         AND posisi_antrean <= ?`,
        [loanStatus[0].posisi_antrean],
      )
      estimatedWaitingTime = waitingTime[0].total_burst_time || 0
    }

    return res.status(200).json({
      status: 'success',
      data: {
        loanStatus: loanStatus[0],
        queueStats: {
          ...queueStats[0],
          estimatedWaitingTime,
        },
      },
    })
  } catch (error) {
    console.error('Loan status fetch error:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

/**
 * Get processed loan applications
 * GET /api/fcfs/processed
 */
router.get('/processed', async (req, res) => {
  try {
    // Get processed items with limit 50
    const [processedItems] = await pool.query(
      `SELECT p.id, p.anggota_id, p.jumlah, p.tenor, p.bunga, p.tujuan,
       p.arrival_time, p.status_pinjaman, p.start_process_time, p.finish_process_time,
       p.burst_time, p.waiting_time, p.catatan,
       a.nomor_anggota, u.name
       FROM pinjaman p
       JOIN anggota a ON p.anggota_id = a.id
       JOIN users u ON a.user_id = u.id
       WHERE p.status_pinjaman IN ('disetujui', 'ditolak', 'verifikasi')
       ORDER BY p.finish_process_time DESC
       LIMIT 50`,
    )

    return res.status(200).json({
      status: 'success',
      data: {
        processedItems,
      },
    })
  } catch (error) {
    console.error('Processed items fetch error:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

/**
 * Approve a loan application
 * POST /api/fcfs/approve/:id
 */
router.post('/approve/:id', checkRole(['pengurus']), async (req, res) => {
  try {
    const { id } = req.params
    const { notes } = req.body

    // Update loan status and add notes
    const [result] = await pool.query(
      `UPDATE pinjaman
       SET status_pinjaman = 'disetujui',
           finish_process_time = NOW(),
           catatan = ?
       WHERE id = ?`,
      [notes, id],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Loan not found' })
    }

    // Update queue positions for remaining items
    await pool.query(
      `UPDATE pinjaman
       SET posisi_antrean = posisi_antrean - 1
       WHERE status_pinjaman = 'antrean' AND posisi_antrean > 0`,
    )

    return res.status(200).json({
      status: 'success',
      data: { success: true },
    })
  } catch (error) {
    console.error('Approve loan error:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

/**
 * Reject a loan application
 * POST /api/fcfs/reject/:id
 */
router.post('/reject/:id', checkRole(['pengurus']), async (req, res) => {
  try {
    const { id } = req.params
    const { notes } = req.body

    // Update loan status and add notes
    const [result] = await pool.query(
      `UPDATE pinjaman
       SET status_pinjaman = 'ditolak',
           finish_process_time = NOW(),
           catatan = ?
       WHERE id = ?`,
      [notes, id],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Loan not found' })
    }

    // Update queue positions for remaining items
    await pool.query(
      `UPDATE pinjaman
       SET posisi_antrean = posisi_antrean - 1
       WHERE status_pinjaman = 'antrean' AND posisi_antrean > 0`,
    )

    return res.status(200).json({
      status: 'success',
      data: { success: true },
    })
  } catch (error) {
    console.error('Reject loan error:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

/**
 * Skip a loan application (put back in queue)
 * POST /api/fcfs/skip/:id
 */
router.post('/skip/:id', checkRole(['pengurus']), async (req, res) => {
  try {
    const { id } = req.params
    const { notes } = req.body

    // Get current queue length
    const [queueCount] = await pool.query(
      `SELECT COUNT(*) as count FROM pinjaman WHERE status_pinjaman = 'antrean'`,
    )
    const newPosition = queueCount[0].count

    // Update loan to be at the end of the queue with notes
    const [result] = await pool.query(
      `UPDATE pinjaman
       SET posisi_antrean = ?,
           catatan = CONCAT(COALESCE(catatan, ''), '\n', ?)
       WHERE id = ?`,
      [newPosition, notes || 'Skipped for further review', id],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Loan not found' })
    }

    // Update start_process_time to null
    await pool.query(
      `UPDATE pinjaman
       SET start_process_time = NULL
       WHERE id = ?`,
      [id],
    )

    return res.status(200).json({
      status: 'success',
      data: { success: true },
    })
  } catch (error) {
    console.error('Skip loan error:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

export default router
