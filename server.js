/**
 * Production Express Web Server & Multi-Student Central API for CampusQuest
 * Serves both Central Student REST API (/api/*) and Vite Frontend (dist/) with SPA routing.
 */

import express from 'express'
import cors from 'cors'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import {
  createStudent,
  authenticateStudent,
  findStudentById,
  updateStudentProgress,
  loadAllStudents,
  sanitizeStudent,
} from './server/db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = Number(process.env.PORT) || 10000
const HOST = '0.0.0.0'
const DIST_DIR = path.resolve(__dirname, 'dist')
const JWT_SECRET = process.env.JWT_SECRET || 'campusquest_super_secret_jwt_key_2026_srkr'

// Active sessions in-memory store mapping token -> { studentId, expiresAt }
const activeSessions = new Map()

/**
 * Creates a signed session token for authenticated student.
 */
function createSessionToken(studentId) {
  const timestamp = Date.now()
  const random = crypto.randomBytes(16).toString('hex')
  const payload = `${studentId}:${timestamp}:${random}`
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex')
  const token = Buffer.from(`${payload}:${signature}`).toString('base64url')

  // Expires in 30 days
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000
  activeSessions.set(token, { studentId, expiresAt })
  return token
}

/**
 * Verifies session token and returns student ID.
 */
function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf-8')
    const parts = raw.split(':')
    if (parts.length !== 4) return null
    const [studentId, timestamp, random, signature] = parts
    const payload = `${studentId}:${timestamp}:${random}`
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex')

    if (signature !== expectedSig) return null
    return studentId
  } catch {
    return null
  }
}

/**
 * Express Authentication Middleware for protected routes.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-auth-token'] || '')

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' })
  }

  const studentId = verifySessionToken(token)
  if (!studentId) {
    return res.status(401).json({ success: false, error: 'Session expired or invalid. Please log in again.' })
  }

  const student = findStudentById(studentId)
  if (!student) {
    return res.status(401).json({ success: false, error: 'Student account not found.' })
  }

  req.student = student
  req.token = token
  next()
}

const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ extended: true, limit: '15mb' }))

// Initialize database on startup
loadAllStudents()

// ==========================================
// CENTRAL AUTHENTICATION & STUDENT APIS
// ==========================================

/**
 * POST /api/auth/register
 * Creates a unique student account in the central database.
 */
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, registrationNumber, email, branch, year, password } = req.body
    const result = createStudent({ name, registrationNumber, email, branch, year, password })

    if (!result.success) {
      return res.status(result.status || 400).json({
        success: false,
        error: result.error,
        isDuplicate: result.isDuplicate || false,
      })
    }

    const token = createSessionToken(result.student.id)
    return res.status(201).json({
      success: true,
      message: result.message,
      token,
      user: result.student,
    })
  } catch (err) {
    console.error('Registration error:', err)
    return res.status(500).json({ success: false, error: 'Internal server error during registration.' })
  }
})

/**
 * POST /api/auth/login
 * Authenticates against the central database with Registration Number + Password.
 */
app.post('/api/auth/login', (req, res) => {
  try {
    const { registrationNumber, password } = req.body
    const result = authenticateStudent(registrationNumber, password)

    if (!result.success) {
      return res.status(result.status || 401).json({
        success: false,
        error: result.error,
      })
    }

    const token = createSessionToken(result.student.id)
    return res.status(200).json({
      success: true,
      token,
      user: result.student,
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ success: false, error: 'Internal server error during login.' })
  }
})

/**
 * GET /api/student/me
 * Retrieves current student's live data from central database.
 */
app.get('/api/student/me', authMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    user: sanitizeStudent(req.student),
  })
})

/**
 * PUT /api/student/progress
 * Synchronizes quest progress, XP, completed quests, and achievements.
 */
app.put('/api/student/progress', authMiddleware, (req, res) => {
  try {
    const result = updateStudentProgress(req.student.id, req.body)
    if (!result.success) {
      return res.status(result.status || 400).json(result)
    }
    return res.status(200).json(result)
  } catch (err) {
    console.error('Progress update error:', err)
    return res.status(500).json({ success: false, error: 'Failed to update progress in central database.' })
  }
})

/**
 * POST /api/auth/logout
 * Terminates session.
 */
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-auth-token'] || '')
  if (token) {
    activeSessions.delete(token)
  }
  return res.status(200).json({ success: true, message: 'Logged out successfully.' })
})

/**
 * GET /api/health
 * System health status check.
 */
app.get('/api/health', (req, res) => {
  const students = loadAllStudents()
  return res.status(200).json({
    status: 'ok',
    database: 'connected',
    totalStudents: students.length,
    timestamp: new Date().toISOString(),
  })
})

// ==========================================
// VITE STATIC ASSET SERVING WITH SPA FALLBACK
// ==========================================

// Serve static assets with caching
app.use(
  express.static(DIST_DIR, {
    maxAge: '1d',
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      }
    },
  })
)

// SPA Rewrite: Any non-API route returns dist/index.html
app.use((req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'))
})

// Start Server
app.listen(PORT, HOST, () => {
  console.log(`🚀 CampusQuest Multi-Student Central Server running at http://${HOST}:${PORT}`)
  console.log(`📁 Static files served from: ${DIST_DIR}`)
})
