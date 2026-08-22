import ProgressBar from './ProgressBar.jsx'

function LevelCard({ level, xp, xpNeeded, progress, onOpen }) {
  const nextMinXp = level.number < 7 ? (level.number === 1 ? 200 : level.number === 2 ? 400 : level.number === 3 ? 700 : level.number === 4 ? 1000 : level.number === 5 ? 1500 : 2000) : 2000

  return (
    <button className="level-card" type="button" onClick={onOpen} aria-label={`Level ${level.number} details`}>
      <div className="level-card-header">
        <div className="level-tag">
          <span className="level-badge-icon">{level.icon}</span>
          <span className="level-number-text">LEVEL {level.number}</span>
        </div>
        <span className="level-card-open-hint">Level Journey →</span>
      </div>

      <div className="level-card-main">
        <h2 className="level-rank-title">{level.name}</h2>
        <div className="level-xp-stat">
          <strong>{xp}</strong> <span className="level-xp-target">/ {level.number >= 7 ? 'MAX XP' : `${nextMinXp} XP`}</span>
        </div>
      </div>

      <div className="level-progress-wrapper">
        <ProgressBar value={progress} label="Level XP Progress" />
      </div>

      <div className="level-card-footer">
        <span>{xpNeeded > 0 ? `⚡ ${xpNeeded} XP needed to reach next rank` : '👑 Maximum Rank Achieved!'}</span>
        <span className="level-tap-cta">Tap to view rank map</span>
      </div>
    </button>
  )
}

export default LevelCard