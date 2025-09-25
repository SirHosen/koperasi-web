// server.js - Main backend entry point
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { testConnection } from './db.js'
import authRoutes from './routes/auth.routes.js'
import anggotaRoutes from './routes/anggota.routes.js'
import simpananRoutes from './routes/simpanan.routes.js'
import pinjamanRoutes from './routes/pinjaman.routes.js'
import fcfsRoutes from './routes/fcfs.routes.js'
import shuRoutes from './routes/shu.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import adminRoutes from './routes/admin.routes.js'
import pengawasRoutes from './routes/pengawas.routes.js'
import { authenticateJWT } from './middleware/auth.middleware.js'

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 3000

// Apply middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Vue.js development server
    credentials: true,
  }),
)
app.use(helmet()) // Security headers
app.use(morgan('dev')) // Logging
app.use(express.json()) // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded request bodies

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Test database connection on startup
;(async () => {
  await testConnection()
})()

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/anggota', authenticateJWT, anggotaRoutes)
app.use('/api/simpanan', authenticateJWT, simpananRoutes)
app.use('/api/pinjaman', authenticateJWT, pinjamanRoutes)
app.use('/api/fcfs', authenticateJWT, fcfsRoutes)
app.use('/api/shu', authenticateJWT, shuRoutes)
app.use('/api/notifications', authenticateJWT, notificationRoutes)
app.use('/api/admin', authenticateJWT, adminRoutes)
app.use('/api/pengawas', authenticateJWT, pengawasRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export default app
