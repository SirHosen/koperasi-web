// anggota.routes.js - Routes for member (anggota) operations
import express from 'express'
import { pool } from '../db.js'
import { checkRole } from '../middleware/auth.middleware.js'
import ExcelJS from 'exceljs'
import multer from 'multer'

const router = express.Router()

// Multer for bulk import files
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

// Get member profile by ID
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params

    const [result] = await pool.execute(
      `SELECT id, nama, email, telepon, alamat, tanggal_bergabung,
              jenis_kelamin, tempat_lahir, tanggal_lahir, pekerjaan,
              penghasilan_bulanan, status_keanggotaan, foto_profil
       FROM anggota WHERE id = ?`,
      [id],
    )

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Anggota tidak ditemukan',
      })
    }

    res.json({
      success: true,
      data: result[0],
    })
  } catch (error) {
    console.error('Error fetching member profile:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat profil anggota',
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
      penghasilan_bulanan,
    } = req.body

    const [result] = await pool.execute(
      `UPDATE anggota SET
        nama = ?, telepon = ?, alamat = ?, jenis_kelamin = ?,
        tempat_lahir = ?, tanggal_lahir = ?, pekerjaan = ?,
        penghasilan_bulanan = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        nama,
        telepon,
        alamat,
        jenis_kelamin,
        tempat_lahir,
        tanggal_lahir,
        pekerjaan,
        penghasilan_bulanan,
        id,
      ],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Anggota tidak ditemukan',
      })
    }

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui',
    })
  } catch (error) {
    console.error('Error updating member profile:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui profil',
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
      [id, id, parseInt(limit), offset],
    )

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM (
        SELECT id FROM pinjaman WHERE anggota_id = ?
        UNION ALL
        SELECT id FROM simpanan WHERE anggota_id = ?
      ) AS combined_count`,
      [id, id],
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
        itemsPerPage: parseInt(limit),
      },
    })
  } catch (error) {
    console.error('Error fetching member activity:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat riwayat aktivitas',
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
      [...params, parseInt(limit), offset],
    )

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM anggota WHERE ${whereClause}`,
      params,
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
        itemsPerPage: parseInt(limit),
      },
    })
  } catch (error) {
    console.error('Error fetching members:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat data anggota',
    })
  }
})

// Admin: Create new member (minimal fields)
router.post('/', checkRole(['pengurus', 'admin']), async (req, res) => {
  try {
    const { nama, email, telepon, alamat, status_keanggotaan = 'aktif' } = req.body

    if (!nama) {
      return res.status(400).json({ success: false, message: 'Nama wajib diisi' })
    }

    const [result] = await pool.execute(
      `INSERT INTO anggota (nama, email, telepon, alamat, status_keanggotaan, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [nama, email || null, telepon || null, alamat || null, status_keanggotaan],
    )

    res.json({ success: true, message: 'Anggota berhasil dibuat', data: { id: result.insertId } })
  } catch (error) {
    console.error('Error creating member:', error)
    res.status(500).json({ success: false, message: 'Gagal membuat anggota' })
  }
})

// Admin: Update member master data
router.put('/:id', checkRole(['pengurus', 'admin']), async (req, res) => {
  try {
    const { id } = req.params
    const { nama, email, telepon, alamat, status_keanggotaan } = req.body

    const [result] = await pool.execute(
      `UPDATE anggota SET
       nama = COALESCE(?, nama),
       email = COALESCE(?, email),
       telepon = COALESCE(?, telepon),
       alamat = COALESCE(?, alamat),
       status_keanggotaan = COALESCE(?, status_keanggotaan),
       updated_at = NOW()
       WHERE id = ?`,
      [nama, email, telepon, alamat, status_keanggotaan, id],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan' })
    }

    res.json({ success: true, message: 'Data anggota berhasil diperbarui' })
  } catch (error) {
    console.error('Error updating member master:', error)
    res.status(500).json({ success: false, message: 'Gagal memperbarui data anggota' })
  }
})

// Admin: Change member status (aktif/non-aktif/keluar)
router.put('/:id/status', checkRole(['pengurus', 'admin']), async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const allowed = ['aktif', 'non-aktif', 'keluar']
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status tidak valid' })
    }
    const [result] = await pool.execute(
      `UPDATE anggota SET status_keanggotaan = ?, updated_at = NOW() WHERE id = ?`,
      [status, id],
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan' })
    }
    res.json({ success: true, message: 'Status anggota diperbarui' })
  } catch (error) {
    console.error('Error updating status:', error)
    res.status(500).json({ success: false, message: 'Gagal memperbarui status anggota' })
  }
})

// Admin: Delete member
router.delete('/:id', checkRole(['pengurus', 'admin']), async (req, res) => {
  try {
    const { id } = req.params
    const [result] = await pool.execute('DELETE FROM anggota WHERE id = ?', [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan' })
    }
    res.json({ success: true, message: 'Anggota berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting member:', error)
    res.status(500).json({ success: false, message: 'Gagal menghapus anggota' })
  }
})

// Admin: Bulk import members from Excel (xlsx)
router.post(
  '/bulk/import',
  [checkRole(['pengurus', 'admin']), upload.single('file')],
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'File tidak ditemukan' })
      }

      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(req.file.buffer)
      const sheet = workbook.worksheets[0]

      let inserted = 0
      for (let i = 2; i <= sheet.rowCount; i++) {
        const row = sheet.getRow(i)
        const nama = row.getCell(1).value?.toString().trim()
        const email = row.getCell(2).value?.toString().trim() || null
        const telepon = row.getCell(3).value?.toString().trim() || null
        const alamat = row.getCell(4).value?.toString().trim() || null
        const status = row.getCell(5).value?.toString().trim() || 'aktif'
        if (!nama) continue
        await pool.execute(
          `INSERT INTO anggota (nama, email, telepon, alamat, status_keanggotaan, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
          [nama, email, telepon, alamat, status],
        )
        inserted++
      }

      res.json({ success: true, message: 'Import berhasil', data: { inserted } })
    } catch (error) {
      console.error('Bulk import error:', error)
      res.status(500).json({ success: false, message: 'Gagal import data anggota' })
    }
  },
)

// Admin: Export members (excel or csv)
router.get('/export', checkRole(['pengurus', 'admin']), async (req, res) => {
  try {
    const format = (req.query.format || 'excel').toString()
    const [members] = await pool.execute(
      `SELECT id, nama, email, telepon, alamat, status_keanggotaan, tanggal_bergabung, created_at
       FROM anggota ORDER BY created_at DESC LIMIT 5000`,
    )

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename=anggota.csv')
      const header = 'id,nama,email,telepon,alamat,status,tanggal_bergabung,created_at\n'
      const lines = members
        .map((m) =>
          [
            m.id,
            JSON.stringify(m.nama || ''),
            JSON.stringify(m.email || ''),
            JSON.stringify(m.telepon || ''),
            JSON.stringify(m.alamat || ''),
            JSON.stringify(m.status_keanggotaan || ''),
            m.tanggal_bergabung ? new Date(m.tanggal_bergabung).toISOString().slice(0, 10) : '',
            m.created_at ? new Date(m.created_at).toISOString() : '',
          ].join(','),
        )
        .join('\n')
      res.send(header + lines)
      return
    }

    // excel
    const wb = new ExcelJS.Workbook()
    const sheet = wb.addWorksheet('Anggota')
    sheet.columns = [
      { header: 'ID', key: 'id', width: 24 },
      { header: 'Nama', key: 'nama', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Telepon', key: 'telepon', width: 18 },
      { header: 'Alamat', key: 'alamat', width: 40 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Tanggal Bergabung', key: 'tanggal_bergabung', width: 20 },
      { header: 'Created At', key: 'created_at', width: 24 },
    ]
    members.forEach((m) => {
      sheet.addRow({
        id: m.id,
        nama: m.nama,
        email: m.email,
        telepon: m.telepon,
        alamat: m.alamat,
        status: m.status_keanggotaan,
        tanggal_bergabung: m.tanggal_bergabung
          ? new Date(m.tanggal_bergabung).toISOString().slice(0, 10)
          : '',
        created_at: m.created_at ? new Date(m.created_at).toISOString() : '',
      })
    })
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    res.setHeader('Content-Disposition', 'attachment; filename=anggota.xlsx')
    await wb.xlsx.write(res)
    res.end()
  } catch (error) {
    console.error('Export anggota error:', error)
    res.status(500).json({ success: false, message: 'Gagal export data anggota' })
  }
})

export default router
