// auth.middleware.js - JWT Authentication middleware
import jwt from 'jsonwebtoken'
import { pool } from '../db.js'

// Ensure JWT secret exists
const JWT_SECRET = process.env.JWT_SECRET
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  console.error('FATAL: JWT_SECRET and JWT_REFRESH_SECRET must be set in environment variables')
  process.exit(1)
}

/**
 * Middleware to authenticate JWT token
 */
export const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ status: 'error', message: 'Authentication token is missing' })
  }

  // Extract the token (Bearer format)
  const token = authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Invalid token format' })
  }

  try {
    // Verify token
    const user = jwt.verify(token, JWT_SECRET)

    // Check if user still exists and is active
    const [userRows] = await pool.query(
      'SELECT id, username, email, role, is_active FROM users WHERE id = ? AND is_active = TRUE',
      [user.id],
    )

    if (userRows.length === 0) {
      return res.status(401).json({ status: 'error', message: 'User not found or inactive' })
    }

    req.user = userRows[0] // Attach fresh user data to request
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
      })
    }
    return res.status(403).json({ status: 'error', message: 'Invalid token' })
  }
}

/**
 * Middleware to check if user has required role
 */
export const checkRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ status: 'error', message: 'Forbidden: Insufficient permissions' })
    }

    next()
  }
}
