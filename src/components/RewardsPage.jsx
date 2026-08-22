import { GAME_ACHIEVEMENTS } from '../utils/gameLevels.js'
import quests from '../data/quests.js'

function RewardsPage({ student, onBack }) {
  const completedQuests = Array.isArray(student?.completedQuests) ? student.completedQuests : []
  const earnedBadges = Array.isArray(student?.badges) ? student.badges : []

  return (
    <main className="game-rewards-page" aria-label="Rewards & Achievements">
      <header className="rewards-header-bar">
        <div>
          <div className="game-kicker">EXPLORER TROPHIES</div>
          <h1>🎁 REWARDS & ACHIEVEMENTS</h1>
          <p className="rewards-sub">
            Collect special trophies, badges, and milestones as you conquer the SRKR campus!
          </p>
        </div>
        <div className="rewards-counters-pill">
          <span>🏆 {GAME_ACHIEVEMENTS.filter((a) => a.check(student)).length} / {GAME_ACHIEVEMENTS.length} Achievements</span>
        </div>
      </header>

      {/* ACHIEVEMENTS SECTION */}
      <section className="rewards-section">
        <h2 className="section-title">⭐ Major Achievements</h2>

        <div className="achievements-grid">
          {GAME_ACHIEVEMENTS.map((ach) => {
            const isUnlocked = ach.check(student)
            return (
              <div
                key={ach.id}
                className={`achievement-card${isUnlocked ? ' unlocked' : ' locked'}`}
              >
                <div className="achievement-icon-circle">{ach.icon}</div>
                <div className="achievement-body">
                  <div className="achievement-top-row">
                    <h3>{ach.title}</h3>
                    <span className={`ach-status-tag ${isUnlocked ? 'tag-unlocked' : 'tag-locked'}`}>
                      {isUnlocked ? '✓ UNLOCKED' : '🔒 LOCKED'}
                    </span>
                  </div>
                  <p>{ach.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* BADGES COLLECTION */}
      <section className="rewards-section">
        <h2 className="section-title">🏅 Quest Badges ({completedQuests.length} / {quests.length})</h2>

        <div className="badges-grid">
          {quests.map((quest) => {
            const isUnlocked = completedQuests.some((id) => Number(id) === quest.id)
            return (
              <div
                key={quest.id}
                className={`badge-card-item${isUnlocked ? ' badge-unlocked' : ' badge-locked'}`}
              >
                <div className="badge-emblem-wrap">
                  <span className="badge-symbol">{isUnlocked ? '🏅' : '🔒'}</span>
                </div>
                <div className="badge-item-body">
                  <span className="badge-quest-ref">{quest.title}</span>
                  <h3>{quest.badge}</h3>
                  <span className={`badge-status-pill ${isUnlocked ? 'done' : 'locked'}`}>
                    {isUnlocked ? '✓ Unlocked' : '🔒 Locked'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}

export default RewardsPage
