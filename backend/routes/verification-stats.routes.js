// verification-stats.routes.js - Routes for verification statistics
import express from 'express'
import { pool } from '../db.js'
import { checkRole } from '../middleware/auth.middleware.js'

const router = express.Router()

/**
 * Get comprehensive verification statistics for dashboard
 * GET /api/verification-stats
 */
router.get('/', checkRole(['pengurus']), async (req, res) => {
  try {
    // Get overall statistics
    const [overall] = await pool.query(
      `SELECT
         COUNT(DISTINCT p.id) as total_loans,
         SUM(CASE WHEN p.status_pinjaman = 'verifikasi' THEN 1 ELSE 0 END) as pending_verification,
         SUM(CASE WHEN p.status_pinjaman = 'disetujui' THEN 1 ELSE 0 END) as approved,
         SUM(CASE WHEN p.status_pinjaman = 'ditolak' THEN 1 ELSE 0 END) as rejected,
         AVG(TIMESTAMPDIFF(MINUTE, p.start_process_time, p.finish_process_time)) as avg_processing_time_minutes
       FROM pinjaman p
       WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
    )

    // Get document verification statistics
    const [document_stats] = await pool.query(
      `SELECT
         COUNT(*) as total_count,
         SUM(CASE WHEN status = 'diterima' THEN 1 ELSE 0 END) as approved_count,
         SUM(CASE WHEN status = 'ditolak' THEN 1 ELSE 0 END) as rejected_count,
         SUM(CASE WHEN status = 'menunggu' THEN 1 ELSE 0 END) as pending_count
       FROM dokumen_pinjaman
       WHERE uploaded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
    )

    // Get document type approval rates
    const [document_types] = await pool.query(
      `SELECT
         jenis_dokumen as name,
         COUNT(*) as total_count,
         SUM(CASE WHEN status = 'diterima' THEN 1 ELSE 0 END) as approved_count,
         ROUND(SUM(CASE WHEN status = 'diterima' THEN 1 ELSE 0 END) / COUNT(*) * 100, 1) as approval_rate
       FROM dokumen_pinjaman
       WHERE uploaded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY jenis_dokumen
       ORDER BY total_count DESC`,
    )

    // Get processing time trend for last 7 days
    const [processing_time] = await pool.query(
      `SELECT
         DATE_FORMAT(finish_process_time, '%Y-%m-%d') as date,
         AVG(TIMESTAMPDIFF(MINUTE, start_process_time, finish_process_time)) as avg_minutes
       FROM pinjaman
       WHERE finish_process_time IS NOT NULL
         AND finish_process_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE_FORMAT(finish_process_time, '%Y-%m-%d')
       ORDER BY date`,
    )

    // Format the processing time trend for chart display
    const processing_time_trend = {
      labels: processing_time.map((item) => item.date),
      values: processing_time.map((item) => parseFloat(item.avg_minutes.toFixed(1))),
    }

    // Get officer performance stats
    const [officers] = await pool.query(
      `SELECT
         u.name as officer_name,
         COUNT(DISTINCT p.id) as total_processed,
         SUM(CASE WHEN p.status_pinjaman = 'disetujui' THEN 1 ELSE 0 END) as approved,
         SUM(CASE WHEN p.status_pinjaman = 'ditolak' THEN 1 ELSE 0 END) as rejected,
         AVG(TIMESTAMPDIFF(MINUTE, p.start_process_time, p.finish_process_time)) as avg_processing_minutes
       FROM pinjaman p
       JOIN users u ON p.diproses_oleh = u.id
       WHERE p.finish_process_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         AND p.status_pinjaman IN ('disetujui', 'ditolak')
       GROUP BY p.diproses_oleh, u.name
       ORDER BY total_processed DESC
       LIMIT 5`,
    )

    return res.status(200).json({
      status: 'success',
      data: {
        overall: overall[0],
        document_stats: document_stats[0],
        document_types,
        processing_time_trend,
        officers,
      },
    })
  } catch (error) {
    console.error('Error fetching verification statistics:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

export default router
