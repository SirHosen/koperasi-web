// cash.routes.js - Cash management endpoints
import express from 'express'
import { pool } from '../db.js'
import { checkRole } from '../middleware/auth.middleware.js'

const router = express.Router()

// Get cash balance snapshot (simple: verified simpanan - disbursed loans)
router.get('/balance', checkRole(['pengurus', 'admin']), async (_req, res) => {
  try {
    const [[{ kas_masuk = 0 }]] = await pool.query(
      `SELECT COALESCE(SUM(CASE WHEN jumlah > 0 THEN jumlah ELSE 0 END),0) kas_masuk FROM simpanan WHERE status = 'diverifikasi'`,
    )
    const [[{ kas_keluar = 0 }]] = await pool.query(
      `SELECT COALESCE(SUM(jumlah),0) kas_keluar FROM pinjaman WHERE status_pinjaman = 'pencairan' OR status_pinjaman = 'aktif'`,
    )
    res.json({ success: true, data: { saldo_kas: Number(kas_masuk) - Number(kas_keluar) } })
  } catch (error) {
    console.error('Cash balance error:', error)
    res.status(500).json({ success: false, message: 'Gagal memuat saldo kas' })
  }
})

// Liquidity projection for next N months (naive)
router.get('/liquidity', checkRole(['pengurus', 'admin']), async (req, res) => {
  try {
    const months = Math.min(parseInt(req.query.months) || 3, 12)

    // Average monthly inflow/outflow from last 6 months
    const [inflowRows] = await pool.query(
      `SELECT MONTH(tanggal) m, SUM(CASE WHEN jumlah>0 THEN jumlah ELSE 0 END) total
       FROM simpanan WHERE status='diverifikasi' AND tanggal>=DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY MONTH(tanggal)`,
    )
    const [outflowRows] = await pool.query(
      `SELECT MONTH(updated_at) m, SUM(jumlah) total
       FROM pinjaman WHERE status_pinjaman IN ('aktif','pencairan') AND updated_at>=DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY MONTH(updated_at)`,
    )
    const avgIn = inflowRows.length
      ? inflowRows.reduce((s, r) => s + Number(r.total || 0), 0) / inflowRows.length
      : 0
    const avgOut = outflowRows.length
      ? outflowRows.reduce((s, r) => s + Number(r.total || 0), 0) / outflowRows.length
      : 0

    const series = []
    for (let i = 1; i <= months; i++) {
      series.push({
        month_ahead: i,
        projected_inflow: avgIn,
        projected_outflow: avgOut,
        net: avgIn - avgOut,
      })
    }
    res.json({ success: true, data: { months, series } })
  } catch (error) {
    console.error('Liquidity projection error:', error)
    res.status(500).json({ success: false, message: 'Gagal memuat proyeksi likuiditas' })
  }
})

// Fund allocation suggestion based on queue size
router.get('/allocation', checkRole(['pengurus', 'admin']), async (_req, res) => {
  try {
    const [[{ saldo = 0 }]] = await pool.query(
      `SELECT COALESCE(SUM(CASE WHEN jumlah > 0 THEN jumlah ELSE 0 END),0) -
              COALESCE((SELECT SUM(jumlah) FROM pinjaman WHERE status_pinjaman IN ('pencairan','aktif')),0) AS saldo`,
    )
    const [[{ need = 0 }]] = await pool.query(
      `SELECT COALESCE(SUM(jumlah),0) AS need FROM pinjaman WHERE status_pinjaman = 'antrean'`,
    )
    const coverage = saldo > 0 ? Math.min(1, Number(saldo) / Number(need || 1)) : 0
    res.json({ success: true, data: { saldo, kebutuhan_antrean: need, coverage_ratio: coverage } })
  } catch (error) {
    console.error('Fund allocation error:', error)
    res.status(500).json({ success: false, message: 'Gagal memuat alokasi dana' })
  }
})

export default router



