import { useMemo } from 'react'
import quests from '../data/quests.js'
import srkrEvents from '../data/srkrEvents.js'
import srkrClubs from '../data/srkrClubs.js'
import { getPlayerLevel, getLevelProgress } from '../utils/gameLevels.js'

function Dashboard({ student, onSelectQuest, onNavigateTab }) {
  const completedQuests = Array.isArray(student?.completedQuests) ? student.completedQuests : []
  const xp = Math.max(0, Number(student?.xp) || 0)
  const currentLevel = getPlayerLevel(xp)
  const levelProgress = getLevelProgress(xp)
  const studentName = student?.studentName || student?.name || 'AVINASH'

  // Total quests & completion percent
  const totalQuestsCount = quests.length
  const completedCount = completedQuests.length
  const completionPercent = Math.min(100, Math.round((completedCount / totalQuestsCount) * 100))

  // Find next active quest
  const currentActiveQuest = quests.find((q) => !completedQuests.includes(q.id)) || quests[0]
  const questProgress = student?.questProgress?.[String(currentActiveQuest.id)] || {}
  const activeStep = questProgress.step || 1

  // Top events & clubs for desktop dashboard
  const upcomingEvents = srkrEvents.slice(0, 3)
  const featuredClubs = srkrClubs.slice(0, 3)

  return (
    <div className="desktop-dashboard-container" aria-label="CampusQuest Dashboard">
      {/* 1. TOP WELCOME & LEVEL BANNER */}
      <section className="desktop-card welcome-hero-card">
        <div className="hero-sticker-badge">🤖</div>
        <div className="welcome-hero-content">
          <span className="game-greeting">👋 Welcome back!</span>
          <h1 className="hero-student-name">{studentName}</h1>
          <div className="hero-stats-row">
            <span className="hero-level-chip">Level {currentLevel.level} — {currentLevel.name}</span>
            <span className="hero-xp-chip">⭐ {xp} XP</span>
            <span className="hero-branch-chip">{student?.branch || 'AI & ML'} • {student?.year || '2nd Year'}</span>
          </div>
        </div>
      </section>

      {/* 2-COLUMN GRID: PROGRESS & ACTIVE QUEST */}
      <div className="desktop-dashboard-grid-2col">
        {/* CAMPUS ROADMAP / OVERALL PROGRESS CARD */}
        <section className="desktop-card campus-progress-card">
          <div className="card-head-line">
            <div>
              <span className="game-kicker">CAMPUS ROADMAP</span>
              <h2>Your Campus Adventure</h2>
            </div>
            <span className="progress-percent-badge">{completionPercent}%</span>
          </div>

          <div className="game-progress-bar-wrap">
            <div className="game-progress-bar-fill" style={{ width: `${completionPercent}%` }} />
          </div>

          <div className="progress-card-bottom">
            <span>🎯 {completedCount} of {totalQuestsCount} quests completed</span>
            <span className="progress-xp-next">
              {levelProgress.xpInLevel} / {levelProgress.xpNeeded} XP to Level {currentLevel.level + 1}
            </span>
          </div>
        </section>

        {/* ACTIVE CONTINUE QUEST CARD */}
        <section className="desktop-card continue-quest-card">
          <div className="continue-card-badge-row">
            <span className="quest-cat-chip">🎯 ACTIVE QUEST</span>
            <span className="quest-xp-chip">⭐ +{currentActiveQuest.xp} XP</span>
          </div>

          <div className="continue-quest-body">
            <div className="continue-text-block">
              <h3 className="continue-quest-title">{currentActiveQuest.title}</h3>
              <p className="continue-quest-clue">"{currentActiveQuest.clue}"</p>
              <div className="continue-step-pills">
                <span className="step-pill active">Step {activeStep} of 4</span>
                <span className="step-pill">{currentActiveQuest.difficulty}</span>
              </div>
            </div>
            <div className="continue-sticker-visual">
              <span className="sticker-bounce">🎒</span>
            </div>
          </div>

          <button
            className="game-primary-btn continue-cta-btn"
            type="button"
            onClick={() => onSelectQuest(currentActiveQuest)}
          >
            CONTINUE QUEST →
          </button>
        </section>
      </div>

      {/* DUAL SPOTLIGHT: DAILY BONUS & COLLEGE HISTORY */}
      <div className="desktop-dashboard-grid-2col" style={{ marginTop: -8 }}>
        <section className="desktop-card daily-bonus-card">
          <div className="daily-bonus-content">
            <span className="bonus-icon">🎁</span>
            <div className="bonus-text">
              <h4>DAILY CAMPUS BONUS</h4>
              <p>Explore something new today on the SRKR campus and earn bonus exploration XP!</p>
            </div>
          </div>
          <button
            className="game-secondary-btn bonus-btn"
            type="button"
            onClick={() => onNavigateTab('quests')}
          >
            EXPLORE 🧭
          </button>
        </section>

        <section className="desktop-card daily-bonus-card" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: '#ffffff', borderColor: '#334155' }}>
          <div className="daily-bonus-content">
            <span className="bonus-icon">📜</span>
            <div className="bonus-text">
              <h4 style={{ color: '#38bdf8' }}>SRKR COLLEGE HISTORY</h4>
              <p style={{ color: '#cbd5e1' }}>Discover the 1980 heritage and unlock the SRKR Legacy Quest!</p>
            </div>
          </div>
          <button
            className="game-primary-btn"
            type="button"
            style={{ fontSize: 12, padding: '8px 14px', whiteSpace: 'nowrap' }}
            onClick={() => onNavigateTab('history')}
          >
            EXPLORE HISTORY 🏛️
          </button>
        </section>
      </div>

      {/* 2-COLUMN GRID: EVENTS PREVIEW & CLUBS PREVIEW */}
      <div className="desktop-dashboard-grid-2col">
        {/* CAMPUS HAPPENINGS PREVIEW */}
        <section className="desktop-section-block">
          <div className="section-title-bar">
            <div>
              <span className="game-kicker">WHAT'S HAPPENING</span>
              <h3>📅 Upcoming Campus Events</h3>
            </div>
            <button
              className="game-link-btn"
              type="button"
              onClick={() => onNavigateTab('events')}
            >
              View All Events →
            </button>
          </div>

          <div className="mini-cards-stack">
            {upcomingEvents.map((ev) => (
              <article key={ev.id} className="desktop-mini-card" onClick={() => onNavigateTab('events')}>
                <div className="mini-card-top">
                  <span className="mini-chip">
                    {ev.category === 'Technical' || ev.category === 'Hackathon' ? '💻 TECH EVENT' : '🎭 CULTURAL'}
                  </span>
                  <span className="mini-date">📅 {ev.date}</span>
                </div>
                <h4 className="mini-title">{ev.title}</h4>
                <p className="mini-meta">📍 {ev.location} • ⏰ {ev.startTime} - {ev.endTime}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ACTIVE CLUBS PREVIEW */}
        <section className="desktop-section-block">
          <div className="section-title-bar">
            <div>
              <span className="game-kicker">STUDENT SOCIETIES</span>
              <h3>🏛️ Active Campus Clubs</h3>
            </div>
            <button
              className="game-link-btn"
              type="button"
              onClick={() => onNavigateTab('clubs')}
            >
              Explore All Clubs →
            </button>
          </div>

          <div className="mini-cards-stack">
            {featuredClubs.map((club) => (
              <article key={club.id} className="desktop-mini-card" onClick={() => onNavigateTab('clubs')}>
                <div className="mini-card-top">
                  <span className="mini-chip">🏛️ {club.category || 'Student Club'}</span>
                  <span className="mini-date">📅 {club.meetingDate || 'Weekly'}</span>
                </div>
                <h4 className="mini-title">{club.name}</h4>
                <p className="mini-meta">📍 {club.location || 'SRKR Campus'} • ⏰ {club.startTime} - {club.endTime}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard