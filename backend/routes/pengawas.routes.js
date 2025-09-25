// pengawas.routes.js - Routes for supervisor (pengawas) operations
import express from 'express'
import { pool } from '../db.js'
import { authenticateJWT } from '../middleware/auth.middleware.js'

const router = express.Router()

// Get financial oversight data
router.get('/oversight/financial', authenticateJWT, async (req, res) => {
  try {
    const { year, month } = req.query;
    
    // Check if user is pengawas
    if (req.user.role !== 'pengawas') {
      return res.status(403).json({ error: 'Access denied. Pengawas role required.' });
    }
    
    let dateFilter = 'YEAR(tanggal_transaksi) = ?';
    const filterParams = [year || new Date().getFullYear()];
    
    if (month) {
      dateFilter += ' AND MONTH(tanggal_transaksi) = ?';
      filterParams.push(month);
    }
    
    // Get savings overview
    const [savingsRows] = await pool.execute(`
      SELECT 
        jenis,
        SUM(CASE WHEN jenis_transaksi = 'setor' THEN jumlah ELSE 0 END) AS total_setor,
        SUM(CASE WHEN jenis_transaksi = 'tarik' THEN jumlah ELSE 0 END) AS total_tarik,
        COUNT(*) AS jumlah_transaksi
      FROM simpanan_transaksi 
      WHERE ${dateFilter}
      GROUP BY jenis
    `, filterParams);
    
    // Get loans overview
    const [loansRows] = await pool.execute(`
      SELECT 
        status_pinjaman,
        COUNT(*) AS jumlah,
        SUM(jumlah_pinjaman) AS total_nilai,
        AVG(bunga) AS rata_rata_bunga
      FROM pinjaman 
      WHERE ${dateFilter.replace('tanggal_transaksi', 'tanggal_pengajuan')}
      GROUP BY status_pinjaman
    `, filterParams);
    
    // Get cash flow (simplified calculation)
    const [cashFlowRows] = await pool.execute(`
      SELECT 
        'masuk' as jenis,
        SUM(jumlah) as total
      FROM simpanan_transaksi 
      WHERE jenis_transaksi = 'setor' AND ${dateFilter}
      
      UNION ALL
      
      SELECT 
        'keluar' as jenis,
        SUM(jumlah_pinjaman) as total
      FROM pinjaman 
      WHERE status_pinjaman = 'disetujui' AND ${dateFilter.replace('tanggal_transaksi', 'tanggal_pengajuan')}
    `, [...filterParams, ...filterParams]);
    
    res.json({
      success: true,
      data: {
        current_year: parseInt(year) || new Date().getFullYear(),
        savings: savingsRows,
        loans: loansRows,
        cash_flow: cashFlowRows
      }
    });
    
  } catch (error) {
    console.error('Error fetching financial oversight:', error);
    res.status(500).json({ 
      error: 'Failed to fetch financial oversight data',
      details: error.message 
    });
  }
});

// Get compliance monitoring metrics
router.get('/compliance/monitoring', auth, async (req, res) => {
  try {
    // Check if user is pengawas
    if (req.user.role !== 'pengawas') {
      return res.status(403).json({ error: 'Access denied. Pengawas role required.' });
    }
    
    const metrics = [];
    
    // Average loan approval time (in days)
    const [approvalTimeRows] = await pool.execute(`
      SELECT AVG(DATEDIFF(
        COALESCE(tanggal_disetujui, NOW()), 
        tanggal_pengajuan
      )) AS avg_days
      FROM pinjaman 
      WHERE status_pinjaman IN ('disetujui', 'ditolak')
        AND tanggal_pengajuan >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    metrics.push({
      metric: 'loan_approval_time',
      value: parseFloat(approvalTimeRows[0]?.avg_days || 0),
      description: 'Rata-rata Waktu Persetujuan Pinjaman (hari)'
    });
    
    // Pending verifications count
    const [pendingRows] = await pool.execute(`
      SELECT COUNT(*) AS count
      FROM pinjaman 
      WHERE status_pinjaman = 'menunggu'
    `);
    
    metrics.push({
      metric: 'pending_verifications',
      value: parseInt(pendingRows[0]?.count || 0),
      description: 'Jumlah Pinjaman Menunggu Verifikasi'
    });
    
    // Overdue loans (simplified - loans active > 12 months)
    const [overdueRows] = await pool.execute(`
      SELECT COUNT(*) AS count
      FROM pinjaman 
      WHERE status_pinjaman = 'aktif'
        AND tanggal_disetujui < DATE_SUB(NOW(), INTERVAL 12 MONTH)
    `);
    
    metrics.push({
      metric: 'overdue_loans',
      value: parseInt(overdueRows[0]?.count || 0),
      description: 'Jumlah Pinjaman Bermasalah'
    });
    
    // Member satisfaction (mock data - would need survey system)
    metrics.push({
      metric: 'member_satisfaction',
      value: 85.5,
      description: 'Tingkat Kepuasan Anggota (%)'
    });
    
    res.json({
      success: true,
      data: metrics
    });
    
  } catch (error) {
    console.error('Error fetching compliance metrics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch compliance metrics',
      details: error.message 
    });
  }
});

// Get recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    // Check if user is pengawas
    if (req.user.role !== 'pengawas') {
      return res.status(403).json({ error: 'Access denied. Pengawas role required.' });
    }
    
    const { limit = 10, offset = 0 } = req.query;
    
    // Mock recommendations data
    const mockRecommendations = [
      {
        id: 1,
        category: 'operasional',
        priority: 'tinggi',
        description: 'Implementasi sistem digital untuk mempercepat proses persetujuan pinjaman',
        target_date: '2024-06-30',
        status: 'active',
        created_at: '2024-01-15'
      },
      {
        id: 2,
        category: 'keuangan',
        priority: 'sedang',
        description: 'Diversifikasi portofolio investasi untuk meningkatkan pendapatan',
        target_date: '2024-09-30',
        status: 'pending',
        created_at: '2024-02-01'
      },
      {
        id: 3,
        category: 'kepatuhan',
        priority: 'tinggi',
        description: 'Update policy manual sesuai regulasi terbaru',
        target_date: '2024-04-30',
        status: 'active',
        created_at: '2024-02-15'
      },
      {
        id: 4,
        category: 'teknologi',
        priority: 'rendah',
        description: 'Upgrade sistem keamanan IT dan backup data',
        target_date: '2024-12-31',
        status: 'pending',
        created_at: '2024-03-01'
      },
      {
        id: 5,
        category: 'operasional',
        priority: 'sedang',
        description: 'Pelatihan berkala untuk staff customer service',
        target_date: '2024-07-31',
        status: 'completed',
        created_at: '2024-01-10'
      }
    ];
    
    const limitedRecommendations = mockRecommendations.slice(offset, offset + parseInt(limit));
    
    res.json({
      success: true,
      data: limitedRecommendations,
      total: mockRecommendations.length
    });
    
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recommendations',
      details: error.message 
    });
  }
});

// Get audit reports
router.get('/audit/reports', async (req, res) => {
  try {
    const { year = new Date().getFullYear(), type = '', page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit
    
    let whereClause = 'YEAR(tanggal_audit) = ?'
    let params = [year]
    
    if (type) {
      whereClause += ' AND jenis_audit = ?'
      params.push(type)
    }
    
    const [reports] = await pool.execute(
      `SELECT id, judul_audit, jenis_audit, tanggal_audit, 
              status_audit, temuan_utama, rekomendasi, 
              auditor, created_at
       FROM audit_reports 
       WHERE ${whereClause}
       ORDER BY tanggal_audit DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )
    
    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM audit_reports WHERE ${whereClause}`,
      params
    )
    
    const total = countResult[0].total
    const totalPages = Math.ceil(total / limit)
    
    res.json({
      success: true,
      data: reports,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching audit reports:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat laporan audit'
    })
  }
})

// Create new audit report
router.post('/audit/reports', async (req, res) => {
  try {
    const {
      judul_audit,
      jenis_audit,
      tanggal_audit,
      temuan_utama,
      rekomendasi,
      auditor
    } = req.body
    
    const [result] = await pool.execute(
      `INSERT INTO audit_reports 
       (judul_audit, jenis_audit, tanggal_audit, temuan_utama, 
        rekomendasi, auditor, status_audit, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'draft', NOW())`,
      [judul_audit, jenis_audit, tanggal_audit, temuan_utama, rekomendasi, auditor]
    )
    
    res.json({
      success: true,
      message: 'Laporan audit berhasil dibuat',
      data: { id: result.insertId }
    })
  } catch (error) {
    console.error('Error creating audit report:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal membuat laporan audit'
    })
  }
})

// Get financial oversight data
router.get('/oversight/financial', async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month = '' } = req.query
    
    let dateFilter = 'YEAR(created_at) = ?'
    let params = [year]
    
    if (month) {
      dateFilter += ' AND MONTH(created_at) = ?'
      params.push(month)
    }
    
    // Get savings overview
    const [savings] = await pool.execute(
      `SELECT 
        jenis,
        SUM(CASE WHEN jumlah > 0 THEN jumlah ELSE 0 END) as total_setor,
        SUM(CASE WHEN jumlah < 0 THEN ABS(jumlah) ELSE 0 END) as total_tarik,
        COUNT(*) as jumlah_transaksi
       FROM simpanan 
       WHERE ${dateFilter}
       GROUP BY jenis`,
      params
    )
    
    // Get loans overview
    const [loans] = await pool.execute(
      `SELECT 
        status_pinjaman,
        COUNT(*) as jumlah,
        SUM(jumlah_pinjaman) as total_nilai,
        AVG(bunga_persen) as rata_rata_bunga
       FROM pinjaman 
       WHERE ${dateFilter}
       GROUP BY status_pinjaman`,
      params
    )
    
    // Get cash flow summary
    const [cashFlow] = await pool.execute(
      `SELECT 
        'masuk' as jenis,
        SUM(CASE 
          WHEN s.jumlah > 0 THEN s.jumlah 
          WHEN p.status_pinjaman = 'lunas' THEN p.bunga_total 
          ELSE 0 
        END) as total
       FROM simpanan s
       LEFT JOIN pinjaman p ON DATE(s.created_at) = DATE(p.updated_at)
       WHERE ${dateFilter.replace('created_at', 's.created_at')}
       
       UNION ALL
       
       SELECT 
        'keluar' as jenis,
        SUM(CASE 
          WHEN s.jumlah < 0 THEN ABS(s.jumlah)
          WHEN p.status_pinjaman = 'pencairan' THEN p.jumlah_pinjaman
          ELSE 0 
        END) as total
       FROM simpanan s
       LEFT JOIN pinjaman p ON DATE(s.created_at) = DATE(p.updated_at)
       WHERE ${dateFilter.replace('created_at', 's.created_at')}`,
      [...params, ...params]
    )
    
    res.json({
      success: true,
      data: {
        period: { year: parseInt(year), month: month ? parseInt(month) : null },
        savings,
        loans,
        cash_flow: cashFlow
      }
    })
  } catch (error) {
    console.error('Error fetching financial oversight:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat data pengawasan keuangan'
    })
  }
})

// Get compliance monitoring
router.get('/compliance/monitoring', async (req, res) => {
  try {
    // Check various compliance metrics
    const [metrics] = await pool.execute(`
      SELECT 
        'loan_approval_time' as metric,
        AVG(DATEDIFF(updated_at, created_at)) as value,
        'Rata-rata waktu persetujuan pinjaman (hari)' as description
      FROM pinjaman 
      WHERE status_pinjaman IN ('disetujui', 'ditolak')
      AND updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      
      UNION ALL
      
      SELECT 
        'pending_verifications' as metric,
        COUNT(*) as value,
        'Jumlah verifikasi tertunda' as description
      FROM simpanan 
      WHERE status = 'menunggu'
      
      UNION ALL
      
      SELECT 
        'overdue_loans' as metric,
        COUNT(*) as value,
        'Jumlah pinjaman bermasalah' as description
      FROM pinjaman 
      WHERE status_pinjaman = 'aktif'
      AND tanggal_jatuh_tempo < CURDATE()
      
      UNION ALL
      
      SELECT 
        'member_growth' as metric,
        COUNT(*) as value,
        'Pertumbuhan anggota bulan ini' as description
      FROM anggota 
      WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
    `)
    
    res.json({
      success: true,
      data: metrics
    })
  } catch (error) {
    console.error('Error fetching compliance monitoring:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat monitoring kepatuhan'
    })
  }
})

// Generate supervisory recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const { category, priority, description, target_date } = req.body
    
    const [result] = await pool.execute(
      `INSERT INTO supervisory_recommendations 
       (category, priority, description, target_date, status, created_at)
       VALUES (?, ?, ?, ?, 'active', NOW())`,
      [category, priority, description, target_date]
    )
    
    res.json({
      success: true,
      message: 'Rekomendasi pengawasan berhasil ditambahkan',
      data: { id: result.insertId }
    })
  } catch (error) {
    console.error('Error creating recommendation:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal membuat rekomendasi'
    })
  }
})

// Get supervisory recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const { status = 'active', page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit
    
    const [recommendations] = await pool.execute(
      `SELECT id, category, priority, description, target_date, 
              status, created_at, updated_at
       FROM supervisory_recommendations 
       WHERE status = ?
       ORDER BY priority DESC, created_at DESC
       LIMIT ? OFFSET ?`,
      [status, parseInt(limit), offset]
    )
    
    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM supervisory_recommendations WHERE status = ?`,
      [status]
    )
    
    const total = countResult[0].total
    const totalPages = Math.ceil(total / limit)
    
    res.json({
      success: true,
      data: recommendations,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat rekomendasi'
    })
  }
})

export default router