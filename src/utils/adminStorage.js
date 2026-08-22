import initialQuests from '../data/quests.js'
import initialEvents from '../data/srkrEvents.js'
import initialClubs from '../data/srkrClubs.js'
import initialFacilities from '../data/srkrFacilities.js'

export const ADMIN_QUESTS_KEY = 'campusquest_admin_quests'
export const ADMIN_EVENTS_KEY = 'campusquest_admin_events'
export const ADMIN_CLUBS_KEY = 'campusquest_admin_clubs'
export const ADMIN_FACILITIES_KEY = 'campusquest_admin_facilities'

export function getStoredQuests() {
  try {
    const raw = localStorage.getItem(ADMIN_QUESTS_KEY)
    if (!raw) return initialQuests
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return initialQuests

    // Merge missing quests and sync updated step fields
    const parsedMap = new Map(parsed.map((q) => [q.id, q]))
    const merged = initialQuests.map((initQ) => {
      const existing = parsedMap.get(initQ.id)
      if (!existing) return initQ
      return {
        ...initQ,
        ...existing,
        step1Question: initQ.step1Question || existing.step1Question,
        choices: initQ.choices || existing.choices,
        question: initQ.question || existing.question,
        options: initQ.options || existing.options,
        correctAnswer: initQ.correctAnswer || existing.correctAnswer,
        step3Image: initQ.step3Image || existing.step3Image,
        step3Question: initQ.step3Question || existing.step3Question,
        step3Options: initQ.step3Options || existing.step3Options,
        step3CorrectAnswer: initQ.step3CorrectAnswer || existing.step3CorrectAnswer,
        qrId: existing.qrId || initQ.qrId,
        verificationCode: existing.verificationCode || initQ.verificationCode,
      }
    })
    try {
      localStorage.setItem(ADMIN_QUESTS_KEY, JSON.stringify(merged))
    } catch {}
    return merged
  } catch {
    return initialQuests
  }
}

export function getStoredEvents() {
  try {
    const raw = localStorage.getItem(ADMIN_EVENTS_KEY)
    return raw ? JSON.parse(raw) : initialEvents
  } catch {
    return initialEvents
  }
}

export function getStoredClubs() {
  try {
    const raw = localStorage.getItem(ADMIN_CLUBS_KEY)
    return raw ? JSON.parse(raw) : initialClubs
  } catch {
    return initialClubs
  }
}

export function getStoredFacilities() {
  try {
    const raw = localStorage.getItem(ADMIN_FACILITIES_KEY)
    return raw ? JSON.parse(raw) : initialFacilities
  } catch {
    return initialFacilities
  }
}
