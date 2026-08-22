const ALLOWED_EMAIL_DOMAIN = '@srkrec.ac.in'
const AUTH_SESSION_KEY = 'campusquestAuthSession'
const REGISTERED_STUDENTS_KEY = 'campusquest_registered_students'

// Simple client-side hash function for MVP development to avoid plain-text storage
export function hashPassword(plainText) {
  if (!plainText) return ''
  let hash = 0
  for (let i = 0; i < plainText.length; i++) {
    const char = plainText.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return `h_${Math.abs(hash).toString(36)}_${plainText.length}`
}

/**
 * Validates whether an email belongs to the official SRKR domain (@srkrec.ac.in).
 */
export function validateSrkrEmail(email) {
  if (!email || typeof email !== 'string') return false
  const normalized = email.trim().toLowerCase()
  const emailRegex = /^[a-zA-Z0-9._%+-]+@srkrec\.ac\.in$/
  return emailRegex.test(normalized) && normalized.endsWith(ALLOWED_EMAIL_DOMAIN)
}

/**
 * Validates standard SRKR student registration number format (e.g. 25B91A61XX).
 */
export function validateRegistrationNumber(regNo) {
  if (!regNo || typeof regNo !== 'string') return false
  const clean = regNo.trim().toUpperCase()
  // SRKR registration numbers are typically 10 characters (e.g. 24B91A6101 or 25B91A61XX)
  const regRegex = /^[0-9]{2}[A-Z0-9]{8}$/
  return regRegex.test(clean) || (clean.length >= 8 && clean.length <= 12 && /^[A-Z0-9]+$/.test(clean))
}

// Initial demo student for testing
const INITIAL_DEMO_STUDENTS = [
  {
    id: 'student_srkr_01',
    name: 'Karthik Varma',
    registrationNumber: '24B91A6101',
    email: 'karthik.v@srkrec.ac.in',
    branch: 'CSE',
    year: '3rd Year',
    passwordHash: hashPassword('Password123'),
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
 * Register a new SRKR student account with complete validations and duplicate prevention.
 */
export function registerStudent({ name, registrationNumber, email, branch, year, password, confirmPassword }) {
  const cleanName = (name || '').trim()
  const cleanRegNo = (registrationNumber || '').trim().toUpperCase()
  const cleanEmail = (email || '').trim().toLowerCase()
  const cleanBranch = (branch || '').trim()
  const cleanYear = (year || '').trim()
  const cleanPassword = (password || '').trim()
  const cleanConfirmPassword = (confirmPassword || '').trim()

  // 1. Full Name
  if (!cleanName) {
    return { success: false, error: 'Please enter your full name.' }
  }
  if (cleanName.length < 2) {
    return { success: false, error: 'Full name must be at least 2 characters.' }
  }

  // 2. Registration Number
  if (!cleanRegNo) {
    return { success: false, error: 'Please enter your SRKR registration number.' }
  }
  if (!validateRegistrationNumber(cleanRegNo)) {
    return { success: false, error: 'Enter a valid SRKR registration number (e.g. 25B91A61XX).' }
  }

  // 3. SRKR Email
  if (!cleanEmail) {
    return { success: false, error: 'Please enter your SRKR college email address.' }
  }
  if (!validateSrkrEmail(cleanEmail)) {
    return { success: false, error: 'Please use your official SRKR college email ending with @srkrec.ac.in' }
  }

  // 4. Branch
  if (!cleanBranch) {
    return { success: false, error: 'Please select your Engineering Branch.' }
  }

  // 5. Year
  if (!cleanYear) {
    return { success: false, error: 'Please select your Academic Year.' }
  }

  // 6. Password
  if (!cleanPassword) {
    return { success: false, error: 'Please create a password.' }
  }
  if (cleanPassword.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' }
  }

  // 7. Confirm Password
  if (!cleanConfirmPassword) {
    return { success: false, error: 'Please re-enter your password to confirm.' }
  }
  if (cleanPassword !== cleanConfirmPassword) {
    return { success: false, error: 'Passwords do not match. Please check and try again.' }
  }

  const existingStudents = getRegisteredStudents()

  // Duplicate Registration Number Check
  const isDuplicateReg = existingStudents.some(
    (s) => s.registrationNumber && s.registrationNumber.toUpperCase() === cleanRegNo
  )
  if (isDuplicateReg) {
    return {
      success: false,
      error: 'An account with this registration number already exists.',
      isDuplicate: true,
    }
  }

  // Duplicate Email Check
  const isDuplicateEmail = existingStudents.some(
    (s) => s.email && s.email.toLowerCase() === cleanEmail
  )
  if (isDuplicateEmail) {
    return {
      success: false,
      error: 'This SRKR email is already registered.',
      isDuplicate: true,
    }
  }

  // Create new student record
  const newStudent = {
    id: `student_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: cleanName,
    registrationNumber: cleanRegNo,
    email: cleanEmail,
    branch: cleanBranch,
    year: cleanYear,
    passwordHash: hashPassword(cleanPassword),
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
 * Login existing student with Registration Number + Password.
 */
export function loginStudent(registrationNumber, password) {
  const cleanRegNo = (registrationNumber || '').trim().toUpperCase()
  const cleanPassword = (password || '').trim()

  if (!cleanRegNo || !cleanPassword) {
    return { success: false, error: 'Please enter both your registration number and password.' }
  }

  const existingStudents = getRegisteredStudents()
  const hashed = hashPassword(cleanPassword)

  const matched = existingStudents.find(
    (s) =>
      s.registrationNumber &&
      s.registrationNumber.toUpperCase() === cleanRegNo &&
      s.passwordHash === hashed
  )

  if (!matched) {
    return { success: false, error: 'Invalid registration number or password.' }
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
    isVerified: true,
    authenticatedAt: new Date().toISOString(),
  }

  setAuthSession(sessionUser)

  return {
    success: true,
    user: sessionUser,
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
  } catch {
    // Ignore
  }
}

export { ALLOWED_EMAIL_DOMAIN }
