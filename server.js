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
  getLeaderboardStudents,
  authenticateAdmin,
  getAdminStatistics,
} from './server/db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = Number(process.env.PORT) || 10000
const HOST = '0.0.0.0'
const DIST_DIR = path.resolve(__dirname, 'dist')
const JWT_SECRET = process.env.JWT_SECRET || 'campusquest_super_secret_jwt_key_2026_srkr'

// Active sessions in-memory store mapping token -> { userId, role, expiresAt }
const activeSessions = new Map()

/**
 * Creates a signed session token with role information.
 */
function createSessionToken(userId, role = 'student') {
  const timestamp = Date.now()
  const random = crypto.randomBytes(16).toString('hex')
  const payload = `${userId}:${role}:${timestamp}:${random}`
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex')
  const token = Buffer.from(`${payload}:${signature}`).toString('base64url')

  // Expires in 30 days
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000
  activeSessions.set(token, { userId, role, expiresAt })
  return token
}

/**
 * Verifies session token and returns { userId, role }.
 */
function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf-8')
    const parts = raw.split(':')
    
    // Support new 5-part token format (userId:role:timestamp:random:signature)
    if (parts.length === 5) {
      const [userId, role, timestamp, random, signature] = parts
      const payload = `${userId}:${role}:${timestamp}:${random}`
      const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex')
      if (signature !== expectedSig) return null
      return { userId, role }
    }

    // Support legacy 4-part token format (userId:timestamp:random:signature)
    if (parts.length === 4) {
      const [userId, timestamp, random, signature] = parts
      const payload = `${userId}:${timestamp}:${random}`
      const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex')
      if (signature !== expectedSig) return null
      return { userId, role: 'student' }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Express Student Authentication Middleware for student protected routes.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-auth-token'] || '')

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' })
  }

  const session = verifySessionToken(token)
  if (!session || !session.userId) {
    return res.status(401).json({ success: false, error: 'Session expired or invalid. Please log in again.' })
  }

  const student = findStudentById(session.userId)
  if (!student) {
    return res.status(401).json({ success: false, error: 'Student account not found.' })
  }

  req.student = student
  req.token = token
  req.role = session.role || 'student'
  next()
}

/**
 * Express Admin Authorization Middleware for admin-only routes.
 * Strictly verifies role = 'admin'.
 */
function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-auth-token'] || '')

  if (!token) {
    return res.status(401).json({ success: false, error: 'Administrator authentication required.' })
  }

  const session = verifySessionToken(token)
  if (!session || session.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Access denied. Administrator authorization required.' })
  }

  req.admin = {
    id: session.userId,
    role: 'admin',
  }
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
 * GET /api/leaderboard
 * Returns real, sorted student leaderboard from the central database.
 */
app.get('/api/leaderboard', (req, res) => {
  try {
    const leaderboard = getLeaderboardStudents()
    return res.status(200).json({
      success: true,
      total: leaderboard.length,
      leaderboard,
    })
  } catch (err) {
    console.error('Leaderboard error:', err)
    return res.status(500).json({ success: false, error: 'Failed to retrieve leaderboard from database.' })
  }
})

// ==========================================
// ADMIN API ENDPOINTS (PROTECTED & ISOLATED)
// ==========================================

/**
 * POST /api/admin/login
 * Authenticates single administrator and issues admin token.
 */
app.post('/api/admin/login', (req, res) => {
  try {
    const { identifier, password } = req.body || {}
    const result = authenticateAdmin(identifier, password)

    if (!result.success) {
      return res.status(result.status || 401).json({
        success: false,
        error: result.error,
      })
    }

    const token = createSessionToken(result.admin.id, 'admin')
    return res.status(200).json({
      success: true,
      token,
      user: result.admin,
    })
  } catch (err) {
    console.error('Admin login error:', err)
    return res.status(500).json({ success: false, error: 'Internal server error during admin login.' })
  }
})

/**
 * GET /api/admin/stats
 * Returns real database statistics for administrator dashboard.
 */
app.get('/api/admin/stats', adminAuthMiddleware, (req, res) => {
  try {
    const stats = getAdminStatistics()
    return res.status(200).json({
      success: true,
      stats,
    })
  } catch (err) {
    console.error('Admin stats error:', err)
    return res.status(500).json({ success: false, error: 'Failed to retrieve administrator statistics.' })
  }
})

/**
 * GET /api/admin/students
 * Returns real registered student list with scores (strictly no passwords).
 */
app.get('/api/admin/students', adminAuthMiddleware, (req, res) => {
  try {
    const students = loadAllStudents().map(sanitizeStudent)
    return res.status(200).json({
      success: true,
      total: students.length,
      students,
    })
  } catch (err) {
    console.error('Admin students list error:', err)
    return res.status(500).json({ success: false, error: 'Failed to retrieve students list.' })
  }
})

/**
 * GET /api/admin/leaderboard
 * Returns real leaderboard for administrator dashboard.
 */
app.get('/api/admin/leaderboard', adminAuthMiddleware, (req, res) => {
  try {
    const leaderboard = getLeaderboardStudents()
    return res.status(200).json({
      success: true,
      total: leaderboard.length,
      leaderboard,
    })
  } catch (err) {
    console.error('Admin leaderboard error:', err)
    return res.status(500).json({ success: false, error: 'Failed to retrieve leaderboard.' })
  }
})

/**
 * POST /api/admin/logout
 * Terminates administrator session.
 */
app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-auth-token'] || '')
  if (token) {
    activeSessions.delete(token)
  }
  return res.status(200).json({ success: true, message: 'Administrator logged out successfully.' })
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
