// admin.routes.js - Routes for admin operations
import express from 'express'
import { pool } from '../db.js'

const router = express.Router()

// Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    // Get member statistics
    const [memberStats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_anggota,
        SUM(CASE WHEN status_keanggotaan = 'aktif' THEN 1 ELSE 0 END) as anggota_aktif,
        SUM(CASE WHEN status_keanggotaan = 'nonaktif' THEN 1 ELSE 0 END) as anggota_nonaktif,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as anggota_baru_hari_ini
       FROM anggota`
    )
    
    // Get savings statistics
    const [savingsStats] = await pool.execute(
      `SELECT 
        COALESCE(SUM(CASE WHEN jenis = 'pokok' AND jumlah > 0 THEN jumlah ELSE 0 END), 0) as total_simpanan_pokok,
        COALESCE(SUM(CASE WHEN jenis = 'wajib' AND jumlah > 0 THEN jumlah ELSE 0 END), 0) as total_simpanan_wajib,
        COALESCE(SUM(CASE WHEN jenis = 'sukarela' AND jumlah > 0 THEN jumlah ELSE 0 END), 0) as total_simpanan_sukarela,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as transaksi_hari_ini
       FROM simpanan`
    )
    
    // Get loan statistics
    const [loanStats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_pinjaman,
        COALESCE(SUM(jumlah_pinjaman), 0) as total_nilai_pinjaman,
        SUM(CASE WHEN status_pinjaman = 'menunggu' THEN 1 ELSE 0 END) as pinjaman_menunggu,
        SUM(CASE WHEN status_pinjaman = 'disetujui' THEN 1 ELSE 0 END) as pinjaman_disetujui,
        SUM(CASE WHEN status_pinjaman = 'ditolak' THEN 1 ELSE 0 END) as pinjaman_ditolak,
        SUM(CASE WHEN status_pinjaman = 'aktif' THEN 1 ELSE 0 END) as pinjaman_aktif,
        SUM(CASE WHEN status_pinjaman = 'lunas' THEN 1 ELSE 0 END) as pinjaman_lunas
       FROM pinjaman`
    )
    
    res.json({
      success: true,
      data: {
        members: memberStats[0],
        savings: {
          ...savingsStats[0],
          total_simpanan: savingsStats[0].total_simpanan_pokok + 
                         savingsStats[0].total_simpanan_wajib + 
                         savingsStats[0].total_simpanan_sukarela
        },
        loans: loanStats[0]
      }
    })
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat statistik dashboard'
    })
  }
})

// Get recent activities
router.get('/dashboard/activities', async (req, res) => {
  try {
    const { limit = 10 } = req.query
    
    const [activities] = await pool.execute(
      `SELECT * FROM (
        SELECT 
          'member' as type,
          CONCAT('Anggota baru: ', nama) as description,
          created_at,
          id as reference_id
        FROM anggota 
        WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        
        UNION ALL
        
        SELECT 
          'savings' as type,
          CONCAT('Simpanan ', jenis, ': Rp ', FORMAT(ABS(jumlah), 0)) as description,
          created_at,
          id as reference_id
        FROM simpanan 
        WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        
        UNION ALL
        
        SELECT 
          'loan' as type,
          CONCAT('Pinjaman ', FORMAT(jumlah_pinjaman, 0), ' - ', status_pinjaman) as description,
          created_at,
          id as reference_id
        FROM pinjaman 
        WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      ) as combined_activities
      ORDER BY created_at DESC
      LIMIT ?`,
      [parseInt(limit)]
    )
    
    res.json({
      success: true,
      data: activities
    })
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat aktivitas terbaru'
    })
  }
})

// System configuration endpoints
router.get('/config', async (req, res) => {
  try {
    const [config] = await pool.execute(
      'SELECT * FROM sistem_config ORDER BY created_at DESC'
    )
    
    res.json({
      success: true,
      data: config
    })
  } catch (error) {
    console.error('Error fetching system config:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat konfigurasi sistem'
    })
  }
})

router.put('/config/:key', async (req, res) => {
  try {
    const { key } = req.params
    const { value, description } = req.body
    
    const [result] = await pool.execute(
      `INSERT INTO sistem_config (config_key, config_value, description, updated_at)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE 
       config_value = VALUES(config_value),
       description = VALUES(description),
       updated_at = NOW()`,
      [key, value, description]
    )
    
    res.json({
      success: true,
      message: 'Konfigurasi berhasil diperbarui'
    })
  } catch (error) {
    console.error('Error updating system config:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui konfigurasi'
    })
  }
})

export default router