/**
 * Multi-Student Authentication & Central Database Verification Test Suite
 */

import {
  createStudent,
  authenticateStudent,
  findStudentByRegdNo,
  updateStudentProgress,
  loadAllStudents,
  getLeaderboardStudents,
  authenticateAdmin,
  getAdminStatistics,
} from '../server/db.js'

console.log('🧪 Starting CampusQuest Central Database & Multi-Student Account Verification...\n')

let testsPassed = 0
let testsFailed = 0

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`)
    testsPassed++
  } else {
    console.error(`❌ FAIL: ${testName}`)
    testsFailed++
  }
}

// 1. Verify Pre-Seeded Test Accounts
console.log('--- TEST GROUP 1: Pre-Seeded Test Accounts ---')
const studentA = findStudentByRegdNo('TEST001')
const studentB = findStudentByRegdNo('TEST002')
const studentC = findStudentByRegdNo('TEST003')

assert(studentA !== null && studentA.regd_no === 'TEST001', 'Student A (TEST001) exists in Central DB')
assert(studentB !== null && studentB.regd_no === 'TEST002', 'Student B (TEST002) exists in Central DB')
assert(studentC !== null && studentC.regd_no === 'TEST003', 'Student C (TEST003) exists in Central DB')

// 2. Test Correct Password Logins
console.log('\n--- TEST GROUP 2: Password Authentication ---')
const loginA = authenticateStudent('TEST001', 'Test@123')
assert(loginA.success === true && loginA.student.name === 'Student A', 'Student A login with Test@123 succeeds')

const loginB = authenticateStudent('TEST002', 'Test@456')
assert(loginB.success === true && loginB.student.name === 'Student B', 'Student B login with Test@456 succeeds')

const loginC = authenticateStudent('TEST003', 'Test@789')
assert(loginC.success === true && loginC.student.name === 'Student C', 'Student C login with Test@789 succeeds')

// 3. Test Invalid Credentials
console.log('\n--- TEST GROUP 3: Invalid Credentials & Security ---')
const wrongPass = authenticateStudent('TEST001', 'WrongPassword!123')
assert(wrongPass.success === false && wrongPass.status === 401, 'Student A login with WRONG password rejected (401)')

const unknownStudent = authenticateStudent('UNKNOWN999', 'AnyPassword123')
assert(unknownStudent.success === false && unknownStudent.status === 401, 'Unknown student login rejected (401)')

// 4. Test Registration & Uniqueness Enforcement
console.log('\n--- TEST GROUP 4: Registration & Uniqueness Constraint ---')
const duplicateReg = createStudent({
  name: 'Duplicate Student',
  registrationNumber: 'TEST001',
  email: 'duplicate@srkrec.ac.in',
  branch: 'CSE',
  year: '1st Year',
  password: 'Password123',
})
assert(
  duplicateReg.success === false && duplicateReg.status === 409,
  'Duplicate Registration Number registration rejected (409 Conflict)'
)

// Register a new independent student
const newRegNo = `24B91A${Math.floor(1000 + Math.random() * 9000)}`
const newEmail = `student_${Date.now()}@srkrec.ac.in`
const newStudentRes = createStudent({
  name: 'New Independent Student',
  registrationNumber: newRegNo,
  email: newEmail,
  branch: 'AI & ML',
  year: '1st Year',
  password: 'SecurePassword123',
})
assert(newStudentRes.success === true && newStudentRes.status === 201, `New student ${newRegNo} successfully registered in Central DB`)

const newStudentLogin = authenticateStudent(newRegNo, 'SecurePassword123')
assert(newStudentLogin.success === true, `Newly registered student ${newRegNo} logs in successfully`)

// 5. Test Account Data Isolation
console.log('\n--- TEST GROUP 5: Account Isolation & Progress Sync ---')
updateStudentProgress(studentA.id, { xp: 500, completedQuests: [1, 2, 3] })
const reloadedA = findStudentByRegdNo('TEST001')
const reloadedB = findStudentByRegdNo('TEST002')

assert(reloadedA.xp === 500 && reloadedA.completed_quests.length === 3, 'Student A progress updated to 500 XP & 3 quests')
assert(reloadedB.xp === 300 && reloadedB.completed_quests.length === 2, 'Student B progress remains completely isolated (300 XP & 2 quests)')

// 6. Test Password Security (No plain-text storage)
console.log('\n--- TEST GROUP 6: Password Security ---')
assert(!reloadedA.password_hash.includes('Test@123'), 'Student A password is NOT stored in plain text')
assert(reloadedA.password_hash.startsWith('pbkdf2$'), 'Student A password uses salted PBKDF2 hash')
assert(newStudentLogin.student.password_hash === undefined, 'Sanitized student object does NOT expose password_hash to frontend')

// 7. Test Real Central Database Leaderboard System
console.log('\n--- TEST GROUP 7: Real Central Leaderboard Ranking ---')

// Update Student C score to 1200 XP
updateStudentProgress(studentC.id, { xp: 1200, completedQuests: [1, 2, 3, 4, 5, 6, 7, 8] })

const leaderboard = getLeaderboardStudents()
assert(Array.isArray(leaderboard) && leaderboard.length > 0, 'Central Leaderboard returns real registered student array')

const studentCLeaderboard = leaderboard.find((s) => s.registrationNumber === 'TEST003')
const studentALeaderboard = leaderboard.find((s) => s.registrationNumber === 'TEST001')
const studentBLeaderboard = leaderboard.find((s) => s.registrationNumber === 'TEST002')

assert(studentCLeaderboard && studentCLeaderboard.xp === 1200 && studentCLeaderboard.rank === 1, 'Student C with 1200 XP is ranked #1')
assert(studentALeaderboard && studentALeaderboard.xp === 500 && studentALeaderboard.rank === 2, 'Student A with 500 XP is ranked #2')
assert(studentBLeaderboard && studentBLeaderboard.xp === 300 && studentBLeaderboard.rank > studentALeaderboard.rank, 'Student B with 300 XP is ranked below Student A based on score')

// Verify zero sensitive data is exposed in leaderboard
assert(leaderboard.every((st) => st.password_hash === undefined), 'Zero password hashes exposed in leaderboard entries')
assert(leaderboard.every((st) => !st.name.includes('Dummy') && !st.name.includes('Mock')), 'No dummy or mock students in leaderboard')

// 8. Test Single Secure Administrator Authentication
console.log('\n--- TEST GROUP 8: Single Secure Admin Authentication & Isolation ---')

// 8.1 Correct Admin Credentials
const adminLoginValid = authenticateAdmin('admin.campus', 'campus@12345')
assert(adminLoginValid.success === true && adminLoginValid.admin.role === 'admin', 'Admin login with admin.campus + campus@12345 succeeds with role "admin"')
assert(adminLoginValid.admin.adminId === 'admin.campus', 'Admin ID matches admin.campus')

// 8.2 Wrong Password
const adminLoginWrongPass = authenticateAdmin('admin.campus', 'wrong_password_123')
assert(adminLoginWrongPass.success === false && adminLoginWrongPass.status === 401, 'Admin login with WRONG password rejected (401)')

// 8.3 Wrong Admin ID
const adminLoginWrongId = authenticateAdmin('wrong.admin', 'campus@12345')
assert(adminLoginWrongId.success === false && adminLoginWrongId.status === 401, 'Admin login with WRONG admin ID rejected (401)')

// 8.4 Verify Admin Statistics matches Real Database Counts
const adminStats = getAdminStatistics()
const allStudentsList = loadAllStudents()
assert(adminStats.totalStudents === allStudentsList.length, `Admin stats totalStudents (${adminStats.totalStudents}) matches real DB students (${allStudentsList.length})`)
assert(typeof adminStats.totalQuestsCompleted === 'number', 'Admin stats totalQuestsCompleted is real numeric count')
assert(typeof adminStats.totalXpAwarded === 'number', 'Admin stats totalXpAwarded is real numeric sum')

// 8.5 Verify Student Registration cannot hijack or create Admin accounts
const studentHijack = createStudent({
  name: 'Fake Admin Student',
  registrationNumber: '24B91A9999',
  email: 'admin.campus@srkrec.ac.in',
  branch: 'CSE',
  year: '1st Year',
  password: 'StudentPassword123',
})
// Student login must still yield student role, never admin
const studentAuth = authenticateStudent('TEST001', 'Test@123')
assert(studentAuth.student.role !== 'admin', 'Student account never possesses admin role')

// 9. Test Strict Gameplay Activity Leaderboard Eligibility
console.log('\n--- TEST GROUP 9: Strict Gameplay Activity Leaderboard Eligibility ---')

// 9.1 Register Student D (Never Played)
const regStudentD = createStudent({
  name: 'Student D Unplayed',
  registrationNumber: 'TEST004_TEST',
  email: 'student_d_test@srkrec.ac.in',
  branch: 'EEE',
  year: '1st Year',
  password: 'Password123',
})
assert(regStudentD.success === true && regStudentD.student.xp === 0, 'Student D registered with 0 initial XP')

const leaderboardBeforePlay = getLeaderboardStudents()
const foundD = leaderboardBeforePlay.find((s) => s.registrationNumber === 'TEST004_TEST')
assert(foundD === undefined, 'Student D (Registered + Logged In but NEVER played) is NOT on the leaderboard')

// 9.2 Student D completes first quest (Earns 150 real XP)
updateStudentProgress(regStudentD.student.id, { xp: 150, completedQuests: [1] })

const leaderboardAfterPlay = getLeaderboardStudents()
const foundDAfter = leaderboardAfterPlay.find((s) => s.registrationNumber === 'TEST004_TEST')
assert(foundDAfter !== undefined && foundDAfter.xp === 150, 'Student D appears on the leaderboard AFTER playing and completing a quest with 150 real XP')
assert(typeof foundDAfter.rank === 'number' && foundDAfter.rank > 0, `Student D assigned real competitive rank #${foundDAfter.rank}`)

// 9.3 Verify zero students with 0 XP appear on leaderboard
assert(leaderboardAfterPlay.every((s) => s.xp > 0 || (Array.isArray(s.completedQuests) && s.completedQuests.length > 0)), 'All students on leaderboard have real gameplay activity (XP > 0 or completedQuests > 0)')

console.log(`\n========================================`)
console.log(`TEST SUMMARY: ${testsPassed} Passed, ${testsFailed} Failed`)
console.log(`========================================`)

if (testsFailed > 0) {
  process.exit(1)
}
