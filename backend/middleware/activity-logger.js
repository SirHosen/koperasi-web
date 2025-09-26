// activity-logger.js - Logs write actions to activity_logs
import { v4 as uuidv4 } from 'uuid'
import { pool } from '../db.js'

const METHODS_TO_LOG = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export const activityLogger = async (req, _res, next) => {
  try {
    if (!METHODS_TO_LOG.has(req.method)) return next()
    if (req.path === '/health') return next()

    const userId = req.user?.id || null
    const description = `${req.method} ${req.originalUrl}`

    await pool.query(
      `INSERT INTO activity_logs
       (id, user_id, action, entity_type, entity_id, description, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [uuidv4(), userId, 'http', 'request', null, description, req.ip],
    )
  } catch (_) {
    // best-effort; do not block request on logging failure
  } finally {
    next()
  }
}

export default activityLogger



