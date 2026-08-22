import { GAME_ACHIEVEMENTS } from '../utils/gameLevels.js'
import quests from '../data/quests.js'

function CollectionPage({ student }) {
  const completedQuests = Array.isArray(student?.completedQuests) ? student.completedQuests : []

  return (
    <main className="clean-rewards-page" aria-label="Badges & Achievements">
      <header className="clean-page-header">
        <div>
          <span className="clean-kicker">EXPLORER MILESTONES</span>
          <h1>Badges & Achievements</h1>
          <p className="page-subtitle">
            Collect special milestones and badges as you explore the SRKR campus!
          </p>
        </div>
      </header>

      {/* MAJOR ACHIEVEMENTS */}
      <section className="rewards-section-block">
        <h2 className="section-title">Major Achievements</h2>
        <div className="achievements-cards-grid">
          {GAME_ACHIEVEMENTS.map((ach) => {
            const isUnlocked = ach.check(student)
            return (
              <div
                key={ach.id}
                className={`clean-card achievement-card-item${isUnlocked ? ' unlocked' : ' locked'}`}
              >
                <div className="ach-icon">{ach.icon}</div>
                <div className="ach-body">
                  <div className="ach-top-line">
                    <h3>{ach.title}</h3>
                    <span className={`ach-status-badge ${isUnlocked ? 'done' : 'locked'}`}>
                      {isUnlocked ? '✓ Unlocked' : 'Locked'}
                    </span>
                  </div>
                  <p>{ach.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* QUEST BADGES */}
      <section className="rewards-section-block">
        <h2 className="section-title">Quest Badges ({completedQuests.length} / {quests.length})</h2>
        <div className="badges-cards-grid">
          {quests.map((quest) => {
            const isUnlocked = completedQuests.some((id) => Number(id) === quest.id)
            return (
              <div
                key={quest.id}
                className={`clean-card badge-item-card${isUnlocked ? ' unlocked' : ' locked'}`}
              >
                <div className="badge-icon-wrap">
                  <span>{isUnlocked ? '🏅' : '🔒'}</span>
                </div>
                <div className="badge-body">
                  <span className="badge-quest-label">{quest.title}</span>
                  <h3>{quest.badge}</h3>
                  <span className={`badge-pill ${isUnlocked ? 'done' : 'locked'}`}>
                    {isUnlocked ? '✓ Unlocked' : 'Locked'}
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

export default CollectionPage
