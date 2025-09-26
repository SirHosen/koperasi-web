// utils/jwt.utils.js - JWT utility functions for secure token management
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import dotenv from 'dotenv'

// Ensure environment variables are loaded
dotenv.config()

// Check for required environment variables
const JWT_SECRET = process.env.JWT_SECRET
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET or JWT_REFRESH_SECRET environment variables not defined')
  throw new Error('JWT secrets not defined in environment variables')
}

const ACCESS_TOKEN_EXPIRES = '15m' // Short-lived access token
const REFRESH_TOKEN_EXPIRES = '7d' // Longer-lived refresh token

/**
 * Generate access and refresh tokens
 */
export const generateTokens = (payload) => {
  try {
    if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
      throw new Error('JWT_SECRET or JWT_REFRESH_SECRET environment variables not defined')
    }

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES,
      issuer: 'koperasi-app',
      audience: 'koperasi-users',
    })

    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES,
      issuer: 'koperasi-app',
      audience: 'koperasi-users',
    })

    return { accessToken, refreshToken }
  } catch (error) {
    console.error('Error generating tokens:', error.message)
    throw error
  }
}

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'koperasi-app',
      audience: 'koperasi-users',
    })
  } catch (error) {
    console.error('Refresh token verification failed:', error.message)
    throw new Error('Invalid refresh token')
  }
}

/**
 * Generate secure random string for additional security
 */
export const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Hash sensitive data
 */
export const hashData = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex')
}

/**
 * Encrypt sensitive data
 */
export const encryptData = (data) => {
  try {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable not defined')
    }

    const algorithm = 'aes-256-gcm'
    const key = crypto.scryptSync(JWT_SECRET, 'salt', 32)
    const iv = crypto.randomBytes(16)

    const cipher = crypto.createCipheriv(algorithm, key, iv)
    cipher.setAAD(Buffer.from('koperasi-auth', 'utf8'))

    let encrypted = cipher.update(
      typeof data === 'string' ? data : JSON.stringify(data),
      'utf8',
      'hex',
    )
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    }
  } catch (error) {
    console.error('Encryption error:', error.message)
    throw new Error('Failed to encrypt data: ' + error.message)
  }
}

/**
 * Decrypt sensitive data
 */
export const decryptData = (encryptedData) => {
  try {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable not defined')
    }

    if (!encryptedData || !encryptedData.iv || !encryptedData.authTag || !encryptedData.encrypted) {
      throw new Error('Invalid encrypted data format')
    }

    const algorithm = 'aes-256-gcm'
    const key = crypto.scryptSync(JWT_SECRET, 'salt', 32)
    const iv = Buffer.from(encryptedData.iv, 'hex')

    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    decipher.setAAD(Buffer.from('koperasi-auth', 'utf8'))
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'))

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('Decryption error:', error.message)
    throw new Error('Failed to decrypt data: ' + error.message)
  }
}
