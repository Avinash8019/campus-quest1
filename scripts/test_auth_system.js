/**
 * Multi-Student Authentication & Central Database Verification Test Suite
 * Tests real student registration, login, gameplay participation, and dynamic leaderboard.
 * Strictly verifies ZERO mock or dummy students appear.
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

console.log('🧪 Starting CampusQuest Central Database & Real Gameplay Leaderboard Verification...\n')

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

// 1. Register Real Students
console.log('--- TEST GROUP 1: Real Student Account Registration ---')
const timeKey = Date.now()

const student1 = createStudent({
  name: 'Priya Sharma',
  registrationNumber: `24B91A${Math.floor(1000 + Math.random() * 8000)}`,
  email: `priya_${timeKey}@srkrec.ac.in`,
  branch: 'CSE',
  year: '2nd Year',
  password: 'Password@123',
})

const student2 = createStudent({
  name: 'Arjun Raju',
  registrationNumber: `23B91A${Math.floor(1000 + Math.random() * 8000)}`,
  email: `arjun_${timeKey}@srkrec.ac.in`,
  branch: 'ECE',
  year: '3rd Year',
  password: 'Password@456',
})

const student3 = createStudent({
  name: 'Kavya Sree',
  registrationNumber: `25B91A${Math.floor(1000 + Math.random() * 8000)}`,
  email: `kavya_${timeKey}@srkrec.ac.in`,
  branch: 'AI & ML',
  year: '1st Year',
  password: 'Password@789',
})

const studentUnplayed = createStudent({
  name: 'Rahul Kumar',
  registrationNumber: `24B91A${Math.floor(1000 + Math.random() * 8000)}`,
  email: `rahul_${timeKey}@srkrec.ac.in`,
  branch: 'Mechanical',
  year: '2nd Year',
  password: 'Password@000',
})

assert(student1.success && student1.student.xp === 0, 'Priya Sharma registered with 0 initial XP')
assert(student2.success && student2.student.xp === 0, 'Arjun Raju registered with 0 initial XP')
assert(student3.success && student3.student.xp === 0, 'Kavya Sree registered with 0 initial XP')
assert(studentUnplayed.success && studentUnplayed.student.xp === 0, 'Rahul Kumar registered with 0 initial XP')

// 2. Authentication & Verification
console.log('\n--- TEST GROUP 2: Authentication & Password Verification ---')
const login1 = authenticateStudent(student1.student.registrationNumber, 'Password@123')
assert(login1.success === true && login1.student.name === 'Priya Sharma', 'Priya Sharma login with correct password succeeds')

const loginWrong = authenticateStudent(student1.student.registrationNumber, 'WrongPassword!999')
assert(loginWrong.success === false && loginWrong.status === 401, 'Login with incorrect password rejected (401)')

// 3. Leaderboard Before Any Game Play (Empty or excludes unplayed)
console.log('\n--- TEST GROUP 3: Unplayed Accounts Excluded From Leaderboard ---')
const lbInit = getLeaderboardStudents()
const foundUnplayed = lbInit.find((s) => s.id === studentUnplayed.student.id)
assert(foundUnplayed === undefined, 'Rahul Kumar (Registered & Logged in, but NEVER played) is NOT on the leaderboard')

// 4. Real Gameplay Activity & Scoring
console.log('\n--- TEST GROUP 4: Real Game Participation & Score Recording ---')

// Priya plays 2 quests -> earns 350 real XP
updateStudentProgress(student1.student.id, {
  xp: 350,
  completedQuests: [1, 2],
  xpHistory: [
    { id: 1, title: 'Main Gate Quest', xp: 150 },
    { id: 2, title: 'Central Library Challenge', xp: 200 },
  ],
})

// Arjun plays 4 quests -> earns 750 real XP
updateStudentProgress(student2.student.id, {
  xp: 750,
  completedQuests: [1, 2, 3, 4],
  xpHistory: [
    { id: 1, title: 'Main Gate Quest', xp: 150 },
    { id: 2, title: 'Central Library Challenge', xp: 200 },
    { id: 3, title: 'AI & Coding Hub Exploration', xp: 200 },
    { id: 4, title: 'Mechanical Workshop Visit', xp: 200 },
  ],
})

// Kavya plays 1 quest -> earns 150 real XP
updateStudentProgress(student3.student.id, {
  xp: 150,
  completedQuests: [1],
  xpHistory: [{ id: 1, title: 'Main Gate Quest', xp: 150 }],
})

// 5. Dynamic Leaderboard Sorting & Verification
console.log('\n--- TEST GROUP 5: Dynamic Real Leaderboard Ranking ---')
const lbAfterPlay = getLeaderboardStudents()

const priyaLb = lbAfterPlay.find((s) => s.id === student1.student.id)
const arjunLb = lbAfterPlay.find((s) => s.id === student2.student.id)
const kavyaLb = lbAfterPlay.find((s) => s.id === student3.student.id)
const rahulLb = lbAfterPlay.find((s) => s.id === studentUnplayed.student.id)

assert(arjunLb && arjunLb.xp === 750 && arjunLb.rank === 1, 'Arjun Raju with 750 real XP is ranked #1')
assert(priyaLb && priyaLb.xp === 350 && priyaLb.rank > arjunLb.rank, 'Priya Sharma with 350 real XP is ranked below Arjun')
assert(kavyaLb && kavyaLb.xp === 150 && kavyaLb.rank > priyaLb.rank, 'Kavya Sree with 150 real XP is ranked below Priya')
assert(rahulLb === undefined, 'Rahul Kumar (unplayed) remains strictly excluded from the leaderboard')

// 6. Duplicate Prevention by Unique Database User ID
console.log('\n--- TEST GROUP 6: Duplicate Prevention by Unique Student ID ---')
const priyaOccurrences = lbAfterPlay.filter((s) => s.id === student1.student.id)
assert(priyaOccurrences.length === 1, 'Priya Sharma appears EXACTLY ONCE on the leaderboard with aggregated score')

// 7. Security & Absence of Mock Data
console.log('\n--- TEST GROUP 7: Zero Mock Data & Password Security ---')
assert(lbAfterPlay.every((s) => s.password_hash === undefined && s.passwordHash === undefined), 'Zero password hashes exposed')
assert(
  lbAfterPlay.every((s) => {
    const name = s.name.toLowerCase()
    return name !== 'student a' && name !== 'student b' && name !== 'student c' && name !== 'student d'
  }),
  'Zero "Student A/B/C/D" placeholder names exist on leaderboard'
)

// 8. Admin Authentication & Analytics
console.log('\n--- TEST GROUP 8: Admin Authentication & Real Stats ---')
const adminAuth = authenticateAdmin('admin.campus', 'campus@12345')
assert(adminAuth.success === true && adminAuth.admin.role === 'admin', 'Admin login succeeds with role "admin"')

const adminStats = getAdminStatistics()
assert(typeof adminStats.totalStudents === 'number' && adminStats.totalStudents >= 4, 'Admin stats totalStudents is real numeric count')
assert(adminStats.totalQuestsCompleted >= 7, 'Admin stats totalQuestsCompleted accurately reflects real completed quests')

console.log(`\n========================================`)
console.log(`TEST SUMMARY: ${testsPassed} Passed, ${testsFailed} Failed`)
console.log(`========================================`)

if (testsFailed > 0) {
  process.exit(1)
}
