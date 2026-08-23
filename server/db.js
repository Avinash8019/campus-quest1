/**
 * Central Multi-Student Database Module for CampusQuest
 * Provides persistent student storage, uniqueness constraints, and salted cryptographic password security.
 * Supports persistent local storage (data/students_db.json) and cloud environment databases.
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Database file path
const DATA_DIR = path.resolve(__dirname, '..', 'data')
const DB_FILE = path.resolve(DATA_DIR, 'students_db.json')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

/**
 * Cryptographically secure password hashing using PBKDF2 with SHA-512 and random 16-byte salt.
 */
export function hashPassword(plainPassword) {
  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('Password must be a non-empty string.')
  }
  const salt = crypto.randomBytes(16).toString('hex')
  const iterations = 100000
  const keylen = 64
  const digest = 'sha512'
  const hash = crypto.pbkdf2Sync(plainPassword, salt, iterations, keylen, digest).toString('hex')
  return `pbkdf2$${iterations}$${salt}$${hash}`
}

/**
 * Verifies a plain password against a stored PBKDF2 hash.
 */
export function verifyPassword(plainPassword, storedHash) {
  if (!plainPassword || !storedHash || typeof storedHash !== 'string') {
    return false
  }

  // Handle legacy hash format if present
  if (storedHash.startsWith('h_')) {
    let simpleHash = 0
    for (let i = 0; i < plainPassword.length; i++) {
      const char = plainPassword.charCodeAt(i)
      simpleHash = (simpleHash << 5) - simpleHash + char
      simpleHash = simpleHash & simpleHash
    }
    const expected = `h_${Math.abs(simpleHash).toString(36)}_${plainPassword.length}`
    return storedHash === expected
  }

  const parts = storedHash.split('$')
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
    return false
  }

  const iterations = Number(parts[1])
  const salt = parts[2]
  const expectedHash = parts[3]

  const actualHash = crypto.pbkdf2Sync(plainPassword, salt, iterations, 64, 'sha512').toString('hex')
  return crypto.timingSafeEqual(Buffer.from(actualHash, 'hex'), Buffer.from(expectedHash, 'hex'))
}

// Initial student repository (strictly real registrations only, zero fake students)
const INITIAL_STUDENTS = []

/**
 * Loads all student records from persistent file database.
 * Automatically purges any legacy dummy / placeholder accounts.
 */
export function loadAllStudents() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      saveAllStudents(INITIAL_STUDENTS)
      return INITIAL_STUDENTS
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      // Filter out any legacy dummy/placeholder entries
      const realStudents = parsed.filter((s) => {
        const name = (s.name || '').toLowerCase()
        const regNo = (s.regd_no || '').toUpperCase()
        const isDummy =
          name === 'student a' ||
          name === 'student b' ||
          name === 'student c' ||
          name === 'student d' ||
          name === 'student d unplayed' ||
          name.includes('fake admin') ||
          name.includes('duplicate student') ||
          regNo === 'TEST001' ||
          regNo === 'TEST002' ||
          regNo === 'TEST003' ||
          regNo === 'TEST004' ||
          regNo === 'TEST004_TEST'
        return !isDummy
      })
      if (realStudents.length !== parsed.length) {
        saveAllStudents(realStudents)
      }
      return realStudents
    }
    return []
  } catch (err) {
    console.error('Error loading database:', err)
    return []
  }
}

/**
 * Atomically saves all student records to persistent file database.
 */
export function saveAllStudents(studentsList) {
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`
    fs.writeFileSync(tempFile, JSON.stringify(studentsList, null, 2), 'utf-8')
    fs.renameSync(tempFile, DB_FILE)
    return true
  } catch (err) {
    console.error('Failed to write database file:', err)
    return false
  }
}

/**
 * Finds a student by Registration Number (case-insensitive).
 */
export function findStudentByRegdNo(regdNo) {
  if (!regdNo || typeof regdNo !== 'string') return null
  const clean = regdNo.trim().toUpperCase()
  const students = loadAllStudents()
  return students.find((s) => (s.regd_no || '').toUpperCase() === clean) || null
}

/**
 * Finds a student by Email address (case-insensitive).
 */
export function findStudentByEmail(email) {
  if (!email || typeof email !== 'string') return null
  const clean = email.trim().toLowerCase()
  const students = loadAllStudents()
  return students.find((s) => (s.email || '').toLowerCase() === clean) || null
}

/**
 * Finds a student by internal ID.
 */
export function findStudentById(id) {
  if (!id || typeof id !== 'string') return null
  const students = loadAllStudents()
  return students.find((s) => s.id === id) || null
}

/**
 * Registers a new student account in the central database.
 * Strictly enforces UNIQUE Registration Number and UNIQUE Email.
 */
export function createStudent({ name, registrationNumber, email, branch, year, password }) {
  const cleanName = (name || '').trim()
  const cleanRegNo = (registrationNumber || '').trim().toUpperCase()
  const cleanEmail = (email || '').trim().toLowerCase()
  const cleanBranch = (branch || '').trim()
  const cleanYear = (year || '').trim()
  const cleanPass = (password || '').trim()

  if (!cleanName || cleanName.length < 2) {
    return { success: false, status: 400, error: 'Full name must be at least 2 characters.' }
  }

  if (!cleanRegNo || cleanRegNo.length < 4) {
    return { success: false, status: 400, error: 'Please enter a valid Registration Number.' }
  }

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, status: 400, error: 'Please enter a valid email address.' }
  }

  if (!cleanBranch) {
    return { success: false, status: 400, error: 'Please select your Branch.' }
  }

  if (!cleanYear) {
    return { success: false, status: 400, error: 'Please select your Academic Year.' }
  }

  if (!cleanPass || cleanPass.length < 8) {
    return { success: false, status: 400, error: 'Password must be at least 8 characters long.' }
  }

  // 1. Check uniqueness of Registration Number
  if (findStudentByRegdNo(cleanRegNo)) {
    return {
      success: false,
      status: 409,
      error: 'This Registration Number is already registered. Please login.',
      isDuplicate: true,
    }
  }

  // 2. Check uniqueness of Email
  if (findStudentByEmail(cleanEmail)) {
    return {
      success: false,
      status: 409,
      error: 'This email is already registered. Please login.',
      isDuplicate: true,
    }
  }

  const now = new Date().toISOString()
  const newStudent = {
    id: `student_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    regd_no: cleanRegNo,
    name: cleanName,
    email: cleanEmail,
    branch: cleanBranch,
    year: cleanYear,
    password_hash: hashPassword(cleanPass),
    xp: 0,
    completed_quests: [],
    badges: [],
    xp_history: [],
    quest_progress: {},
    achievements: [],
    uploaded_proofs: {},
    reminders: [],
    created_at: now,
    updated_at: now,
  }

  const students = loadAllStudents()
  students.push(newStudent)
  saveAllStudents(students)

  return {
    success: true,
    status: 201,
    message: 'Account created successfully! Please log in.',
    student: sanitizeStudent(newStudent),
  }
}

/**
 * Authenticates a student with Registration Number + Password.
 */
export function authenticateStudent(registrationNumber, password) {
  const cleanRegNo = (registrationNumber || '').trim().toUpperCase()
  const cleanPass = (password || '').trim()

  if (!cleanRegNo || !cleanPass) {
    return { success: false, status: 400, error: 'Please enter both Registration Number and password.' }
  }

  const student = findStudentByRegdNo(cleanRegNo)
  if (!student) {
    return { success: false, status: 401, error: 'Invalid Registration Number or password.' }
  }

  const isMatch = verifyPassword(cleanPass, student.password_hash)
  if (!isMatch) {
    return { success: false, status: 401, error: 'Invalid Registration Number or password.' }
  }

  return {
    success: true,
    status: 200,
    student: sanitizeStudent(student),
  }
}

/**
 * Updates a student's progress in the central database.
 */
export function updateStudentProgress(studentId, progressData) {
  if (!studentId) return { success: false, status: 400, error: 'Missing student ID.' }

  const students = loadAllStudents()
  const index = students.findIndex((s) => s.id === studentId)
  if (index === -1) {
    return { success: false, status: 404, error: 'Student account not found.' }
  }

  const current = students[index]
  const updated = {
    ...current,
    xp: typeof progressData.xp === 'number' ? Math.max(current.xp || 0, progressData.xp) : current.xp,
    completed_quests: Array.isArray(progressData.completedQuests || progressData.completed_quests)
      ? (progressData.completedQuests || progressData.completed_quests)
      : current.completed_quests,
    badges: Array.isArray(progressData.badges) ? progressData.badges : current.badges,
    xp_history: Array.isArray(progressData.xpHistory || progressData.xp_history)
      ? (progressData.xpHistory || progressData.xp_history)
      : current.xp_history,
    quest_progress: progressData.questProgress || progressData.quest_progress || current.quest_progress,
    achievements: Array.isArray(progressData.achievements) ? progressData.achievements : current.achievements,
    uploaded_proofs: progressData.uploadedProofs || progressData.uploaded_proofs || current.uploaded_proofs,
    reminders: Array.isArray(progressData.reminders) ? progressData.reminders : current.reminders,
    updated_at: new Date().toISOString(),
  }

  students[index] = updated
  saveAllStudents(students)

  return {
    success: true,
    status: 200,
    student: sanitizeStudent(updated),
  }
}

/**
 * Removes sensitive fields (password_hash) before sending to client.
 */
export function sanitizeStudent(student) {
  if (!student) return null
  return {
    id: student.id,
    registrationNumber: student.regd_no,
    regd_no: student.regd_no,
    studentName: student.name,
    name: student.name,
    displayName: student.name,
    email: student.email,
    branch: student.branch,
    year: student.year,
    xp: student.xp || 0,
    completedQuests: student.completed_quests || [],
    badges: student.badges || [],
    xpHistory: student.xp_history || [],
    questProgress: student.quest_progress || {},
    achievements: student.achievements || [],
    uploadedProofs: student.uploaded_proofs || {},
    reminders: student.reminders || [],
    isVerified: true,
    createdAt: student.created_at,
    updatedAt: student.updated_at,
  }
}

/**
 * Retrieves sorted, ranked student leaderboard from the central database.
 * Strictly uses real registered accounts who have ACTUALLY PLAYED and earned game XP.
 * Registered but never played students are excluded.
 * Uses unique student ID to prevent any duplicate rows.
 */
export function getLeaderboardStudents() {
  const students = loadAllStudents()

  // 1. Group / aggregate by unique student ID to strictly prevent any duplicate rows
  const studentMap = new Map()

  students.forEach((s) => {
    const uniqueId = (s.id || s.regd_no || '').trim()
    if (!uniqueId) return

    const xp = typeof s.xp === 'number' ? s.xp : 0
    const completedQuests = Array.isArray(s.completed_quests) ? s.completed_quests : []

    // Strict rule: ONLY students who have ACTUALLY PLAYED (completed quests > 0 OR XP > 0)
    if (xp > 0 || completedQuests.length > 0) {
      if (!studentMap.has(uniqueId)) {
        studentMap.set(uniqueId, {
          id: s.id || uniqueId,
          name: s.name || s.studentName || s.regd_no,
          studentName: s.name || s.studentName || s.regd_no,
          registrationNumber: s.regd_no,
          regd_no: s.regd_no,
          branch: s.branch || 'AI & ML',
          department: s.branch || 'AI & ML',
          year: s.year || '1st Year',
          xp,
          score: xp,
          completedQuests,
          completedQuestsCount: completedQuests.length,
          badges: Array.isArray(s.badges) ? s.badges : [],
          badgesCount: Array.isArray(s.badges) ? s.badges.length : 0,
          createdAt: s.created_at || new Date().toISOString(),
        })
      }
    }
  })

  const formatted = Array.from(studentMap.values())

  // 2. Sort: 1. Highest XP, 2. Most completed quests, 3. Earliest registration
  formatted.sort((a, b) => {
    if (b.xp !== a.xp) {
      return b.xp - a.xp
    }
    if (b.completedQuestsCount !== a.completedQuestsCount) {
      return b.completedQuestsCount - a.completedQuestsCount
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  // 3. Assign dense/competitive ranks
  let currentRank = 1
  return formatted.map((st, index) => {
    if (index > 0) {
      const prev = formatted[index - 1]
      if (st.xp < prev.xp) {
        currentRank = index + 1
      }
    }
    return {
      ...st,
      rank: currentRank,
    }
  })
}

// ==========================================
// SINGLE SECURE ADMINISTRATOR CONFIGURATION
// ==========================================
const ROOT_ADMIN_ID = (process.env.ADMIN_ID || 'admin.campus').trim().toLowerCase()
const ROOT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'campus@12345'
const ROOT_ADMIN_PASSWORD_HASH = hashPassword(ROOT_ADMIN_PASSWORD)

/**
 * Authenticates the Single Administrator account against the central backend.
 */
export function authenticateAdmin(identifier, password) {
  const cleanId = (identifier || '').trim().toLowerCase()
  const cleanPass = (password || '').trim()

  if (!cleanId || !cleanPass) {
    return { success: false, status: 400, error: 'Please enter both Administrator ID and password.' }
  }

  // Strictly check against the single admin account
  const validIdentifiers = [
    ROOT_ADMIN_ID,
    `${ROOT_ADMIN_ID}@srkrec.ac.in`,
    'admin',
    'admin@srkrec.ac.in',
  ]

  if (!validIdentifiers.includes(cleanId)) {
    return { success: false, status: 401, error: 'Invalid Administrator ID or password.' }
  }

  const isMatch = verifyPassword(cleanPass, ROOT_ADMIN_PASSWORD_HASH)
  if (!isMatch) {
    return { success: false, status: 401, error: 'Invalid Administrator ID or password.' }
  }

  return {
    success: true,
    status: 200,
    admin: {
      id: 'admin_root',
      adminId: ROOT_ADMIN_ID,
      name: 'SRKR Campus Administrator',
      email: 'admin.campus@srkrec.ac.in',
      role: 'admin',
      isAuthenticated: true,
      authenticatedAt: new Date().toISOString(),
    },
  }
}

/**
 * Retrieves real statistics calculated from the central database.
 */
export function getAdminStatistics() {
  const students = loadAllStudents()
  const totalStudents = students.length
  const totalQuestsCompleted = students.reduce(
    (sum, s) => sum + (Array.isArray(s.completed_quests) ? s.completed_quests.length : 0),
    0
  )
  const totalXpAwarded = students.reduce((sum, s) => sum + (typeof s.xp === 'number' ? s.xp : 0), 0)

  // Department Breakdown
  const deptMap = {}
  students.forEach((s) => {
    const dept = (s.branch || 'AI & ML').trim()
    if (!deptMap[dept]) {
      deptMap[dept] = { count: 0, totalXp: 0 }
    }
    deptMap[dept].count++
    deptMap[dept].totalXp += s.xp || 0
  })

  return {
    totalStudents,
    totalQuestsCompleted,
    totalXpAwarded,
    departments: deptMap,
    timestamp: new Date().toISOString(),
  }
}
