// Test JWT Environment Variables
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

console.log('JWT_SECRET:', process.env.JWT_SECRET)
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET)

try {
  const payload = { test: 'data' }
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '15m',
    issuer: 'koperasi-app',
    audience: 'koperasi-users',
  })

  console.log('Token successfully created:', token)

  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  console.log('Token successfully verified:', decoded)
} catch (error) {
  console.error('JWT Error:', error.message)
}
