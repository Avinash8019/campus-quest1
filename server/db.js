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

// Initial pre-seeded student accounts for multi-device testing and demo
const INITIAL_STUDENTS = [
  {
    id: 'student_test_001',
    regd_no: 'TEST001',
    name: 'Student A',
    email: 'test001@srkrec.ac.in',
    branch: 'CSE',
    year: '2nd Year',
    password_hash: hashPassword('Test@123'),
    xp: 150,
    completed_quests: [1],
    badges: ['🚀 Campus Explorer'],
    xp_history: [{ id: 1, title: 'Main Campus Gate Quest', xp: 150, date: new Date().toISOString() }],
    quest_progress: { 1: { step: 4, isQrVerified: true, isLocationSolved: true, isQuestionAnswered: true, isPhotoUploaded: true } },
    achievements: [],
    uploaded_proofs: {},
    reminders: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'student_test_002',
    regd_no: 'TEST002',
    name: 'Student B',
    email: 'test002@srkrec.ac.in',
    branch: 'AI & ML',
    year: '3rd Year',
    password_hash: hashPassword('Test@456'),
    xp: 300,
    completed_quests: [1, 2],
    badges: ['🚀 Campus Explorer', '💻 Lab Master'],
    xp_history: [
      { id: 1, title: 'Main Campus Gate Quest', xp: 150, date: new Date().toISOString() },
      { id: 2, title: 'AI & Coding Hub Exploration', xp: 150, date: new Date().toISOString() },
    ],
    quest_progress: {
      1: { step: 4, isQrVerified: true, isLocationSolved: true, isQuestionAnswered: true, isPhotoUploaded: true },
      2: { step: 4, isQrVerified: true, isLocationSolved: true, isQuestionAnswered: true, isPhotoUploaded: true },
    },
    achievements: [],
    uploaded_proofs: {},
    reminders: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'student_test_003',
    regd_no: 'TEST003',
    name: 'Student C',
    email: 'test003@srkrec.ac.in',
    branch: 'ECE',
    year: '1st Year',
    password_hash: hashPassword('Test@789'),
    xp: 100,
    completed_quests: [],
    badges: [],
    xp_history: [],
    quest_progress: {},
    achievements: [],
    uploaded_proofs: {},
    reminders: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'student_srkr_01',
    regd_no: '24B91A6101',
    name: 'Karthik Varma',
    email: 'karthik.v@srkrec.ac.in',
    branch: 'CSE',
    year: '3rd Year',
    password_hash: hashPassword('Password123'),
    xp: 450,
    completed_quests: [1, 2, 3],
    badges: ['🚀 Campus Explorer', '💻 Lab Master', '📚 Library Scholar'],
    xp_history: [],
    quest_progress: {},
    achievements: [],
    uploaded_proofs: {},
    reminders: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'student_srkr_02',
    regd_no: '25B91A6101',
    name: 'SRKR Student',
    email: 'student@srkrec.ac.in',
    branch: 'AI & ML',
    year: '1st Year',
    password_hash: hashPassword('Password123'),
    xp: 100,
    completed_quests: [],
    badges: [],
    xp_history: [],
    quest_progress: {},
    achievements: [],
    uploaded_proofs: {},
    reminders: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

/**
 * Loads all student records from persistent file database.
 */
export function loadAllStudents() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      saveAllStudents(INITIAL_STUDENTS)
      return INITIAL_STUDENTS
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure pre-seeded test accounts exist for testing
      const regNos = new Set(parsed.map((s) => (s.regd_no || '').toUpperCase()))
      let modified = false
      for (const initial of INITIAL_STUDENTS) {
        if (!regNos.has(initial.regd_no.toUpperCase())) {
          parsed.push(initial)
          modified = true
        }
      }
      if (modified) {
        saveAllStudents(parsed)
      }
      return parsed
    }
    saveAllStudents(INITIAL_STUDENTS)
    return INITIAL_STUDENTS
  } catch (err) {
    console.error('Error loading database, initializing defaults:', err)
    saveAllStudents(INITIAL_STUDENTS)
    return INITIAL_STUDENTS
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
    xp: 100,
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
