// regulatory.routes.js - Regulatory reports scaffolding
import express from 'express'
import { pool } from '../db.js'
import { checkRole } from '../middleware/auth.middleware.js'

const router = express.Router()

// Templates list (mock identifiers based on Permenkop No.8/2023)
router.get('/templates', checkRole(['pengurus', 'admin', 'pengawas']), async (_req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'neraca', name: 'Neraca', schedule: 'bulanan' },
      { id: 'laba_rugi', name: 'Laporan Laba Rugi', schedule: 'bulanan' },
      { id: 'rasio_kinerja', name: 'Rasio Kinerja Koperasi', schedule: 'triwulan' },
      { id: 'npl', name: 'NPL Ratio', schedule: 'bulanan' },
    ],
  })
})

// Generate a report (stub data)
router.get('/generate/:templateId', checkRole(['pengurus', 'admin']), async (req, res) => {
  try {
    const { templateId } = req.params
    const {
      period = 'month',
      year = new Date().getFullYear(),
      month = new Date().getMonth() + 1,
    } = req.query

    // Basic data gathering (stub; real version aggregates GL)
    const [[{ total_simpanan = 0 }]] = await pool.query(
      `SELECT COALESCE(SUM(jumlah),0) total_simpanan FROM simpanan WHERE status='diverifikasi' AND YEAR(tanggal)=?`,
      [year],
    )
    const [[{ total_pinjaman = 0 }]] = await pool.query(
      `SELECT COALESCE(SUM(jumlah),0) total_pinjaman FROM pinjaman WHERE YEAR(created_at)=?`,
      [year],
    )

    const payload = {
      templateId,
      period,
      year: Number(year),
      month: Number(month),
      metrics: { total_simpanan: Number(total_simpanan), total_pinjaman: Number(total_pinjaman) },
      generated_at: new Date().toISOString(),
    }

    res.json({ success: true, data: payload })
  } catch (error) {
    console.error('Generate regulatory error:', error)
    res.status(500).json({ success: false, message: 'Gagal membuat laporan regulatori' })
  }
})

export default router



