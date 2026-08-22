function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function XpHistoryPage({ student, onBack }) {
  const history = Array.isArray(student.xpHistory) ? [...student.xpHistory].reverse() : []

  return (
    <main className="collection-page">
      <header className="collection-header">
        <div className="explore-brand">
          <div className="game-logo" aria-hidden="true">CQ</div>
          <span className="game-name">CAMPUSQUEST</span>
        </div>
        <button className="explore-back" type="button" onClick={onBack}>← Dashboard</button>
      </header>

      <section className="collection-content history-content">
        <div className="collection-intro">
          <p className="kicker"><span></span> PROGRESS TRAIL</p>
          <h1>⚡ XP History</h1>
          <p className="collection-subtitle">Every quest reward earned along your campus exploration.</p>
        </div>

        <div className="history-total-card">
          <div className="total-xp-label-group">
            <span>TOTAL ACCUMULATED XP</span>
            <p>Keep completing quests to reach SRKR Legend!</p>
          </div>
          <strong className="total-xp-val">{Number(student.xp) || 0} XP</strong>
        </div>

        {history.length > 0 ? (
          <div className="history-list">
            {history.map((entry, index) => (
              <article className="history-entry" key={`${entry.questId || entry.questTitle}-${index}`}>
                <span className="history-plus">+{entry.xpGained ?? entry.xp ?? 0} XP</span>
                <div className="history-entry-body">
                  <h2>{entry.questTitle || entry.title || 'Quest reward'}</h2>
                  <p>{formatDate(entry.date)}</p>
                </div>
                <span className="history-id">Quest #{entry.questId ?? '—'}</span>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-history-card">
            <span className="empty-icon">🎯</span>
            <h3>No XP Earned Yet</h3>
            <p>Start your first quest to build your adventure history!</p>
          </div>
        )}
      </section>
    </main>
  )
}

export default XpHistoryPage