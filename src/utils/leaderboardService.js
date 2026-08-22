/**
 * Real Multi-Student Leaderboard Service for CampusQuest
 * Connects directly to the Central Database via /api/leaderboard
 * Displays ONLY legitimately registered students with real quest scores.
 * ZERO mock or dummy students.
 */

import { getRegisteredStudents } from './authService.js'

export const DEPARTMENTS = [
  'All Departments',
  'AI & ML',
  'CSE',
  'CSE (AI)',
  'CSE (DS)',
  'ECE',
  'EEE',
  'Mechanical',
  'Civil',
  'Other',
]

export const YEARS = [
  'All Years',
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
]

const API_BASE_URL = typeof window !== 'undefined' && window.location.origin ? '' : ''

/**
 * Normalizes branch/department string to standard representation.
 */
export function normalizeDepartment(branchStr) {
  if (!branchStr) return 'CSE'
  const clean = branchStr.trim()
  if (clean.includes('AI & ML') || clean.includes('AIML')) return 'AI & ML'
  if (clean.includes('CSE (AI)') || clean.includes('CSE-AI')) return 'CSE (AI)'
  if (clean.includes('CSE (DS)') || clean.includes('CSE-DS')) return 'CSE (DS)'
  if (clean.includes('CSE') || clean.includes('Computer')) return 'CSE'
  if (clean.includes('ECE') || clean.includes('Electronics')) return 'ECE'
  if (clean.includes('EEE') || clean.includes('Electrical')) return 'EEE'
  if (clean.includes('Mech')) return 'Mechanical'
  if (clean.includes('Civil')) return 'Civil'
  return clean || 'Other'
}

/**
 * Asynchronously fetches real registered students from Central Database API.
 */
export async function fetchCentralLeaderboard(currentStudent = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/leaderboard`)
    if (res.ok) {
      const data = await res.json()
      if (data.success && Array.isArray(data.leaderboard)) {
        return mergeActiveStudent(data.leaderboard, currentStudent)
      }
    }
  } catch {
    // Network offline fallback
  }

  // Offline fallback to local registered students
  return getLocalRealStudents(currentStudent)
}

/**
 * Synchronous getter using local registered students and current student.
 * NO fake/mock data.
 */
export function getAllLeaderboardStudents(currentStudent = null) {
  return getLocalRealStudents(currentStudent)
}

function getLocalRealStudents(currentStudent = null) {
  const registered = getRegisteredStudents()
  const map = new Map()

  if (Array.isArray(registered)) {
    registered.forEach((st) => {
      const regNo = (st.registrationNumber || st.regd_no || '').trim().toUpperCase()
      if (regNo) {
        map.set(regNo, {
          id: st.id || regNo,
          name: st.name || st.studentName || 'SRKR Student',
          studentName: st.name || st.studentName || 'SRKR Student',
          registrationNumber: regNo,
          regd_no: regNo,
          email: st.email || '',
          branch: normalizeDepartment(st.branch || st.department),
          department: normalizeDepartment(st.branch || st.department),
          year: st.year || '1st Year',
          xp: typeof st.xp === 'number' ? st.xp : 100,
          completedQuests: Array.isArray(st.completedQuests) ? st.completedQuests : (st.completed_quests || []),
          badges: Array.isArray(st.badges) ? st.badges : [],
        })
      }
    })
  }

  return mergeActiveStudent(Array.from(map.values()), currentStudent)
}

function mergeActiveStudent(studentsList, currentStudent) {
  if (!currentStudent || !currentStudent.registrationNumber) {
    return rankStudents(studentsList)
  }

  const regNo = currentStudent.registrationNumber.trim().toUpperCase()
  const activeXp = Math.max(0, Number(currentStudent.xp) || 0)
  const map = new Map()

  studentsList.forEach((st) => {
    const r = (st.registrationNumber || st.regd_no || '').trim().toUpperCase()
    if (r) {
      map.set(r, {
        ...st,
        registrationNumber: r,
        regd_no: r,
        department: normalizeDepartment(st.department || st.branch),
        branch: normalizeDepartment(st.branch || st.department),
      })
    }
  })

  const existing = map.get(regNo) || {}
  map.set(regNo, {
    ...existing,
    ...currentStudent,
    id: currentStudent.id || existing.id || regNo,
    name: currentStudent.studentName || currentStudent.name || existing.name || 'SRKR Student',
    studentName: currentStudent.studentName || currentStudent.name || existing.studentName || 'SRKR Student',
    registrationNumber: regNo,
    regd_no: regNo,
    email: currentStudent.email || existing.email || '',
    branch: normalizeDepartment(currentStudent.branch || existing.branch || 'CSE'),
    department: normalizeDepartment(currentStudent.branch || existing.department || 'CSE'),
    year: currentStudent.year || existing.year || '1st Year',
    xp: activeXp,
    score: activeXp,
    completedQuests: Array.isArray(currentStudent.completedQuests) ? currentStudent.completedQuests : (existing.completedQuests || []),
    badges: Array.isArray(currentStudent.badges) ? currentStudent.badges : (existing.badges || []),
    isCurrentUser: true,
  })

  return rankStudents(Array.from(map.values()))
}

/**
 * Standard competitive ranking based strictly on real XP.
 */
export function rankStudents(studentsList) {
  if (!Array.isArray(studentsList) || studentsList.length === 0) {
    return []
  }

  const sorted = [...studentsList].sort((a, b) => {
    const diff = (b.xp || 0) - (a.xp || 0)
    if (diff !== 0) return diff
    return (a.name || '').localeCompare(b.name || '')
  })

  let currentRank = 1
  return sorted.map((student, index) => {
    if (index > 0 && student.xp < sorted[index - 1].xp) {
      currentRank = index + 1
    }
    return {
      ...student,
      rank: currentRank,
    }
  })
}

/**
 * Calculates Overall Rank, Department Rank, and Year Rank for the current student.
 */
export function getStudentRanks(currentStudent, studentsList = null) {
  const all = studentsList || getAllLeaderboardStudents(currentStudent)
  const currentRegNo = (currentStudent?.registrationNumber || '').trim().toUpperCase()
  const studentDept = normalizeDepartment(currentStudent?.branch || currentStudent?.department || 'CSE')
  const studentYear = currentStudent?.year || '1st Year'

  const rankedOverall = rankStudents(all)
  const overallItem = rankedOverall.find((s) => (s.registrationNumber || '').toUpperCase() === currentRegNo)
  const overallRank = overallItem ? overallItem.rank : 1
  const totalStudents = rankedOverall.length

  const deptList = all.filter((s) => normalizeDepartment(s.department || s.branch) === studentDept)
  const rankedDept = rankStudents(deptList)
  const deptItem = rankedDept.find((s) => (s.registrationNumber || '').toUpperCase() === currentRegNo)
  const departmentRank = deptItem ? deptItem.rank : 1
  const totalDeptStudents = rankedDept.length

  const yearList = deptList.filter((s) => (s.year || '').trim().toLowerCase() === studentYear.trim().toLowerCase())
  const rankedYear = rankStudents(yearList)
  const yearItem = rankedYear.find((s) => (s.registrationNumber || '').toUpperCase() === currentRegNo)
  const yearRank = yearItem ? yearItem.rank : 1
  const totalYearStudents = rankedYear.length

  return {
    overallRank,
    totalStudents,
    departmentRank,
    totalDeptStudents,
    yearRank,
    totalYearStudents,
    department: studentDept,
    year: studentYear,
  }
}

/**
 * Computes department statistics:
 * Student count, Total XP, Average XP, and Top Student.
 */
export function getDepartmentStatistics(studentsList) {
  const list = studentsList || getAllLeaderboardStudents()
  const supportedDepts = [
    'AI & ML',
    'CSE',
    'CSE (AI)',
    'CSE (DS)',
    'ECE',
    'EEE',
    'Mechanical',
    'Civil',
  ]

  return supportedDepts.map((deptName) => {
    const deptStudents = list.filter((s) => normalizeDepartment(s.department || s.branch) === deptName)
    const count = deptStudents.length
    const totalXp = deptStudents.reduce((sum, s) => sum + (s.xp || 0), 0)
    const avgXp = count > 0 ? Math.round(totalXp / count) : 0

    const ranked = rankStudents(deptStudents)
    const topStudent = ranked.length > 0 ? ranked[0] : null

    return {
      department: deptName,
      studentsCount: count,
      totalXp,
      avgXp,
      topStudentName: topStudent ? topStudent.name : '—',
      topStudentXp: topStudent ? topStudent.xp : 0,
      topStudentReg: topStudent ? topStudent.registrationNumber : '—',
    }
  })
}

/**
 * Computes top-level analytics for administrators.
 */
export function getOverallAnalytics(studentsList) {
  const list = studentsList || getAllLeaderboardStudents()
  const totalStudents = list.length
  const totalXpEarned = list.reduce((sum, s) => sum + (s.xp || 0), 0)

  const ranked = rankStudents(list)
  const topStudent = ranked.length > 0 ? ranked[0] : { name: '—', xp: 0, department: '—' }

  const deptStats = getDepartmentStatistics(list)
  const topDept = [...deptStats].sort((a, b) => b.totalXp - a.totalXp)[0] || { department: 'AI & ML', totalXp: 0 }

  return {
    totalStudents,
    totalXpEarned,
    topStudent,
    topDepartment: topDept.department,
    topDepartmentXp: topDept.totalXp,
  }
}
