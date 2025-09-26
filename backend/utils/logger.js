// utils/logger.js - Production-ready logging utility
import { createWriteStream } from 'fs'
import { join } from 'path'

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
}

class Logger {
  constructor() {
    this.level = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG
    this.logStream = null

    // Create log file in production
    if (process.env.NODE_ENV === 'production') {
      this.logStream = createWriteStream(join(process.cwd(), 'logs', 'app.log'), { flags: 'a' })
    }
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString()
    let logMessage = `[${timestamp}] ${level}: ${message}`

    if (data) {
      logMessage += ` | Data: ${JSON.stringify(data, null, 2)}`
    }

    return logMessage
  }

  writeLog(level, message, data = null) {
    const formattedMessage = this.formatMessage(level, message, data)

    if (process.env.NODE_ENV === 'production' && this.logStream) {
      this.logStream.write(formattedMessage + '\n')
    } else {
      // Development - output to console with colors
      const colors = {
        ERROR: '\x1b[31m', // Red
        WARN: '\x1b[33m', // Yellow
        INFO: '\x1b[36m', // Cyan
        DEBUG: '\x1b[32m', // Green
      }
      console.log(colors[level] + formattedMessage + '\x1b[0m')
    }
  }

  error(message, data = null) {
    if (this.level >= LOG_LEVELS.ERROR) {
      this.writeLog('ERROR', message, data)
    }
  }

  warn(message, data = null) {
    if (this.level >= LOG_LEVELS.WARN) {
      this.writeLog('WARN', message, data)
    }
  }

  info(message, data = null) {
    if (this.level >= LOG_LEVELS.INFO) {
      this.writeLog('INFO', message, data)
    }
  }

  debug(message, data = null) {
    if (this.level >= LOG_LEVELS.DEBUG) {
      this.writeLog('DEBUG', message, data)
    }
  }

  // Special method for API requests
  apiRequest(req, res, duration = null) {
    const message = `${req.method} ${req.path} - ${res.statusCode}`
    const data = {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous',
      duration: duration ? `${duration}ms` : null,
    }

    if (res.statusCode >= 400) {
      this.error(message, data)
    } else {
      this.info(message, data)
    }
  }

  // Database operation logging
  dbOperation(operation, table, success = true, duration = null, error = null) {
    const message = `DB ${operation.toUpperCase()} on ${table} - ${success ? 'SUCCESS' : 'FAILED'}`
    const data = {
      operation,
      table,
      duration: duration ? `${duration}ms` : null,
      error: error?.message || null,
    }

    if (success) {
      this.debug(message, data)
    } else {
      this.error(message, data)
    }
  }
}

// Create singleton instance
const logger = new Logger()

export default logger
