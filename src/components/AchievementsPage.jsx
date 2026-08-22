import quests from '../data/quests.js'

const ACHIEVEMENTS = [
  { icon: '🌱', name: 'First Steps', requirement: 'Complete 1 quest', unlocked: (student, counts) => counts.completed >= 1 },
  { icon: '🔥', name: 'Quest Starter', requirement: 'Complete 3 quests', unlocked: (student, counts) => counts.completed >= 3 },
  { icon: '🧭', name: 'Campus Explorer', requirement: 'Complete 5 quests', unlocked: (student, counts) => counts.completed >= 5 },
  { icon: '📷', name: 'QR Hunter', requirement: 'Complete 3 QR quests', unlocked: (student, counts) => counts.completedQr >= 3 },
  { icon: '🧠', name: 'Knowledge Master', requirement: 'Complete all quiz quests', unlocked: (student, counts) => counts.quizCount > 0 && counts.completedQuiz === counts.quizCount },
  { icon: '⚡', name: 'XP Hunter', requirement: 'Earn 500 XP', unlocked: (student) => (Number(student.xp) || 0) >= 500 },
  { icon: '👑', name: 'SRKR Legend', requirement: 'Reach Level 7', unlocked: (student) => (Number(student.xp) || 0) >= 2000 },
]

function AchievementsPage({ student, onBack, onOpenBadges }) {
  const completedQuests = Array.isArray(student.completedQuests) ? student.completedQuests : []
  const completedIds = new Set(completedQuests.map((id) => String(id)))
  const quizQuests = quests.filter((quest) => ['quiz', 'quiz-only'].includes(String(quest.verificationType || quest.type).toLowerCase()))
  const qrQuests = quests.filter((quest) => String(quest.verificationType || quest.type).toLowerCase().includes('qr'))
  const counts = {
    completed: completedIds.size,
    completedQr: qrQuests.filter((quest) => completedIds.has(String(quest.id))).length,
    quizCount: quizQuests.length,
    completedQuiz: quizQuests.filter((quest) => completedIds.has(String(quest.id))).length,
  }

  const unlockedCount = ACHIEVEMENTS.filter((ach) => ach.unlocked(student, counts)).length

  return (
    <main className="collection-page">
      <header className="collection-header">
        <div className="explore-brand">
          <div className="game-logo" aria-hidden="true">CQ</div>
          <span className="game-name">CAMPUSQUEST</span>
        </div>
        <div className="collection-actions">
          <button className="collection-tab" type="button" onClick={onOpenBadges}>🏅 Badges</button>
          <button className="collection-tab collection-tab-active" type="button">🌱 Achievements ({unlockedCount}/{ACHIEVEMENTS.length})</button>
          <button className="explore-back" type="button" onClick={onBack}>← Dashboard</button>
        </div>
      </header>

      <section className="collection-content">
        <div className="collection-intro">
          <p className="kicker"><span></span> EXPLORER MILESTONES</p>
          <h1>🌱 Achievements</h1>
          <p className="collection-subtitle">Reach milestones across your campus quests, XP earnings, and discoveries.</p>
        </div>

        <div className="achievement-list">
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = achievement.unlocked(student, counts)
            return (
              <article
                className={`achievement-card${unlocked ? ' achievement-card-unlocked' : ''}`}
                key={achievement.name}
              >
                <span className="achievement-icon">{unlocked ? achievement.icon : '🔒'}</span>
                <div className="achievement-details">
                  <h2>{achievement.name}</h2>
                  <p>{achievement.requirement}</p>
                </div>
                <strong className={`achievement-status-tag ${unlocked ? 'unlocked' : 'locked'}`}>
                  {unlocked ? '✓ UNLOCKED' : 'LOCKED'}
                </strong>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

export default AchievementsPage