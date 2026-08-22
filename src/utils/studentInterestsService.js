export const STUDENT_INTERESTS_STORAGE_KEY = 'campusquest_student_interests'

// Initial baseline student interests data for demonstration and department representation
const INITIAL_STUDENT_INTERESTS = [
  {
    studentId: '24B91A6101',
    studentName: 'Avinash Varma',
    registrationNumber: '24B91A6101',
    branch: 'AI & ML',
    year: '2nd Year',
    interests: ['AI & ML Club', 'SRKR Coding Club', 'Robotics & Automation Society'],
    updatedAt: new Date().toISOString(),
  },
  {
    studentId: '23B91A0502',
    studentName: 'Priya Sharma',
    registrationNumber: '23B91A0502',
    branch: 'CSE',
    year: '3rd Year',
    interests: ['SRKR Coding Club', 'Web Developers Guild', 'Hackathon Sprints'],
    updatedAt: new Date().toISOString(),
  },
  {
    studentId: '22B91A0415',
    studentName: 'Sai Kiran Raju',
    registrationNumber: '22B91A0415',
    branch: 'ECE',
    year: '4th Year',
    interests: ['IoT & Embedded Systems Lab', 'Robotics & Automation Society', 'IEEE Student Chapter'],
    updatedAt: new Date().toISOString(),
  },
  {
    studentId: '24B91A0210',
    studentName: 'Harika Datla',
    registrationNumber: '24B91A0210',
    branch: 'EEE',
    year: '2nd Year',
    interests: ['Renewable Energy Club', 'Electric Vehicle Innovations', 'Srujana Vatika Fine Arts'],
    updatedAt: new Date().toISOString(),
  },
  {
    studentId: '23B91A0318',
    studentName: 'Rahul Varma',
    registrationNumber: '23B91A0318',
    branch: 'Mechanical',
    year: '3rd Year',
    interests: ['CAD & 3D Prototyping Bay', 'Robotics & Automation Society', 'SRKR Sports & Athletics'],
    updatedAt: new Date().toISOString(),
  },
  {
    studentId: '24B91A0105',
    studentName: 'Divya Sri',
    registrationNumber: '24B91A0105',
    branch: 'Civil',
    year: '1st Year',
    interests: ['Green Campus Initiative', 'Srujana Vatika Fine Arts', 'NSS Social Outreach'],
    updatedAt: new Date().toISOString(),
  },
]

/**
 * Safely retrieve all student interests from localStorage
 * Returns an array of student interest objects
 */
export function getAllStudentInterests() {
  try {
    const raw = localStorage.getItem(STUDENT_INTERESTS_STORAGE_KEY)
    if (!raw) {
      // Seed with initial baseline if key does not exist yet
      localStorage.setItem(STUDENT_INTERESTS_STORAGE_KEY, JSON.stringify(INITIAL_STUDENT_INTERESTS))
      return INITIAL_STUDENT_INTERESTS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Error reading student interests:', error)
    return []
  }
}

/**
 * Get interests for a specific student by registration number
 */
export function getStudentInterestsByRegNo(regNo) {
  if (!regNo) return []
  try {
    const all = getAllStudentInterests()
    const found = all.find(
      (item) => item.registrationNumber?.toLowerCase() === String(regNo).toLowerCase()
    )
    return found && Array.isArray(found.interests) ? found.interests : []
  } catch (error) {
    console.error('Error fetching student interest by regNo:', error)
    return []
  }
}

/**
 * Save or update interests for a student in isolated storage
 */
export function saveStudentInterests(student, interestsList) {
  if (!student) return []
  try {
    const all = getAllStudentInterests()
    const regNo = student.registrationNumber || student.regNo || '24B91A6101'
    const name = student.studentName || student.name || 'Student'
    const branch = student.branch || student.department || 'AI & ML'
    const year = student.year || '2nd Year'
    const studentId = student.id ? String(student.id) : regNo

    const existingIdx = all.findIndex(
      (item) => item.registrationNumber?.toLowerCase() === String(regNo).toLowerCase()
    )

    const updatedRecord = {
      studentId,
      studentName: name,
      registrationNumber: regNo,
      branch,
      year,
      interests: Array.isArray(interestsList) ? interestsList : [],
      updatedAt: new Date().toISOString(),
    }

    let updatedAll
    if (existingIdx >= 0) {
      updatedAll = [...all]
      updatedAll[existingIdx] = updatedRecord
    } else {
      updatedAll = [updatedRecord, ...all]
    }

    localStorage.setItem(STUDENT_INTERESTS_STORAGE_KEY, JSON.stringify(updatedAll))
    return updatedRecord.interests
  } catch (error) {
    console.error('Error saving student interests:', error)
    return []
  }
}

/**
 * Toggle a single interest (add/remove) for a student and save
 */
export function toggleStudentInterest(student, interestName) {
  if (!student || !interestName) return []
  try {
    const current = getStudentInterestsByRegNo(student.registrationNumber)
    let updated
    if (current.includes(interestName)) {
      updated = current.filter((item) => item !== interestName)
    } else {
      updated = [...current, interestName]
    }
    return saveStudentInterests(student, updated)
  } catch (error) {
    console.error('Error toggling student interest:', error)
    return []
  }
}
