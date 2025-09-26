import { pool } from '../db.js'
import logger from './logger.js'

/**
 * Database helper utilities for performance optimization
 */
class DatabaseHelper {
  /**
   * Get anggota_id from user_id with caching
   * @param {string} userId - User ID
   * @returns {Promise<string|null>} Anggota ID
   */
  static async getAnggotaIdByUserId(userId) {
    try {
      const [rows] = await pool.execute('SELECT id FROM anggota WHERE user_id = ?', [userId])
      return rows.length > 0 ? rows[0].id : null
    } catch (error) {
      logger.error('Error getting anggota_id by user_id:', error)
      throw error
    }
  }

  /**
   * Get multiple anggota data with user info in single query
   * @param {Array} anggotaIds - Array of anggota IDs
   * @returns {Promise<Array>} Anggota data with user info
   */
  static async getAnggotaWithUserInfo(anggotaIds) {
    if (!anggotaIds || anggotaIds.length === 0) return []

    try {
      const placeholders = anggotaIds.map(() => '?').join(',')
      const [rows] = await pool.execute(
        `SELECT
          a.id, a.nomor_anggota, a.name, a.email, a.nik, a.alamat,
          a.telepon, a.tanggal_bergabung, a.status_aktif, a.simpanan_pokok,
          u.username, u.role, u.is_active as user_active
         FROM anggota a
         LEFT JOIN users u ON a.user_id = u.id
         WHERE a.id IN (${placeholders})`,
        anggotaIds,
      )
      return rows
    } catch (error) {
      logger.error('Error getting anggota with user info:', error)
      throw error
    }
  }

  /**
   * Get simpanan summary for multiple anggota in single query
   * @param {Array} anggotaIds - Array of anggota IDs
   * @returns {Promise<Object>} Simpanan summary by anggota_id
   */
  static async getSimpananSummaryBatch(anggotaIds) {
    if (!anggotaIds || anggotaIds.length === 0) return {}

    try {
      const placeholders = anggotaIds.map(() => '?').join(',')
      const [rows] = await pool.execute(
        `SELECT
          anggota_id,
          jenis,
          SUM(jumlah) as total
         FROM simpanan
         WHERE anggota_id IN (${placeholders}) AND status = 'diverifikasi'
         GROUP BY anggota_id, jenis`,
        anggotaIds,
      )

      // Group by anggota_id
      const result = {}
      rows.forEach((row) => {
        if (!result[row.anggota_id]) {
          result[row.anggota_id] = {}
        }
        result[row.anggota_id][row.jenis] = row.total
      })

      return result
    } catch (error) {
      logger.error('Error getting simpanan summary batch:', error)
      throw error
    }
  }

  /**
   * Get pinjaman summary for multiple anggota in single query
   * @param {Array} anggotaIds - Array of anggota IDs
   * @returns {Promise<Object>} Pinjaman summary by anggota_id
   */
  static async getPinjamanSummaryBatch(anggotaIds) {
    if (!anggotaIds || anggotaIds.length === 0) return {}

    try {
      const placeholders = anggotaIds.map(() => '?').join(',')
      const [rows] = await pool.execute(
        `SELECT
          anggota_id,
          COUNT(*) as total_pinjaman,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as pinjaman_aktif,
          SUM(CASE WHEN status = 'approved' THEN jumlah_pinjaman ELSE 0 END) as total_pinjaman_aktif
         FROM pinjaman
         WHERE anggota_id IN (${placeholders})
         GROUP BY anggota_id`,
        anggotaIds,
      )

      // Convert to object keyed by anggota_id
      const result = {}
      rows.forEach((row) => {
        result[row.anggota_id] = {
          total_pinjaman: row.total_pinjaman,
          pinjaman_aktif: row.pinjaman_aktif,
          total_pinjaman_aktif: row.total_pinjaman_aktif,
        }
      })

      return result
    } catch (error) {
      logger.error('Error getting pinjaman summary batch:', error)
      throw error
    }
  }

  /**
   * Get paginated results with optimized counting
   * @param {string} baseQuery - Base SELECT query
   * @param {Array} params - Query parameters
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Results with pagination info
   */
  static async getPaginatedResults(baseQuery, params, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit

      // Get total count efficiently
      const countQuery = baseQuery.replace(/SELECT.*?FROM/i, 'SELECT COUNT(*) as total FROM')
      const [countResult] = await pool.execute(countQuery, params)
      const totalItems = countResult[0].total

      // Get paginated data
      const dataQuery = `${baseQuery} LIMIT ? OFFSET ?`
      const [dataResult] = await pool.execute(dataQuery, [...params, limit, offset])

      return {
        data: dataResult,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        },
      }
    } catch (error) {
      logger.error('Error getting paginated results:', error)
      throw error
    }
  }

  /**
   * Execute query with connection pooling optimization
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} Query results
   */
  static async executeQuery(query, params = []) {
    try {
      const start = Date.now()
      const [rows] = await pool.execute(query, params)
      const duration = Date.now() - start

      // Log slow queries (>100ms)
      if (duration > 100) {
        logger.warn(`Slow query detected (${duration}ms):`, {
          query: query.substring(0, 100) + '...',
          params: params.slice(0, 5), // Only log first 5 params for privacy
        })
      }

      return rows
    } catch (error) {
      logger.error('Database query error:', {
        query: query.substring(0, 100) + '...',
        error: error.message,
      })
      throw error
    }
  }

  /**
   * Build optimized WHERE clause with proper indexing hints
   * @param {Object} filters - Filter object
   * @param {Array} baseParams - Base parameters array
   * @returns {Object} Query parts and parameters
   */
  static buildOptimizedWhere(filters, baseParams = []) {
    let whereClause = ''
    const params = [...baseParams]
    const conditions = []

    if (filters.anggota_id) {
      conditions.push('anggota_id = ?')
      params.push(filters.anggota_id)
    }

    if (filters.status && filters.status !== 'all') {
      conditions.push('status = ?')
      params.push(filters.status)
    }

    if (filters.jenis && filters.jenis !== 'all') {
      conditions.push('jenis = ?')
      params.push(filters.jenis)
    }

    if (filters.startDate) {
      conditions.push('tanggal >= ?')
      params.push(filters.startDate)
    }

    if (filters.endDate) {
      conditions.push('tanggal <= ?')
      params.push(filters.endDate)
    }

    if (filters.search) {
      conditions.push('(name LIKE ? OR email LIKE ? OR nik LIKE ? OR nomor_anggota LIKE ?)')
      const searchTerm = `%${filters.search}%`
      params.push(searchTerm, searchTerm, searchTerm, searchTerm)
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ')
    }

    return { whereClause, params }
  }
}

export default DatabaseHelper
