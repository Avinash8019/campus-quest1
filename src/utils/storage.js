const STORAGE_KEY = 'campusquestData'
const LAST_NOTIFIED_LEVEL_KEY = 'campusquestLastNotifiedLevel'

export function saveData(data) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    return false
  }

  return true
}

export function loadData() {
  try {
    const savedData = window.localStorage.getItem(STORAGE_KEY)
    if (!savedData) return null

    const parsedData = JSON.parse(savedData)
    if (
      !parsedData ||
      typeof parsedData !== 'object' ||
      Array.isArray(parsedData)
    ) {
      return null
    }

    const studentName = typeof parsedData.studentName === 'string' ? parsedData.studentName.trim() : 'SRKR Student'
    const registrationNumber = typeof parsedData.registrationNumber === 'string' ? parsedData.registrationNumber.trim().toUpperCase() : 'SRKR'
    const email = typeof parsedData.email === 'string' ? parsedData.email.trim().toLowerCase() : ''
    const mobileNumber = typeof parsedData.mobileNumber === 'string' ? parsedData.mobileNumber.trim() : ''
    const branch = typeof parsedData.branch === 'string' ? parsedData.branch.trim() : ''
    const year = typeof parsedData.year === 'string' ? parsedData.year.trim() : ''

    return {
      studentName,
      registrationNumber,
      email,
      mobileNumber,
      branch,
      year,
      isVerified: Boolean(parsedData.isVerified),
      xp: typeof parsedData.xp === 'number' ? parsedData.xp : 0,
      completedQuests: Array.isArray(parsedData.completedQuests) ? parsedData.completedQuests : [],
      badges: Array.isArray(parsedData.badges) ? parsedData.badges : [],
      xpHistory: Array.isArray(parsedData.xpHistory) ? parsedData.xpHistory : [],
      questProgress: parsedData.questProgress && typeof parsedData.questProgress === 'object' && !Array.isArray(parsedData.questProgress) ? parsedData.questProgress : {},
      achievements: Array.isArray(parsedData.achievements) ? parsedData.achievements : [],
      uploadedProofs: parsedData.uploadedProofs && typeof parsedData.uploadedProofs === 'object' && !Array.isArray(parsedData.uploadedProofs) ? parsedData.uploadedProofs : {},
    }
  } catch {
    return null
  }
}

export function saveLastNotifiedLevel(level) {
  try {
    window.localStorage.setItem(LAST_NOTIFIED_LEVEL_KEY, String(level))
  } catch {
    return false
  }

  return true
}

export function loadLastNotifiedLevel(defaultLevel) {
  try {
    const savedLevel = Number(window.localStorage.getItem(LAST_NOTIFIED_LEVEL_KEY))
    return Number.isFinite(savedLevel) && savedLevel > 0 ? savedLevel : defaultLevel
  } catch {
    return defaultLevel
  }
}