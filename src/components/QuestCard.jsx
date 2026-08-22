function QuestCard({ quest, status, onOpen }) {
  const statusLabels = {
    available: 'Start Quest →',
    active: 'Continue Quest →',
    completed: 'Review Quest ✓',
    locked: 'Locked 🔒',
  }

  const difficultyClass = {
    Easy: 'diff-easy',
    Medium: 'diff-medium',
    Hard: 'diff-hard',
  }[quest.difficulty] || 'diff-easy'

  return (
    <button
      className={`quest-card quest-card-${status}`}
      type="button"
      onClick={onOpen}
      disabled={status === 'locked'}
    >
      <div className="quest-card-topline">
        <span className="quest-title">{quest.title || `Quest ${quest.id}`}</span>
        <span className={`quest-status-badge quest-status-${status}`}>
          {status === 'completed' ? '✓ Done' : status === 'active' ? '⚡ Active' : 'Available'}
        </span>
      </div>

      <div className="quest-clue-wrapper">
        <span className="quest-location-tag">📍 Explore the campus</span>
        <p className="quest-clue">"{quest.locationClue}"</p>
      </div>

      <div className="quest-meta">
        <span className="quest-xp-badge">+{quest.xp} XP</span>
        <span className={`quest-diff-badge ${difficultyClass}`}>{quest.difficulty}</span>
      </div>

      <div className="quest-card-action">
        <span>{statusLabels[status]}</span>
      </div>
    </button>
  )
}

export default QuestCard