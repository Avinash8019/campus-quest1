import quests from '../data/quests.js'

function BadgesPage({ student, onBack, onOpenAchievements }) {
  const completedQuests = Array.isArray(student.completedQuests) ? student.completedQuests : []

  return (
    <main className="collection-page">
      <header className="collection-header">
        <div className="explore-brand">
          <div className="game-logo" aria-hidden="true">CQ</div>
          <span className="game-name">CAMPUSQUEST</span>
        </div>
        <div className="collection-actions">
          <button className="collection-tab collection-tab-active" type="button">🏅 Badges ({completedQuests.length}/12)</button>
          <button className="collection-tab" type="button" onClick={onOpenAchievements}>🌱 Achievements</button>
          <button className="explore-back" type="button" onClick={onBack}>← Dashboard</button>
        </div>
      </header>

      <section className="collection-content">
        <div className="collection-intro">
          <p className="kicker"><span></span> BADGE SHOWCASE</p>
          <h1>🏅 Quest Badges</h1>
          <p className="collection-subtitle">Unlock all 12 special explorer badges by completing campus quests!</p>
        </div>

        <div className="badge-grid">
          {quests.map((quest) => {
            const unlocked = completedQuests.some((id) => String(id) === String(quest.id))
            return (
              <article className={`badge-card${unlocked ? ' badge-card-unlocked' : ''}`} key={quest.id}>
                <div className="badge-emblem">
                  {unlocked ? '🏅' : '🔒'}
                </div>
                <div className="badge-details">
                  <span className="badge-card-status">{unlocked ? '✓ Unlocked' : 'Locked'}</span>
                  <h2>{quest.badge}</h2>
                  <p>Earned from {quest.title} (+{quest.xp} XP)</p>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

export default BadgesPage