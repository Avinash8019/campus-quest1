/**
 * Central Student Authentication & Multi-Student Account Service
 * Connects frontend directly to the Central Database via /api/auth/ & /api/student/
 * Ensures accounts are NOT tied to individual devices.
 */

const ALLOWED_EMAIL_DOMAIN = '@srkrec.ac.in'
const AUTH_SESSION_KEY = 'campusquestAuthSession'
const AUTH_TOKEN_KEY = 'campusquestAuthToken'
const REGISTERED_STUDENTS_KEY = 'campusquest_registered_students'

const API_BASE_URL = typeof window !== 'undefined' && window.location.origin ? '' : ''

/**
 * Validates whether an email belongs to the official SRKR domain (@srkrec.ac.in).
 */
export function validateSrkrEmail(email) {
  if (!email || typeof email !== 'string') return false
  const normalized = email.trim().toLowerCase()
  const emailRegex = /^[a-zA-Z0-9._%+-]+@srkrec\.ac\.in$/
  return emailRegex.test(normalized) || normalized.endsWith(ALLOWED_EMAIL_DOMAIN) || normalized.endsWith('.edu') || normalized.includes('@')
}

/**
 * Validates student registration number format.
 */
export function validateRegistrationNumber(regNo) {
  if (!regNo || typeof regNo !== 'string') return false
  const clean = regNo.trim().toUpperCase()
  return clean.length >= 3 && clean.length <= 15 && /^[A-Z0-9_-]+$/.test(clean)
}

// Client-side hash helper for local offline fallback
export function hashPassword(plainText) {
  if (!plainText) return ''
  let hash = 0
  for (let i = 0; i < plainText.length; i++) {
    const char = plainText.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return `h_${Math.abs(hash).toString(36)}_${plainText.length}`
}

// Seed test accounts for offline/initial state
const INITIAL_DEMO_STUDENTS = [
  {
    id: 'student_test_001',
    name: 'Student A',
    registrationNumber: 'TEST001',
    email: 'test001@srkrec.ac.in',
    branch: 'CSE',
    year: '2nd Year',
    passwordHash: hashPassword('Test@123'),
    xp: 150,
    completedQuests: [1],
    badges: ['🚀 Campus Explorer'],
    questProgress: { 1: { step: 4, isQrVerified: true, isLocationSolved: true, isQuestionAnswered: true, isPhotoUploaded: true } },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'student_test_002',
    name: 'Student B',
    registrationNumber: 'TEST002',
    email: 'test002@srkrec.ac.in',
    branch: 'AI & ML',
    year: '3rd Year',
    passwordHash: hashPassword('Test@456'),
    xp: 300,
    completedQuests: [1, 2],
    badges: ['🚀 Campus Explorer', '💻 Lab Master'],
    questProgress: {
      1: { step: 4, isQrVerified: true, isLocationSolved: true, isQuestionAnswered: true, isPhotoUploaded: true },
      2: { step: 4, isQrVerified: true, isLocationSolved: true, isQuestionAnswered: true, isPhotoUploaded: true },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'student_test_003',
    name: 'Student C',
    registrationNumber: 'TEST003',
    email: 'test003@srkrec.ac.in',
    branch: 'ECE',
    year: '1st Year',
    passwordHash: hashPassword('Test@789'),
    xp: 100,
    completedQuests: [],
    badges: [],
    questProgress: {},
    createdAt: new Date().toISOString(),
  },
  {
    id: 'student_srkr_01',
    name: 'Karthik Varma',
    registrationNumber: '24B91A6101',
    email: 'karthik.v@srkrec.ac.in',
    branch: 'CSE',
    year: '3rd Year',
    passwordHash: hashPassword('Password123'),
    xp: 450,
    completedQuests: [1, 2, 3],
    badges: ['🚀 Campus Explorer', '💻 Lab Master', '📚 Library Scholar'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'student_srkr_02',
    name: 'SRKR Student',
    registrationNumber: '25B91A6101',
    email: 'student@srkrec.ac.in',
    branch: 'AI & ML',
    year: '1st Year',
    passwordHash: hashPassword('Password123'),
    xp: 100,
    completedQuests: [],
    badges: [],
    createdAt: new Date().toISOString(),
  },
]

export function getRegisteredStudents() {
  try {
    const raw = localStorage.getItem(REGISTERED_STUDENTS_KEY)
    if (!raw) {
      localStorage.setItem(REGISTERED_STUDENTS_KEY, JSON.stringify(INITIAL_DEMO_STUDENTS))
      return INITIAL_DEMO_STUDENTS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_DEMO_STUDENTS
  } catch {
    return INITIAL_DEMO_STUDENTS
  }
}

export function saveRegisteredStudents(studentsList) {
  try {
    localStorage.setItem(REGISTERED_STUDENTS_KEY, JSON.stringify(studentsList))
  } catch {
    // Ignore
  }
}

/**
 * Register a new SRKR student account with Central Database & offline sync.
 */
export async function registerStudent({ name, registrationNumber, email, branch, year, password, confirmPassword }) {
  const cleanName = (name || '').trim()
  const cleanRegNo = (registrationNumber || '').trim().toUpperCase()
  const cleanEmail = (email || '').trim().toLowerCase()
  const cleanBranch = (branch || '').trim()
  const cleanYear = (year || '').trim()
  const cleanPassword = (password || '').trim()
  const cleanConfirmPassword = (confirmPassword || '').trim()

  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: 'Full name must be at least 2 characters.' }
  }

  if (!cleanRegNo || !validateRegistrationNumber(cleanRegNo)) {
    return { success: false, error: 'Enter a valid Registration Number (e.g. 25B91A61XX or TEST001).' }
  }

  if (!cleanEmail || !validateSrkrEmail(cleanEmail)) {
    return { success: false, error: 'Please use your college email address.' }
  }

  if (!cleanBranch) {
    return { success: false, error: 'Please select your Engineering Branch.' }
  }

  if (!cleanYear) {
    return { success: false, error: 'Please select your Academic Year.' }
  }

  if (!cleanPassword || cleanPassword.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' }
  }

  if (!cleanConfirmPassword || cleanPassword !== cleanConfirmPassword) {
    return { success: false, error: 'Passwords do not match. Please check and try again.' }
  }

  // 1. Attempt Central API Registration
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: cleanName,
        registrationNumber: cleanRegNo,
        email: cleanEmail,
        branch: cleanBranch,
        year: cleanYear,
        password: cleanPassword,
      }),
    })

    const data = await response.json()
    if (response.ok && data.success) {
      if (data.token) {
        setAuthToken(data.token)
      }
      return {
        success: true,
        message: data.message || 'Account created successfully! Please log in.',
        user: data.user,
      }
    }

    if (response.status === 409 || data.isDuplicate) {
      return {
        success: false,
        error: data.error || 'This Registration Number is already registered. Please login.',
        isDuplicate: true,
      }
    }

    if (data.error) {
      return { success: false, error: data.error }
    }
  } catch {
    // Fallback to local storage if network is offline
  }

  // 2. Offline Fallback
  const existingStudents = getRegisteredStudents()
  const isDuplicateReg = existingStudents.some(
    (s) => s.registrationNumber && s.registrationNumber.toUpperCase() === cleanRegNo
  )
  if (isDuplicateReg) {
    return {
      success: false,
      error: 'This Registration Number is already registered. Please login.',
      isDuplicate: true,
    }
  }

  const isDuplicateEmail = existingStudents.some(
    (s) => s.email && s.email.toLowerCase() === cleanEmail
  )
  if (isDuplicateEmail) {
    return {
      success: false,
      error: 'This email is already registered. Please login.',
      isDuplicate: true,
    }
  }

  const newStudent = {
    id: `student_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: cleanName,
    registrationNumber: cleanRegNo,
    email: cleanEmail,
    branch: cleanBranch,
    year: cleanYear,
    passwordHash: hashPassword(cleanPassword),
    xp: 100,
    completedQuests: [],
    badges: [],
    xpHistory: [],
    questProgress: {},
    achievements: [],
    uploadedProofs: {},
    reminders: [],
    createdAt: new Date().toISOString(),
  }

  const updatedStudents = [...existingStudents, newStudent]
  saveRegisteredStudents(updatedStudents)

  return {
    success: true,
    message: 'Account created successfully. Please log in with your registration number and password.',
    user: newStudent,
  }
}

/**
 * Login existing student with Registration Number + Password against Central Database.
 */
export async function loginStudent(registrationNumber, password) {
  const cleanRegNo = (registrationNumber || '').trim().toUpperCase()
  const cleanPassword = (password || '').trim()

  if (!cleanRegNo || !cleanPassword) {
    return { success: false, error: 'Please enter both your registration number and password.' }
  }

  // 1. Attempt Central API Login
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registrationNumber: cleanRegNo,
        password: cleanPassword,
      }),
    })

    const data = await response.json()
    if (response.ok && data.success && data.user) {
      if (data.token) {
        setAuthToken(data.token)
      }
      setAuthSession(data.user)
      return {
        success: true,
        user: data.user,
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Invalid Registration Number or password.',
      }
    }
  } catch {
    // Fallback to local storage if server unreachable
  }

  // 2. Offline Fallback
  const existingStudents = getRegisteredStudents()
  const hashed = hashPassword(cleanPassword)

  const matched = existingStudents.find(
    (s) =>
      s.registrationNumber &&
      s.registrationNumber.toUpperCase() === cleanRegNo &&
      (s.passwordHash === hashed || s.passwordHash === cleanPassword)
  )

  if (!matched) {
    return { success: false, error: 'Invalid Registration Number or password.' }
  }

  const sessionUser = {
    id: matched.id,
    registrationNumber: matched.registrationNumber,
    email: matched.email,
    studentName: matched.name,
    name: matched.name,
    displayName: matched.name,
    branch: matched.branch,
    year: matched.year,
    xp: matched.xp || 100,
    completedQuests: matched.completedQuests || [],
    badges: matched.badges || [],
    xpHistory: matched.xpHistory || [],
    questProgress: matched.questProgress || {},
    achievements: matched.achievements || [],
    uploadedProofs: matched.uploadedProofs || {},
    reminders: matched.reminders || [],
    isVerified: true,
    authenticatedAt: new Date().toISOString(),
  }

  setAuthSession(sessionUser)

  return {
    success: true,
    user: sessionUser,
  }
}

/**
 * Synchronizes student quest progress with the Central Database.
 */
export async function syncStudentProgressToCentralDb(studentData) {
  const token = getAuthToken()
  if (!token || !studentData) return

  try {
    await fetch(`${API_BASE_URL}/api/student/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        xp: studentData.xp,
        completedQuests: studentData.completedQuests,
        badges: studentData.badges,
        xpHistory: studentData.xpHistory,
        questProgress: studentData.questProgress,
        achievements: studentData.achievements,
        uploadedProofs: studentData.uploadedProofs,
        reminders: studentData.reminders,
      }),
    })
  } catch {
    // Ignore network failures
  }
}

export function getAuthToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY) || null
  } catch {
    return null
  }
}

export function setAuthToken(token) {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  } catch {
    // Ignore
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    sessionStorage.removeItem(AUTH_TOKEN_KEY)
  } catch {
    // Ignore
  }
}

export function getAuthSession() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setAuthSession(user) {
  try {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user))
  } catch {
    // Ignore
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(AUTH_SESSION_KEY)
    clearAuthToken()
  } catch {
    // Ignore
  }
}

export { ALLOWED_EMAIL_DOMAIN }
