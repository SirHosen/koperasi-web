// utils/response.js - Standardized API response utility
import logger from './logger.js'

/**
 * Standard success response
 */
export const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    status: 'success',
    message,
    timestamp: new Date().toISOString(),
    ...(data && { data }),
  }

  return res.status(statusCode).json(response)
}

/**
 * Standard error response
 */
export const errorResponse = (
  res,
  message = 'An error occurred',
  statusCode = 500,
  errorCode = null,
  details = null,
) => {
  const response = {
    status: 'error',
    message,
    timestamp: new Date().toISOString(),
    ...(errorCode && { errorCode }),
    ...(details && process.env.NODE_ENV !== 'production' && { details }),
  }

  // Log error
  logger.error(`API Error Response: ${message}`, {
    statusCode,
    errorCode,
    details,
  })

  return res.status(statusCode).json(response)
}

/**
 * Validation error response
 */
export const validationErrorResponse = (res, errors) => {
  const response = {
    status: 'error',
    message: 'Validation failed',
    timestamp: new Date().toISOString(),
    errors,
  }

  logger.warn('Validation Error', { errors })

  return res.status(400).json(response)
}

/**
 * Paginated response
 */
export const paginatedResponse = (res, data, pagination, message = 'Success') => {
  const response = {
    status: 'success',
    message,
    timestamp: new Date().toISOString(),
    data,
    pagination: {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      itemsPerPage: pagination.itemsPerPage,
      hasNextPage: pagination.currentPage < pagination.totalPages,
      hasPrevPage: pagination.currentPage > 1,
    },
  }

  return res.status(200).json(response)
}

/**
 * Authentication error responses
 */
export const authErrorResponses = {
  unauthorized: (res, message = 'Authentication required') =>
    errorResponse(res, message, 401, 'UNAUTHORIZED'),

  forbidden: (res, message = 'Access forbidden') => errorResponse(res, message, 403, 'FORBIDDEN'),

  tokenExpired: (res, message = 'Token expired') =>
    errorResponse(res, message, 401, 'TOKEN_EXPIRED'),

  invalidToken: (res, message = 'Invalid token') =>
    errorResponse(res, message, 401, 'INVALID_TOKEN'),
}

/**
 * Common HTTP error responses
 */
export const httpErrorResponses = {
  notFound: (res, resource = 'Resource') =>
    errorResponse(res, `${resource} not found`, 404, 'NOT_FOUND'),

  conflict: (res, message = 'Resource already exists') =>
    errorResponse(res, message, 409, 'CONFLICT'),

  tooManyRequests: (res, message = 'Too many requests') =>
    errorResponse(res, message, 429, 'TOO_MANY_REQUESTS'),

  internalError: (res, message = 'Internal server error') =>
    errorResponse(res, message, 500, 'INTERNAL_ERROR'),
}

/**
 * Database error handler
 */
export const handleDatabaseError = (res, error, operation = 'Database operation') => {
  logger.error(`Database Error: ${operation}`, {
    error: error.message,
    code: error.code,
    sqlState: error.sqlState,
  })

  // Handle specific MySQL errors
  switch (error.code) {
    case 'ER_DUP_ENTRY':
      return errorResponse(res, 'Duplicate entry found', 409, 'DUPLICATE_ENTRY')

    case 'ER_NO_REFERENCED_ROW_2':
      return errorResponse(res, 'Referenced record not found', 400, 'INVALID_REFERENCE')

    case 'ER_ROW_IS_REFERENCED_2':
      return errorResponse(
        res,
        'Cannot delete record with existing references',
        400,
        'CONSTRAINT_VIOLATION',
      )

    case 'ECONNREFUSED':
      return errorResponse(res, 'Database connection failed', 503, 'DATABASE_UNAVAILABLE')

    default:
      return errorResponse(res, 'Database operation failed', 500, 'DATABASE_ERROR')
  }
}

/**
 * Async error handler wrapper
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      logger.error('Unhandled async error', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        user: req.user?.id || 'anonymous',
      })

      if (!res.headersSent) {
        return handleDatabaseError(res, error)
      }
    })
  }
}
