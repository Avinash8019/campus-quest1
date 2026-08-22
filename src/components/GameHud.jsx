import { getPlayerLevel, getLevelProgress, getGemsCount } from '../utils/gameLevels.js'

function GameHud({ student, activeTab, onSelectTab, onOpenQuest, onLogout }) {
  const xp = Math.max(0, Number(student?.xp) || 0)
  const level = getPlayerLevel(xp)
  const levelProgress = getLevelProgress(xp)
  const gems = getGemsCount(student)

  const navTabs = [
    { id: 'home', label: 'HOME', icon: '🏠' },
    { id: 'quests', label: 'QUESTS', icon: '🗺️' },
    { id: 'leaderboard', label: 'LEADERBOARD', icon: '🏆' },
    { id: 'rewards', label: 'REWARDS', icon: '🎁' },
    { id: 'guide', label: 'CAMPUS GUIDE', icon: '📚' },
    { id: 'profile', label: 'PROFILE', icon: '👤' },
  ]

  const avatarInitial = student?.studentName ? student.studentName.charAt(0).toUpperCase() : 'S'

  return (
    <header className="game-hud" aria-label="Player Game HUD">
      <div className="game-hud-inner">
        {/* LEFT: PLAYER PROFILE & XP BAR */}
        <div className="hud-player-section" onClick={() => onSelectTab('profile')} title="View Explorer Profile">
          <div className="hud-avatar-frame">
            <div className="hud-avatar-circle">{avatarInitial}</div>
            <span className="hud-level-badge">{level.level}</span>
          </div>

          <div className="hud-player-info">
            <div className="hud-name-row">
              <span className="hud-player-name">{student?.studentName || 'SRKR Student'}</span>
              <span className="hud-verified-tag">✓ Verified</span>
            </div>
            <span className="hud-player-email">{student?.email || 'student@srkrec.ac.in'}</span>

            <div className="hud-xp-bar-wrap">
              <div className="hud-xp-bar-track">
                <div
                  className="hud-xp-bar-fill"
                  style={{ width: `${levelProgress.percent}%` }}
                />
              </div>
              <span className="hud-xp-bar-text">
                {xp} / {levelProgress.nextLevelXp} XP
              </span>
            </div>
          </div>
        </div>

        {/* CENTER / RIGHT: CURRENCIES & NAV TABS */}
        <div className="hud-right-section">
          {/* GAME CURRENCIES */}
          <div className="hud-stats-group">
            <div className="hud-currency-chip xp-chip" title="Total Experience Points">
              <span className="chip-icon">⭐</span>
              <strong>{xp} XP</strong>
            </div>

            <div className="hud-currency-chip gem-chip" title="Adventure Gems">
              <span className="chip-icon">💎</span>
              <strong>{gems}</strong>
            </div>
          </div>

          {/* GAME NAVIGATION TABS */}
          <nav className="hud-nav-tabs" aria-label="Game navigation">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`hud-tab-btn${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => onSelectTab(tab.id)}
              >
                <span className="hud-tab-icon">{tab.icon}</span>
                <span className="hud-tab-label">{tab.label}</span>
              </button>
            ))}

            {onLogout && (
              <button
                type="button"
                className="hud-tab-btn hud-logout-tab-btn"
                onClick={onLogout}
                title="Switch Account or Return to Login"
              >
                <span className="hud-tab-icon">🚪</span>
                <span className="hud-tab-label">LOGOUT</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default GameHud
