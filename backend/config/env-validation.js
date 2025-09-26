// config/env-validation.js - Environment variable validation
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

/**
 * Validate required environment variables
 */
export const validateEnvironment = () => {
  const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'PORT',
  ]

  const missingVars = []
  const warnings = []

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar)
    }
  }

  // Check JWT secrets strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters long for security')
  }

  if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
    warnings.push('JWT_REFRESH_SECRET should be at least 32 characters long for security')
  }

  // Check default/weak secrets
  const weakSecrets = ['default_secret_change_this', 'secret', '123456', 'password']
  if (weakSecrets.includes(process.env.JWT_SECRET)) {
    warnings.push('JWT_SECRET appears to be using a default/weak value - please change it')
  }

  if (weakSecrets.includes(process.env.JWT_REFRESH_SECRET)) {
    warnings.push('JWT_REFRESH_SECRET appears to be using a default/weak value - please change it')
  }

  // Report results
  if (missingVars.length > 0) {
    console.error('❌ FATAL: Missing required environment variables:')
    missingVars.forEach((envVar) => {
      console.error(`   - ${envVar}`)
    })
    console.error('\nPlease set these variables before starting the application.')
    process.exit(1)
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Security warnings:')
    warnings.forEach((warning) => {
      console.warn(`   - ${warning}`)
    })
    console.warn('')
  }

  console.log('✅ Environment validation passed')
}

/**
 * Get validated configuration object
 */
export const getConfig = () => {
  validateEnvironment()

  return {
    jwt: {
      secret: process.env.JWT_SECRET,
      refreshSecret: process.env.JWT_REFRESH_SECRET,
      accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
      refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
    },
    database: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT) || 3306,
    },
    server: {
      port: parseInt(process.env.PORT) || 3000,
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true,
      },
    },
    security: {
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
      rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000, // 15 minutes
      rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100, // requests per window
    },
  }
}
