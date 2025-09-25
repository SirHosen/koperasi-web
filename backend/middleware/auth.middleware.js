// auth.middleware.js - JWT Authentication middleware
import jwt from 'jsonwebtoken'

/**
 * Middleware to authenticate JWT token
 */
export const authenticateJWT = (req, res, next) => {
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
    const user = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_change_this')
    req.user = user // Attach user data to request
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'error', message: 'Token expired' })
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
