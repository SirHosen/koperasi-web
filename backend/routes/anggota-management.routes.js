// routes/anggota-management.routes.js - Complete member management for pengurus
import express from 'express'
import { pool } from '../db.js'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcrypt'
import ExcelJS from 'exceljs'
import { checkRole } from '../middleware/auth.middleware.js'
import logger from '../utils/logger.js'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  paginatedResponse,
  handleDatabaseError,
  asyncHandler,
} from '../utils/response.js'

const router = express.Router()

/**
 * Get all members with pagination and filtering
 * GET /api/anggota-management
 */
router.get(
  '/',
  checkRole(['pengurus']),
  asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = 'all',
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = req.query

    const offset = (parseInt(page) - 1) * parseInt(limit)

    // Validate sort parameters
    const allowedSortFields = ['created_at', 'name', 'nomor_anggota', 'tanggal_bergabung']
    const allowedSortOrders = ['ASC', 'DESC']

    if (
      !allowedSortFields.includes(sortBy) ||
      !allowedSortOrders.includes(sortOrder.toUpperCase())
    ) {
      return validationErrorResponse(res, {
        sortBy: 'Invalid sort field',
        sortOrder: 'Invalid sort order',
      })
    }

    // Build WHERE clause
    let whereClause = '1=1'
    let queryParams = []

    if (search) {
      whereClause += ` AND (u.name LIKE ? OR a.nomor_anggota LIKE ? OR u.email LIKE ? OR a.nik LIKE ?)`
      const searchTerm = `%${search}%`
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm)
    }

    if (status !== 'all') {
      whereClause += ` AND a.status_aktif = ?`
      queryParams.push(status === 'active' ? 1 : 0)
    }

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total
     FROM anggota a
     JOIN users u ON a.user_id = u.id
     WHERE ${whereClause}`,
      queryParams,
    )
    const totalItems = countResult[0].total
    const totalPages = Math.ceil(totalItems / parseInt(limit))

    // Get members data
    const [members] = await pool.query(
      `SELECT
       a.id, a.nomor_anggota, a.nik, a.alamat, a.telepon,
       a.tanggal_bergabung, a.status_aktif, a.foto_profil,
       a.created_at, a.updated_at,
       u.id as user_id, u.name, u.email, u.username, u.is_active,
       u.last_login,
       -- Aggregate data
       COALESCE(SUM(s.jumlah), 0) as total_simpanan,
       COUNT(DISTINCT p.id) as total_pinjaman,
       COUNT(DISTINCT CASE WHEN p.status_pinjaman = 'aktif' THEN p.id END) as pinjaman_aktif
     FROM anggota a
     JOIN users u ON a.user_id = u.id
     LEFT JOIN simpanan s ON a.id = s.anggota_id AND s.status = 'diverifikasi'
     LEFT JOIN pinjaman p ON a.id = p.anggota_id
     WHERE ${whereClause}
     GROUP BY a.id, u.id
     ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
     LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit), offset],
    )

    return paginatedResponse(res, members, {
      currentPage: parseInt(page),
      totalPages,
      totalItems,
      itemsPerPage: parseInt(limit),
    })
  }),
)

/**
 * Get single member details
 * GET /api/anggota-management/:id
 */
router.get(
  '/:id',
  checkRole(['pengurus']),
  asyncHandler(async (req, res) => {
    const { id } = req.params

    const [members] = await pool.query(
      `SELECT
       a.*,
       u.name, u.email, u.username, u.is_active, u.last_login, u.created_at as user_created_at
     FROM anggota a
     JOIN users u ON a.user_id = u.id
     WHERE a.id = ?`,
      [id],
    )

    if (members.length === 0) {
      return errorResponse(res, 'Member not found', 404, 'MEMBER_NOT_FOUND')
    }

    const member = members[0]

    // Get member's savings summary
    const [savings] = await pool.query(
      `SELECT
       jenis,
       SUM(CASE WHEN jumlah > 0 THEN jumlah ELSE 0 END) as total_setor,
       SUM(CASE WHEN jumlah < 0 THEN ABS(jumlah) ELSE 0 END) as total_tarik,
       COUNT(*) as jumlah_transaksi
     FROM simpanan
     WHERE anggota_id = ? AND status = 'diverifikasi'
     GROUP BY jenis`,
      [id],
    )

    // Get member's loans
    const [loans] = await pool.query(
      `SELECT
       id, jumlah, tenor, bunga, tujuan, status_pinjaman,
       arrival_time, created_at, updated_at
     FROM pinjaman
     WHERE anggota_id = ?
     ORDER BY created_at DESC
     LIMIT 10`,
      [id],
    )

    return successResponse(res, {
      member,
      savings,
      loans,
    })
  }),
)

/**
 * Create new member
 * POST /api/anggota-management
 */
router.post(
  '/',
  checkRole(['pengurus']),
  asyncHandler(async (req, res) => {
    const {
      username,
      password,
      email,
      name,
      nik,
      alamat,
      telepon,
      tanggal_bergabung,
      simpanan_pokok = 0,
    } = req.body

    // Validation
    const errors = {}
    if (!username) errors.username = 'Username is required'
    if (!password) errors.password = 'Password is required'
    if (!email) errors.email = 'Email is required'
    if (!name) errors.name = 'Name is required'
    if (!nik) errors.nik = 'NIK is required'
    if (!alamat) errors.alamat = 'Address is required'
    if (!telepon) errors.telepon = 'Phone number is required'

    if (Object.keys(errors).length > 0) {
      return validationErrorResponse(res, errors)
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // Check for duplicates
      const [existingUser] = await connection.query(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [username, email],
      )

      if (existingUser.length > 0) {
        return errorResponse(res, 'Username or email already exists', 409, 'DUPLICATE_ENTRY')
      }

      const [existingNik] = await connection.query('SELECT id FROM anggota WHERE nik = ?', [nik])

      if (existingNik.length > 0) {
        return errorResponse(res, 'NIK already exists', 409, 'DUPLICATE_NIK')
      }

      // Generate member number
      const [lastMember] = await connection.query(
        'SELECT nomor_anggota FROM anggota ORDER BY nomor_anggota DESC LIMIT 1',
      )

      let nextNumber = 1
      if (lastMember.length > 0) {
        const lastNumber = parseInt(lastMember[0].nomor_anggota.replace(/\D/g, ''))
        nextNumber = lastNumber + 1
      }

      const nomorAnggota = `AGT${String(nextNumber).padStart(6, '0')}`

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Create user
      const userId = uuidv4()
      await connection.query(
        `INSERT INTO users (id, username, password, email, role, name, is_active, created_at)
       VALUES (?, ?, ?, ?, 'anggota', ?, TRUE, NOW())`,
        [userId, username, hashedPassword, email, name],
      )

      // Create member
      const anggotaId = uuidv4()
      await connection.query(
        `INSERT INTO anggota (id, user_id, nomor_anggota, nik, alamat, telepon, tanggal_bergabung, status_aktif, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW())`,
        [anggotaId, userId, nomorAnggota, nik, alamat, telepon, tanggal_bergabung || new Date()],
      )

      // Add initial simpanan pokok if provided
      if (simpanan_pokok > 0) {
        await connection.query(
          `INSERT INTO simpanan (id, anggota_id, jenis, jumlah, tanggal, status, created_at)
         VALUES (?, ?, 'pokok', ?, ?, 'diverifikasi', NOW())`,
          [uuidv4(), anggotaId, simpanan_pokok, new Date()],
        )
      }

      // Log activity
      await connection.query(
        `INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, description, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          req.user.id,
          'create',
          'anggota',
          anggotaId,
          `Created new member: ${name} (${nomorAnggota})`,
          req.ip,
        ],
      )

      await connection.commit()

      logger.info('New member created', {
        anggotaId,
        nomorAnggota,
        name,
        createdBy: req.user.id,
      })

      return successResponse(
        res,
        {
          id: anggotaId,
          nomor_anggota: nomorAnggota,
          name,
          email,
        },
        'Member created successfully',
        201,
      )
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }),
)

/**
 * Update member
 * PUT /api/anggota-management/:id
 */
router.put(
  '/:id',
  checkRole(['pengurus']),
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { name, email, alamat, telepon, status_aktif } = req.body

    // Check if member exists
    const [existing] = await pool.query(
      'SELECT a.*, u.id as user_id FROM anggota a JOIN users u ON a.user_id = u.id WHERE a.id = ?',
      [id],
    )

    if (existing.length === 0) {
      return errorResponse(res, 'Member not found', 404, 'MEMBER_NOT_FOUND')
    }

    const member = existing[0]
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // Update user data
      if (name || email) {
        await connection.query(
          'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), updated_at = NOW() WHERE id = ?',
          [name, email, member.user_id],
        )
      }

      // Update member data
      await connection.query(
        `UPDATE anggota
       SET alamat = COALESCE(?, alamat),
           telepon = COALESCE(?, telepon),
           status_aktif = COALESCE(?, status_aktif),
           updated_at = NOW()
       WHERE id = ?`,
        [alamat, telepon, status_aktif, id],
      )

      // If status changed, also update user's is_active
      if (status_aktif !== undefined) {
        await connection.query('UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?', [
          status_aktif,
          member.user_id,
        ])
      }

      // Log activity
      await connection.query(
        `INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, description, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          req.user.id,
          'update',
          'anggota',
          id,
          `Updated member: ${member.nomor_anggota}`,
          req.ip,
        ],
      )

      await connection.commit()

      logger.info('Member updated', {
        anggotaId: id,
        nomorAnggota: member.nomor_anggota,
        updatedBy: req.user.id,
      })

      return successResponse(res, null, 'Member updated successfully')
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }),
)

/**
 * Delete member (soft delete)
 * DELETE /api/anggota-management/:id
 */
router.delete(
  '/:id',
  checkRole(['pengurus']),
  asyncHandler(async (req, res) => {
    const { id } = req.params

    // Check if member exists and has no active loans
    const [member] = await pool.query(
      `SELECT a.*, u.id as user_id, u.name,
       COUNT(p.id) as active_loans
     FROM anggota a
     JOIN users u ON a.user_id = u.id
     LEFT JOIN pinjaman p ON a.id = p.anggota_id AND p.status_pinjaman IN ('antrean', 'verifikasi', 'disetujui', 'aktif')
     WHERE a.id = ?
     GROUP BY a.id`,
      [id],
    )

    if (member.length === 0) {
      return errorResponse(res, 'Member not found', 404, 'MEMBER_NOT_FOUND')
    }

    const memberData = member[0]

    if (memberData.active_loans > 0) {
      return errorResponse(
        res,
        'Cannot delete member with active loans',
        400,
        'MEMBER_HAS_ACTIVE_LOANS',
      )
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // Soft delete - deactivate instead of deleting
      await connection.query(
        'UPDATE anggota SET status_aktif = FALSE, updated_at = NOW() WHERE id = ?',
        [id],
      )

      await connection.query(
        'UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = ?',
        [memberData.user_id],
      )

      // Log activity
      await connection.query(
        `INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, description, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          req.user.id,
          'deactivate',
          'anggota',
          id,
          `Deactivated member: ${memberData.nomor_anggota} - ${memberData.name}`,
          req.ip,
        ],
      )

      await connection.commit()

      logger.info('Member deactivated', {
        anggotaId: id,
        nomorAnggota: memberData.nomor_anggota,
        deactivatedBy: req.user.id,
      })

      return successResponse(res, null, 'Member deactivated successfully')
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }),
)

/**
 * Export members to Excel
 * GET /api/anggota-management/export/excel
 */
router.get(
  '/export/excel',
  checkRole(['pengurus']),
  asyncHandler(async (req, res) => {
    const { status = 'all' } = req.query

    let whereClause = '1=1'
    let queryParams = []

    if (status !== 'all') {
      whereClause += ` AND a.status_aktif = ?`
      queryParams.push(status === 'active' ? 1 : 0)
    }

    const [members] = await pool.query(
      `SELECT
       a.nomor_anggota, u.name, u.email, a.nik, a.alamat, a.telepon,
       a.tanggal_bergabung, a.status_aktif,
       COALESCE(SUM(CASE WHEN s.jenis = 'pokok' THEN s.jumlah ELSE 0 END), 0) as simpanan_pokok,
       COALESCE(SUM(CASE WHEN s.jenis = 'wajib' THEN s.jumlah ELSE 0 END), 0) as simpanan_wajib,
       COALESCE(SUM(CASE WHEN s.jenis = 'sukarela' THEN s.jumlah ELSE 0 END), 0) as simpanan_sukarela,
       COUNT(DISTINCT p.id) as total_pinjaman,
       a.created_at
     FROM anggota a
     JOIN users u ON a.user_id = u.id
     LEFT JOIN simpanan s ON a.id = s.anggota_id AND s.status = 'diverifikasi'
     LEFT JOIN pinjaman p ON a.id = p.anggota_id
     WHERE ${whereClause}
     GROUP BY a.id, u.id
     ORDER BY a.nomor_anggota ASC`,
      queryParams,
    )

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Data Anggota')

    // Add headers
    worksheet.columns = [
      { header: 'No. Anggota', key: 'nomor_anggota', width: 15 },
      { header: 'Nama', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'NIK', key: 'nik', width: 20 },
      { header: 'Alamat', key: 'alamat', width: 30 },
      { header: 'Telepon', key: 'telepon', width: 15 },
      { header: 'Tanggal Bergabung', key: 'tanggal_bergabung', width: 18 },
      { header: 'Status', key: 'status_aktif', width: 12 },
      { header: 'Simpanan Pokok', key: 'simpanan_pokok', width: 18 },
      { header: 'Simpanan Wajib', key: 'simpanan_wajib', width: 18 },
      { header: 'Simpanan Sukarela', key: 'simpanan_sukarela', width: 20 },
      { header: 'Total Pinjaman', key: 'total_pinjaman', width: 15 },
      { header: 'Tanggal Daftar', key: 'created_at', width: 18 },
    ]

    // Add data
    members.forEach((member) => {
      worksheet.addRow({
        ...member,
        status_aktif: member.status_aktif ? 'Aktif' : 'Tidak Aktif',
        tanggal_bergabung: new Date(member.tanggal_bergabung).toLocaleDateString('id-ID'),
        created_at: new Date(member.created_at).toLocaleDateString('id-ID'),
      })
    })

    // Style headers
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6FA' },
      }
    })

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=data-anggota-${new Date().toISOString().split('T')[0]}.xlsx`,
    )

    // Send file
    await workbook.xlsx.write(res)
    res.end()

    logger.info('Members data exported to Excel', {
      count: members.length,
      exportedBy: req.user.id,
    })
  }),
)

/**
 * Import members from Excel
 * POST /api/anggota-management/import/excel
 */
router.post(
  '/import/excel',
  checkRole(['pengurus']),
  asyncHandler(async (req, res) => {
    // This would require multer middleware for file upload
    // For now, return a placeholder response
    return errorResponse(res, 'Excel import feature not yet implemented', 501, 'NOT_IMPLEMENTED')
  }),
)

export default router
