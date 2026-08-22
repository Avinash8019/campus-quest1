import { useState } from 'react'
import quests from '../data/quests.js'
import { isQuestUnlocked, getPlayerLevel, getLevelProgress } from '../utils/gameLevels.js'

function CampusAdventureMap({ student, onSelectQuest, onNavigateTab }) {
  const [activePopupQuest, setActivePopupQuest] = useState(null)

  const completedQuests = Array.isArray(student?.completedQuests) ? student.completedQuests : []
  const xp = Math.max(0, Number(student?.xp) || 0)
  const currentLevel = getPlayerLevel(xp)
  const levelProgress = getLevelProgress(xp)

  // Find next uncompleted quest
  const currentActiveQuest = quests.find((q) => isQuestUnlocked(q.id, completedQuests) && !completedQuests.includes(q.id)) || quests[0]

  // Construct SVG path points through all quest coordinates
  const svgPathPoints = quests
    .map((q, index) => `${index === 0 ? 'M' : 'L'} ${q.mapX * 10} ${q.mapY * 6}`)
    .join(' ')

  // Construct unlocked segment path
  const unlockedQuests = quests.filter((q) => isQuestUnlocked(q.id, completedQuests))
  const svgUnlockedPathPoints = unlockedQuests
    .map((q, index) => `${index === 0 ? 'M' : 'L'} ${q.mapX * 10} ${q.mapY * 6}`)
    .join(' ')

  function handleMarkerClick(quest) {
    const unlocked = isQuestUnlocked(quest.id, completedQuests)
    if (unlocked) {
      onSelectQuest(quest)
    } else {
      setActivePopupQuest(quest)
    }
  }

  return (
    <main className="adventure-world-page" aria-label="SRKR Campus Adventure World Map">
      {/* MAP HERO BANNER */}
      <section className="adventure-hero-banner">
        <div className="hero-text-block">
          <div className="hero-kicker-tag">
            <span>🎮 CAMPUS ADVENTURE MAP</span>
          </div>
          <h1>EXPLORE SRKR • LEVEL UP YOUR JOURNEY</h1>
          <p className="hero-subtitle">
            Follow the adventure trail across the SRKR campus, solve mystery clues, scan QR codes, and earn XP to unlock new quests!
          </p>
        </div>

        {/* ACTIVE QUEST FAST-ACTION CARD */}
        <div className="hero-active-quest-card">
          <div className="active-card-top">
            <span className="active-quest-label">⚡ CURRENT MISSION</span>
            <span className="active-quest-xp">+{currentActiveQuest.xp} XP</span>
          </div>
          <h3>{currentActiveQuest.title}</h3>
          <p className="active-quest-clue">"{currentActiveQuest.clue}"</p>
          <button
            className="game-primary-btn active-quest-start-btn"
            type="button"
            onClick={() => onSelectQuest(currentActiveQuest)}
          >
            ▶ START ADVENTURE
          </button>
        </div>
      </section>

      {/* ILLUSTRATED CAMPUS ADVENTURE MAP */}
      <section className="campus-map-world-container" aria-label="Interactive Campus Map">
        <div className="world-map-frame">
          {/* SVG Canvas for glowing trails */}
          <svg className="world-map-svg" viewBox="0 0 1000 600" preserveAspectRatio="none">
            <defs>
              <linearGradient id="unlockedTrailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
              <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base locked trail path */}
            <path
              d={svgPathPoints}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="5"
              strokeDasharray="8 6"
              className="map-base-trail"
            />

            {/* Glowing unlocked trail path */}
            {svgUnlockedPathPoints && (
              <path
                d={svgUnlockedPathPoints}
                fill="none"
                stroke="url(#unlockedTrailGradient)"
                strokeWidth="7"
                filter="url(#glowEffect)"
                className="map-unlocked-glow-trail"
              />
            )}
          </svg>

          {/* CAMPUS VISUAL LANDMARKS (ILLUSTRATED ZONES) */}
          <div className="campus-landmarks-layer" aria-hidden="true">
            <div className="landmark-tag tag-arch" style={{ left: '84%', top: '12%' }}>
              🏛️ Main Arch Gate
            </div>
            <div className="landmark-tag tag-sac" style={{ left: '62%', top: '16%' }}>
              👥 Student Activity Centre
            </div>
            <div className="landmark-tag tag-canteen" style={{ left: '38%', top: '20%' }}>
              🍔 Campus Canteen
            </div>
            <div className="landmark-tag tag-sports" style={{ left: '20%', top: '28%' }}>
              🏀 Sports Complex
            </div>
            <div className="landmark-tag tag-eee" style={{ left: '32%', top: '42%' }}>
              🔌 Electrical Wing
            </div>
            <div className="landmark-tag tag-garden" style={{ left: '50%', top: '40%' }}>
              🌱 Botanical Garden
            </div>
            <div className="landmark-tag tag-ece" style={{ left: '68%', top: '36%' }}>
              ⚡ ECE Block
            </div>
            <div className="landmark-tag tag-mech" style={{ left: '82%', top: '42%' }}>
              🔧 Mechanical Workshop
            </div>
            <div className="landmark-tag tag-science" style={{ left: '74%', top: '56%' }}>
              🧪 Science Block
            </div>
            <div className="landmark-tag tag-audi" style={{ left: '58%', top: '62%' }}>
              🎭 Auditorium
            </div>
            <div className="landmark-tag tag-library" style={{ left: '42%', top: '60%' }}>
              📚 Central Library
            </div>
            <div className="landmark-tag tag-comp" style={{ left: '28%', top: '70%' }}>
              💻 Computer Centre
            </div>
          </div>

          {/* 12 QUEST MARKERS */}
          <div className="quest-markers-layer">
            {quests.map((quest) => {
              const isCompleted = completedQuests.some((id) => Number(id) === quest.id)
              const isUnlocked = isQuestUnlocked(quest.id, completedQuests)
              const isCurrent = quest.id === currentActiveQuest.id && !isCompleted

              let markerClass = 'game-quest-node'
              if (isCompleted) markerClass += ' node-completed'
              else if (isCurrent) markerClass += ' node-current'
              else if (isUnlocked) markerClass += ' node-unlocked'
              else markerClass += ' node-locked'

              return (
                <div
                  key={quest.id}
                  className={markerClass}
                  style={{ left: `${quest.mapX}%`, top: `${quest.mapY}%` }}
                  onClick={() => handleMarkerClick(quest)}
                >
                  <div className="node-icon-bubble">
                    {isCompleted ? '✓' : isUnlocked ? quest.id : '🔒'}
                  </div>
                  <div className="node-tooltip">
                    <span className="node-tooltip-title">{quest.title}</span>
                    <span className="node-tooltip-sub">
                      {isCompleted ? 'Completed ✓' : isUnlocked ? `+${quest.xp} XP` : 'Locked 🔒'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* MAP FOOTER BAR */}
        <div className="map-bottom-controls">
          <div className="map-legend">
            <span className="legend-item"><span className="dot dot-unlocked" /> Ready to Play</span>
            <span className="legend-item"><span className="dot dot-current" /> Active Trail</span>
            <span className="legend-item"><span className="dot dot-completed" /> Completed ✓</span>
            <span className="legend-item"><span className="dot dot-locked" /> Locked 🔒</span>
          </div>

          <div className="map-action-btns">
            <button
              className="game-secondary-btn"
              type="button"
              onClick={() => onNavigateTab('quests')}
            >
              🗺️ VIEW QUEST LIST
            </button>
            <button
              className="game-secondary-btn"
              type="button"
              onClick={() => onNavigateTab('guide')}
            >
              📚 CAMPUS GUIDE
            </button>
          </div>
        </div>
      </section>

      {/* LOCKED QUEST MODAL DIALOG */}
      {activePopupQuest && (
        <div
          className="locked-popup-backdrop"
          role="presentation"
          onClick={(e) => e.target === e.currentTarget && setActivePopupQuest(null)}
        >
          <div className="locked-popup-card" role="dialog" aria-modal="true">
            <div className="locked-icon-anim">🔒</div>
            <h2>{activePopupQuest.title} is Locked!</h2>
            <p>
              To unlock <strong>{activePopupQuest.title}</strong>, you must first complete{' '}
              <strong>Quest {activePopupQuest.id - 1}</strong> on your adventure trail.
            </p>
            <div className="locked-reward-preview">
              <span>Potential Reward</span>
              <strong>+{activePopupQuest.xp} XP · {activePopupQuest.difficulty}</strong>
            </div>
            <button
              className="game-primary-btn popup-close-btn"
              type="button"
              onClick={() => setActivePopupQuest(null)}
            >
              CONTINUE JOURNEY →
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default CampusAdventureMap
