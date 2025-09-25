// anggota.routes.js - Routes for member (anggota) operations
import express from 'express'
import { pool } from '../db.js'

const router = express.Router()

// Get member profile by ID
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const [result] = await pool.execute(
      `SELECT id, nama, email, telepon, alamat, tanggal_bergabung, 
              jenis_kelamin, tempat_lahir, tanggal_lahir, pekerjaan,
              penghasilan_bulanan, status_keanggotaan, foto_profil
       FROM anggota WHERE id = ?`,
      [id]
    )
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Anggota tidak ditemukan'
      })
    }
    
    res.json({
      success: true,
      data: result[0]
    })
  } catch (error) {
    console.error('Error fetching member profile:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat profil anggota'
    })
  }
})

// Update member profile
router.put('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      nama,
      telepon,
      alamat,
      jenis_kelamin,
      tempat_lahir,
      tanggal_lahir,
      pekerjaan,
      penghasilan_bulanan
    } = req.body
    
    const [result] = await pool.execute(
      `UPDATE anggota SET 
        nama = ?, telepon = ?, alamat = ?, jenis_kelamin = ?,
        tempat_lahir = ?, tanggal_lahir = ?, pekerjaan = ?, 
        penghasilan_bulanan = ?, updated_at = NOW()
       WHERE id = ?`,
      [nama, telepon, alamat, jenis_kelamin, tempat_lahir, 
       tanggal_lahir, pekerjaan, penghasilan_bulanan, id]
    )
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Anggota tidak ditemukan'
      })
    }
    
    res.json({
      success: true,
      message: 'Profil berhasil diperbarui'
    })
  } catch (error) {
    console.error('Error updating member profile:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui profil'
    })
  }
})

// Get member activity history
router.get('/activity/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit
    
    const [activities] = await pool.execute(
      `SELECT * FROM (
        SELECT 'pinjaman' as type, 'Pengajuan Pinjaman' as action, 
               jumlah_pinjaman as amount, created_at, status_pinjaman as status
        FROM pinjaman WHERE anggota_id = ?
        UNION ALL
        SELECT 'simpanan' as type, 
               CASE 
                 WHEN jumlah > 0 THEN 'Penyetoran Simpanan'
                 ELSE 'Penarikan Simpanan'
               END as action,
               ABS(jumlah) as amount, created_at, status
        FROM simpanan WHERE anggota_id = ?
      ) AS combined_activities
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?`,
      [id, id, parseInt(limit), offset]
    )
    
    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM (
        SELECT id FROM pinjaman WHERE anggota_id = ?
        UNION ALL
        SELECT id FROM simpanan WHERE anggota_id = ?
      ) AS combined_count`,
      [id, id]
    )
    
    const total = countResult[0].total
    const totalPages = Math.ceil(total / limit)
    
    res.json({
      success: true,
      data: activities,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching member activity:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat riwayat aktivitas'
    })
  }
})

// Get all members (for admin/pengurus)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query
    const offset = (page - 1) * limit
    
    let whereClause = '1 = 1'
    let params = []
    
    if (search) {
      whereClause += ' AND (nama LIKE ? OR email LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }
    
    if (status) {
      whereClause += ' AND status_keanggotaan = ?'
      params.push(status)
    }
    
    const [members] = await pool.execute(
      `SELECT id, nama, email, telepon, status_keanggotaan, 
              tanggal_bergabung, created_at
       FROM anggota 
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )
    
    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM anggota WHERE ${whereClause}`,
      params
    )
    
    const total = countResult[0].total
    const totalPages = Math.ceil(total / limit)
    
    res.json({
      success: true,
      data: members,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching members:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat data anggota'
    })
  }
})

export default router