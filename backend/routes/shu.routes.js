// shu.routes.js - Routes for Sisa Hasil Usaha (SHU) operations
import express from 'express'
import { pool } from '../db.js'

const router = express.Router()

// Get SHU summary for a member
router.get('/summary/:anggotaId', async (req, res) => {
  try {
    const { anggotaId } = req.params
    const { year = new Date().getFullYear() } = req.query
    
    // Get member's SHU data for the year
    const [shuData] = await pool.execute(
      `SELECT 
        COALESCE(SUM(CASE WHEN jenis = 'jasa_modal' THEN jumlah ELSE 0 END), 0) as jasa_modal,
        COALESCE(SUM(CASE WHEN jenis = 'jasa_anggota' THEN jumlah ELSE 0 END), 0) as jasa_anggota,
        COALESCE(SUM(jumlah), 0) as total_shu
       FROM shu 
       WHERE anggota_id = ? AND YEAR(tanggal_pembagian) = ?`,
      [anggotaId, year]
    )
    
    // Get member's simpanan and transaction activity for calculation
    const [memberData] = await pool.execute(
      `SELECT 
        COALESCE(SUM(CASE WHEN s.jenis = 'pokok' THEN s.jumlah ELSE 0 END), 0) as simpanan_pokok,
        COALESCE(SUM(CASE WHEN s.jenis = 'wajib' THEN s.jumlah ELSE 0 END), 0) as simpanan_wajib,
        COALESCE(SUM(CASE WHEN s.jenis = 'sukarela' THEN s.jumlah ELSE 0 END), 0) as simpanan_sukarela,
        COUNT(DISTINCT p.id) as jumlah_transaksi_pinjaman
       FROM anggota a
       LEFT JOIN simpanan s ON a.id = s.anggota_id AND YEAR(s.created_at) = ?
       LEFT JOIN pinjaman p ON a.id = p.anggota_id AND YEAR(p.created_at) = ?
       WHERE a.id = ?`,
      [year, year, anggotaId]
    )
    
    res.json({
      success: true,
      data: {
        year: parseInt(year),
        shu: shuData[0] || { jasa_modal: 0, jasa_anggota: 0, total_shu: 0 },
        member_contribution: memberData[0] || {
          simpanan_pokok: 0,
          simpanan_wajib: 0,
          simpanan_sukarela: 0,
          jumlah_transaksi_pinjaman: 0
        }
      }
    })
  } catch (error) {
    console.error('Error fetching SHU summary:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat data SHU'
    })
  }
})

// Get SHU history for a member
router.get('/history/:anggotaId', async (req, res) => {
  try {
    const { anggotaId } = req.params
    const { page = 1, limit = 10, year = '' } = req.query
    const offset = (page - 1) * limit
    
    let whereClause = 'anggota_id = ?'
    let params = [anggotaId]
    
    if (year) {
      whereClause += ' AND YEAR(tanggal_pembagian) = ?'
      params.push(year)
    }
    
    const [history] = await pool.execute(
      `SELECT id, tahun, jenis, jumlah, persentase, keterangan, 
              tanggal_pembagian, status, created_at
       FROM shu 
       WHERE ${whereClause}
       ORDER BY tanggal_pembagian DESC, created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )
    
    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM shu WHERE ${whereClause}`,
      params
    )
    
    const total = countResult[0].total
    const totalPages = Math.ceil(total / limit)
    
    res.json({
      success: true,
      data: history,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching SHU history:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat riwayat SHU'
    })
  }
})

// Calculate and distribute SHU (Admin/Pengurus only)
router.post('/calculate', async (req, res) => {
  try {
    const {
      tahun,
      total_shu,
      persentase_jasa_modal,
      persentase_jasa_anggota,
      keterangan
    } = req.body
    
    // Validate input
    if (!tahun || !total_shu || !persentase_jasa_modal || !persentase_jasa_anggota) {
      return res.status(400).json({
        success: false,
        message: 'Data perhitungan SHU tidak lengkap'
      })
    }
    
    if (persentase_jasa_modal + persentase_jasa_anggota !== 100) {
      return res.status(400).json({
        success: false,
        message: 'Total persentase harus 100%'
      })
    }
    
    // Get all active members with their contributions
    const [members] = await pool.execute(
      `SELECT 
        a.id, a.nama,
        COALESCE(SUM(CASE WHEN s.jenis = 'pokok' THEN s.jumlah ELSE 0 END), 0) as simpanan_pokok,
        COALESCE(SUM(CASE WHEN s.jenis = 'wajib' THEN s.jumlah ELSE 0 END), 0) as simpanan_wajib,
        COALESCE(SUM(CASE WHEN s.jenis = 'sukarela' THEN s.jumlah ELSE 0 END), 0) as simpanan_sukarela,
        COALESCE(SUM(CASE WHEN p.status_pinjaman = 'lunas' THEN p.bunga_total ELSE 0 END), 0) as kontribusi_bunga
       FROM anggota a
       LEFT JOIN simpanan s ON a.id = s.anggota_id AND YEAR(s.created_at) = ?
       LEFT JOIN pinjaman p ON a.id = p.anggota_id AND YEAR(p.created_at) = ?
       WHERE a.status_keanggotaan = 'aktif'
       GROUP BY a.id, a.nama`,
      [tahun, tahun]
    )
    
    // Calculate totals for proportional distribution
    const totalModal = members.reduce((sum, member) => 
      sum + member.simpanan_pokok + member.simpanan_wajib + member.simpanan_sukarela, 0
    )
    const totalKontribusi = members.reduce((sum, member) => sum + member.kontribusi_bunga, 0)
    
    const jasaModal = total_shu * (persentase_jasa_modal / 100)
    const jasaAnggota = total_shu * (persentase_jasa_anggota / 100)
    
    // Start transaction
    await pool.beginTransaction()
    
    try {
      // Delete existing SHU for this year (if recalculating)
      await pool.execute(
        'DELETE FROM shu WHERE tahun = ?',
        [tahun]
      )
      
      // Calculate and insert SHU for each member
      for (const member of members) {
        const modalMember = member.simpanan_pokok + member.simpanan_wajib + member.simpanan_sukarela
        const kontribusiMember = member.kontribusi_bunga
        
        // Calculate jasa modal (proportional to savings)
        const jasaModalMember = totalModal > 0 ? (modalMember / totalModal) * jasaModal : 0
        
        // Calculate jasa anggota (proportional to loan interest contribution)
        const jasaAnggotaMember = totalKontribusi > 0 ? (kontribusiMember / totalKontribusi) * jasaAnggota : jasaAnggota / members.length
        
        // Insert jasa modal
        if (jasaModalMember > 0) {
          await pool.execute(
            `INSERT INTO shu (anggota_id, tahun, jenis, jumlah, persentase, keterangan, 
                            tanggal_pembagian, status, created_at) 
             VALUES (?, ?, 'jasa_modal', ?, ?, ?, CURDATE(), 'dibagikan', NOW())`,
            [member.id, tahun, jasaModalMember, persentase_jasa_modal, 
             `${keterangan} - Jasa Modal`]
          )
        }
        
        // Insert jasa anggota
        if (jasaAnggotaMember > 0) {
          await pool.execute(
            `INSERT INTO shu (anggota_id, tahun, jenis, jumlah, persentase, keterangan, 
                            tanggal_pembagian, status, created_at) 
             VALUES (?, ?, 'jasa_anggota', ?, ?, ?, CURDATE(), 'dibagikan', NOW())`,
            [member.id, tahun, jasaAnggotaMember, persentase_jasa_anggota, 
             `${keterangan} - Jasa Anggota`]
          )
        }
      }
      
      await pool.commit()
      
      res.json({
        success: true,
        message: `SHU tahun ${tahun} berhasil dihitung dan dibagikan`,
        data: {
          tahun,
          total_shu,
          jasa_modal: jasaModal,
          jasa_anggota: jasaAnggota,
          jumlah_anggota: members.length
        }
      })
    } catch (error) {
      await pool.rollback()
      throw error
    }
  } catch (error) {
    console.error('Error calculating SHU:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal menghitung SHU'
    })
  }
})

// Get SHU statistics for admin dashboard
router.get('/stats', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear()
    
    // Get current year SHU stats
    const [currentYearStats] = await pool.execute(
      `SELECT 
        COALESCE(SUM(jumlah), 0) as total_shu_dibagikan,
        COUNT(DISTINCT anggota_id) as jumlah_penerima,
        COALESCE(AVG(jumlah), 0) as rata_rata_shu
       FROM shu 
       WHERE tahun = ? AND status = 'dibagikan'`,
      [currentYear]
    )
    
    // Get historical SHU by year
    const [historicalStats] = await pool.execute(
      `SELECT 
        tahun,
        SUM(jumlah) as total_shu,
        COUNT(DISTINCT anggota_id) as jumlah_penerima
       FROM shu 
       WHERE status = 'dibagikan'
       GROUP BY tahun 
       ORDER BY tahun DESC 
       LIMIT 5`
    )
    
    res.json({
      success: true,
      data: {
        current_year: {
          year: currentYear,
          ...currentYearStats[0]
        },
        historical: historicalStats
      }
    })
  } catch (error) {
    console.error('Error fetching SHU stats:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat statistik SHU'
    })
  }
})

export default router