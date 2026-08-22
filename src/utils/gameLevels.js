export const GAME_LEVELS = [
  { level: 1, name: 'Novice Explorer', minXp: 0, maxXp: 200, icon: '🌱' },
  { level: 2, name: 'Campus Scout', minXp: 200, maxXp: 450, icon: '🧭' },
  { level: 3, name: 'Path Finder', minXp: 450, maxXp: 750, icon: '⭐' },
  { level: 4, name: 'Campus Adventurer', minXp: 750, maxXp: 1100, icon: '🛡️' },
  { level: 5, name: 'Master Explorer', minXp: 1100, maxXp: 1500, icon: '⚔️' },
  { level: 6, name: 'SRKR Champion', minXp: 1500, maxXp: 2000, icon: '🏆' },
  { level: 7, name: 'SRKR Legend', minXp: 2000, maxXp: 99999, icon: '👑' },
]

export function getPlayerLevel(xp) {
  const currentXp = Math.max(0, Number(xp) || 0)
  for (let i = GAME_LEVELS.length - 1; i >= 0; i--) {
    if (currentXp >= GAME_LEVELS[i].minXp) {
      return GAME_LEVELS[i]
    }
  }
  return GAME_LEVELS[0]
}

export function getLevelProgress(xp) {
  const currentXp = Math.max(0, Number(xp) || 0)
  const currentLevel = getPlayerLevel(currentXp)
  if (currentLevel.level === GAME_LEVELS[GAME_LEVELS.length - 1].level) {
    return {
      percent: 100,
      xpInCurrentLevel: currentXp - currentLevel.minXp,
      xpNeededForNext: 0,
      nextLevelXp: currentXp,
    }
  }

  const range = currentLevel.maxXp - currentLevel.minXp
  const gained = currentXp - currentLevel.minXp
  const percent = Math.min(100, Math.max(0, Math.round((gained / range) * 100)))

  return {
    percent,
    xpInCurrentLevel: gained,
    xpNeededForNext: currentLevel.maxXp - currentXp,
    nextLevelXp: currentLevel.maxXp,
  }
}

export function getGemsCount(student) {
  const completedCount = Array.isArray(student?.completedQuests) ? student.completedQuests.length : 0
  const xp = Math.max(0, Number(student?.xp) || 0)
  return Math.floor(xp / 25) + completedCount * 5
}

export function isQuestUnlocked(questId, completedQuests = []) {
  const qId = Number(questId)
  if (qId === 1) return true
  const prevId = qId - 1
  return completedQuests.some((id) => Number(id) === prevId)
}

export function getQuestStatus(quest, student) {
  const completed = Array.isArray(student?.completedQuests) ? student.completedQuests : []
  if (completed.some((id) => Number(id) === Number(quest.id))) return 'completed'
  if (isQuestUnlocked(quest.id, completed)) return 'available'
  return 'locked'
}

export const DEMO_LEADERBOARD_SCORES = [850, 720, 650, 520, 480, 350, 280]

export function getLeaderboardRank(student) {
  const xp = Math.max(0, Number(student?.xp) || 0)
  const scores = [...DEMO_LEADERBOARD_SCORES, xp].sort((a, b) => b - a)
  const index = scores.indexOf(xp)
  return index + 1
}

export const GAME_ACHIEVEMENTS = [
  {
    id: 'first_quest',
    title: 'First Quest',
    icon: '🏆',
    description: 'Complete your first campus quest.',
    check: (student) => (student.completedQuests?.length || 0) >= 1,
  },
  {
    id: 'campus_explorer',
    title: 'Campus Explorer',
    icon: '🗺️',
    description: 'Discover and complete 5 campus locations.',
    check: (student) => (student.completedQuests?.length || 0) >= 5,
  },
  {
    id: 'field_investigator',
    title: 'Field Investigator',
    icon: '📷',
    description: 'Complete photo verification at 3 quest places.',
    check: (student) => Object.keys(student.uploadedProofs || {}).length >= 3,
  },
  {
    id: 'qr_hunter',
    title: 'QR Hunter',
    icon: '🔳',
    description: 'Scan and verify 5 quest location QR codes.',
    check: (student) => (student.completedQuests?.length || 0) >= 5,
  },
  {
    id: 'campus_master',
    title: 'Campus Master',
    icon: '⭐',
    description: 'Complete all 12 available campus quests.',
    check: (student) => (student.completedQuests?.length || 0) >= 12,
  },
]
