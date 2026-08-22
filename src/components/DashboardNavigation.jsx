const NAV_ITEMS = [
  { id: null, icon: '🏠', label: 'Home' },
  { id: 'explore', icon: '🧭', label: 'Explore' },
  { id: 'map', icon: '🗺️', label: 'Map' },
  { id: 'scan', icon: '📷', label: 'Scan' },
  { id: 'rank', icon: '🏆', label: 'Leaderboard', mobileLabel: 'Rank' },
  { id: 'badges', icon: '🏅', label: 'Badges' },
  { id: 'profile', icon: '👤', label: 'Profile' },
]

function DashboardNavigation({ activePanel, onNavigate, activeQuests, xpToNextLevel }) {
  const currentPage = activePanel || null
  const desktopItems = NAV_ITEMS
  const mobileItems = NAV_ITEMS.slice(0, 5)

  function renderItem(item, mobile = false) {
    const isActive = currentPage === item.id
    return (
      <button
        className={`app-nav-item${isActive ? ' app-nav-item-active' : ''}${item.id === 'scan' ? ' app-nav-item-scan' : ''}`}
        type="button"
        key={item.label}
        onClick={() => onNavigate(item.id)}
        aria-current={isActive ? 'page' : undefined}
      >
        <span className="app-nav-icon" aria-hidden="true">{item.icon}</span>
        <span className="app-nav-text">{mobile && item.mobileLabel ? item.mobileLabel : item.label}</span>
      </button>
    )
  }

  return (
    <>
      <aside className="app-sidebar">
        <button className="app-sidebar-brand" type="button" onClick={() => onNavigate(null)}>
          <span className="game-logo" aria-hidden="true">CQ</span>
          <div className="brand-text-wrap">
            <span className="brand-title">CAMPUSQUEST</span>
            <span className="brand-sub">SRKR Adventure</span>
          </div>
        </button>

        <nav className="app-nav" aria-label="Main navigation">
          {desktopItems.map((item) => renderItem(item))}
        </nav>

        <div className="app-sidebar-info">
          <div className="sidebar-info-row">
            <span>🔥 Active Quests</span>
            <strong>{activeQuests}</strong>
          </div>
          <div className="sidebar-info-row">
            <span>⚡ XP to Next Level</span>
            <strong>{xpToNextLevel > 0 ? `${xpToNextLevel} XP` : 'MAX'}</strong>
          </div>
        </div>
      </aside>

      <nav className="app-mobile-nav" aria-label="Mobile navigation">
        {mobileItems.map((item) => renderItem(item, true))}
      </nav>
    </>
  )
}

export default DashboardNavigation