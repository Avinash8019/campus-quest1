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

// Baseline cohort of SRKR students representing diverse departments and years
const BASELINE_STUDENTS = [
  {
    id: 'st-01',
    name: 'Rahul Varma',
    registrationNumber: '24B91A6142',
    email: 'rahul.varma@srkrec.ac.in',
    branch: 'AI & ML',
    department: 'AI & ML',
    year: '2nd Year',
    xp: 975,
    completedQuests: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  {
    id: 'st-02',
    name: 'Priya Sharma',
    registrationNumber: '24B91A0588',
    email: 'priya.sharma@srkrec.ac.in',
    branch: 'CSE',
    department: 'CSE',
    year: '2nd Year',
    xp: 925,
    completedQuests: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    id: 'st-03',
    name: 'Arjun Raju',
    registrationNumber: '23B91A0452',
    email: 'arjun.raju@srkrec.ac.in',
    branch: 'ECE',
    department: 'ECE',
    year: '3rd Year',
    xp: 850,
    completedQuests: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    id: 'st-04',
    name: 'Sai Kiran',
    registrationNumber: '25B91A6115',
    email: 'sai.kiran@srkrec.ac.in',
    branch: 'AI & ML',
    department: 'AI & ML',
    year: '1st Year',
    xp: 800,
    completedQuests: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 'st-05',
    name: 'Kavya Sree',
    registrationNumber: '24B91A6209',
    email: 'kavya.sree@srkrec.ac.in',
    branch: 'CSE (AI)',
    department: 'CSE (AI)',
    year: '2nd Year',
    xp: 750,
    completedQuests: [1, 2, 3, 4, 5],
  },
  {
    id: 'st-06',
    name: 'Bhavya Reddy',
    registrationNumber: '25B91A6340',
    email: 'bhavya.reddy@srkrec.ac.in',
    branch: 'CSE (DS)',
    department: 'CSE (DS)',
    year: '1st Year',
    xp: 725,
    completedQuests: [1, 2, 3, 4],
  },
  {
    id: 'st-07',
    name: 'Dinesh Kumar',
    registrationNumber: '23B91A0218',
    email: 'dinesh.kumar@srkrec.ac.in',
    branch: 'EEE',
    department: 'EEE',
    year: '3rd Year',
    xp: 675,
    completedQuests: [1, 2, 3, 8],
  },
  {
    id: 'st-08',
    name: 'Manoj Krishna',
    registrationNumber: '22B91A0361',
    email: 'manoj.krishna@srkrec.ac.in',
    branch: 'Mechanical',
    department: 'Mechanical',
    year: '4th Year',
    xp: 650,
    completedQuests: [1, 5, 6, 9],
  },
  {
    id: 'st-09',
    name: 'Ananya Chowdary',
    registrationNumber: '25B91A0112',
    email: 'ananya.c@srkrec.ac.in',
    branch: 'Civil',
    department: 'Civil',
    year: '1st Year',
    xp: 575,
    completedQuests: [1, 2, 6],
  },
  {
    id: 'st-10',
    name: 'Varun Teja',
    registrationNumber: '24B91A05M4',
    email: 'varun.teja@srkrec.ac.in',
    branch: 'CSE',
    department: 'CSE',
    year: '2nd Year',
    xp: 550,
    completedQuests: [1, 2, 3],
  },
  {
    id: 'st-11',
    name: 'Harsha Vardhan',
    registrationNumber: '25B91A6133',
    email: 'harsha.v@srkrec.ac.in',
    branch: 'AI & ML',
    department: 'AI & ML',
    year: '1st Year',
    xp: 500,
    completedQuests: [1, 2, 4],
  },
  {
    id: 'st-12',
    name: 'Divya Sri',
    registrationNumber: '23B91A0489',
    email: 'divya.sri@srkrec.ac.in',
    branch: 'ECE',
    department: 'ECE',
    year: '3rd Year',
    xp: 475,
    completedQuests: [1, 5],
  },
  {
    id: 'st-13',
    name: 'Sneha Latha',
    registrationNumber: '24B91A6245',
    email: 'sneha.latha@srkrec.ac.in',
    branch: 'CSE (AI)',
    department: 'CSE (AI)',
    year: '2nd Year',
    xp: 450,
    completedQuests: [1, 3],
  },
  {
    id: 'st-14',
    name: 'Rajesh Goud',
    registrationNumber: '22B91A0234',
    email: 'rajesh.goud@srkrec.ac.in',
    branch: 'EEE',
    department: 'EEE',
    year: '4th Year',
    xp: 400,
    completedQuests: [8],
  },
  {
    id: 'st-15',
    name: 'Nikhil Routhu',
    registrationNumber: '25B91A0311',
    email: 'nikhil.r@srkrec.ac.in',
    branch: 'Mechanical',
    department: 'Mechanical',
    year: '1st Year',
    xp: 350,
    completedQuests: [9],
  },
]

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
 * Retrieves all students by merging baseline cohort, registered users, and active student.
 */
export function getAllLeaderboardStudents(currentStudent = null) {
  const map = new Map()

  // 1. Add baseline cohort
  BASELINE_STUDENTS.forEach((st) => {
    map.set(st.registrationNumber.toUpperCase(), {
      ...st,
      department: normalizeDepartment(st.branch || st.department),
      branch: normalizeDepartment(st.branch || st.department),
    })
  })

  // 2. Add registered students from localStorage
  try {
    const raw = localStorage.getItem('campusquest_registered_students')
    if (raw) {
      const registered = JSON.parse(raw)
      if (Array.isArray(registered)) {
        registered.forEach((st) => {
          const regNo = (st.registrationNumber || '').trim().toUpperCase()
          if (regNo) {
            const existing = map.get(regNo) || {}
            map.set(regNo, {
              ...existing,
              ...st,
              id: st.id || regNo,
              name: st.name || st.studentName || existing.name || 'SRKR Student',
              registrationNumber: regNo,
              email: st.email || existing.email || `${regNo.toLowerCase()}@srkrec.ac.in`,
              branch: normalizeDepartment(st.branch || existing.branch),
              department: normalizeDepartment(st.branch || existing.department),
              year: st.year || existing.year || '1st Year',
              xp: typeof st.xp === 'number' ? st.xp : (existing.xp || 0),
            })
          }
        })
      }
    }
  } catch {
    // Ignore storage issues
  }

  // 3. Merge active current student
  if (currentStudent && currentStudent.registrationNumber) {
    const regNo = currentStudent.registrationNumber.trim().toUpperCase()
    const activeXp = Math.max(0, Number(currentStudent.xp) || 0)
    const existing = map.get(regNo) || {}

    map.set(regNo, {
      ...existing,
      ...currentStudent,
      id: currentStudent.id || regNo,
      name: currentStudent.studentName || currentStudent.name || existing.name || 'SRKR Student',
      registrationNumber: regNo,
      email: currentStudent.email || existing.email || `${regNo.toLowerCase()}@srkrec.ac.in`,
      branch: normalizeDepartment(currentStudent.branch || existing.branch || 'CSE'),
      department: normalizeDepartment(currentStudent.branch || existing.department || 'CSE'),
      year: currentStudent.year || existing.year || '2nd Year',
      xp: activeXp,
      isCurrentUser: true,
    })
  }

  return Array.from(map.values())
}

/**
 * Standard competitive ranking with tie-handling.
 * Students with identical XP share the same rank.
 */
export function rankStudents(studentsList) {
  if (!Array.isArray(studentsList) || studentsList.length === 0) {
    return []
  }

  // Sort descending by XP, then alphabetical by name
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
export function getStudentRanks(currentStudent) {
  const all = getAllLeaderboardStudents(currentStudent)
  const currentRegNo = (currentStudent?.registrationNumber || '').trim().toUpperCase()
  const studentDept = normalizeDepartment(currentStudent?.branch || currentStudent?.department || 'CSE')
  const studentYear = currentStudent?.year || '2nd Year'

  // 1. Overall Ranked
  const rankedOverall = rankStudents(all)
  const overallItem = rankedOverall.find((s) => s.registrationNumber.toUpperCase() === currentRegNo)
  const overallRank = overallItem ? overallItem.rank : 1
  const totalStudents = rankedOverall.length

  // 2. Department Ranked
  const deptList = all.filter((s) => normalizeDepartment(s.department || s.branch) === studentDept)
  const rankedDept = rankStudents(deptList)
  const deptItem = rankedDept.find((s) => s.registrationNumber.toUpperCase() === currentRegNo)
  const departmentRank = deptItem ? deptItem.rank : 1
  const totalDeptStudents = rankedDept.length

  // 3. Department + Year Ranked
  const yearList = deptList.filter((s) => (s.year || '').trim().toLowerCase() === studentYear.trim().toLowerCase())
  const rankedYear = rankStudents(yearList)
  const yearItem = rankedYear.find((s) => s.registrationNumber.toUpperCase() === currentRegNo)
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

  // Top Student
  const ranked = rankStudents(list)
  const topStudent = ranked.length > 0 ? ranked[0] : { name: '—', xp: 0, department: '—' }

  // Top Department by Total XP
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
