import { useState, useMemo } from 'react'
import { getPlayerLevel, getLevelProgress } from '../utils/gameLevels.js'
import { getStudentInterestsByRegNo, saveStudentInterests } from '../utils/studentInterestsService.js'

const ACHIEVEMENTS_LIST = [
  { id: 'ach-first', title: 'First Quest', icon: '🏆', desc: 'Completed your first campus mission.' },
  { id: 'ach-explorer', title: 'Explorer', icon: '🗺️', desc: 'Discovered campus secret locations.' },
  { id: 'ach-thinker', title: 'Quick Thinker', icon: '🧠', desc: 'Solved knowledge challenges correctly.' },
  { id: 'ach-photographer', title: 'Campus Photographer', icon: '📸', desc: 'Uploaded real location visit proofs.' },
  { id: 'ach-qrhunter', title: 'QR Hunter', icon: '🔳', desc: 'Scanned official location verification codes.' },
  { id: 'ach-master', title: 'Campus Explorer', icon: '🎯', desc: 'Mastered SRKR Engineering College landmarks.' },
]

function ProfilePage({
  student,
  onResetProgress,
  onLogout,
  onUpdateReminders,
  onNavigateTab,
  onSwitchToAdmin,
}) {
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const [showConfirmLogout, setShowConfirmLogout] = useState(false)

  const [myInterests, setMyInterests] = useState(() => {
    return getStudentInterestsByRegNo(student?.registrationNumber)
  })

  function handleRemoveInterest(interestToRemove) {
    const updated = myInterests.filter((item) => item !== interestToRemove)
    setMyInterests(updated)
    saveStudentInterests(student, updated)
  }

  const xp = Math.max(0, Number(student?.xp) || 0)
  const level = getPlayerLevel(xp)
  const levelProgress = getLevelProgress(xp)
  const completedQuestsCount = Array.isArray(student?.completedQuests) ? student.completedQuests.length : 0
  const reminders = Array.isArray(student?.reminders) ? student.reminders : []
  const studentName = student?.studentName || student?.name || 'AVINASH'
  const avatarInitial = studentName.charAt(0).toUpperCase()

  function handleRemoveReminder(eventId) {
    if (!onUpdateReminders) return
    const updated = reminders.filter((r) => r.id !== eventId)
    onUpdateReminders(updated)
  }

  return (
    <div className="desktop-profile-page" aria-label="Student Profile and Badges">
      {/* 2-COLUMN TOP: PASSPORT + STATS QUAD */}
      <div className="desktop-dashboard-grid-2col">
        {/* 1. STUDENT IDENTITY PASSPORT CARD */}
        <section className="desktop-card profile-passport-card">
          <div className="passport-top-row">
            <div className="passport-avatar-sticker">
              <span>{avatarInitial}</span>
            </div>
            <div className="passport-info">
              <h2>{studentName}</h2>
              <span className="passport-reg-badge">🆔 {student?.registrationNumber || '24B91A6101'}</span>
              <p className="passport-email">{student?.email || 'avinash@srkrec.ac.in'}</p>
            </div>
          </div>

          <div className="passport-meta-grid">
            <div className="meta-pill">
              <span className="meta-label">BRANCH</span>
              <strong>{student?.branch || 'AI & ML'}</strong>
            </div>
            <div className="meta-pill">
              <span className="meta-label">YEAR</span>
              <strong>{student?.year || '2nd Year'}</strong>
            </div>
            <div className="meta-pill">
              <span className="meta-label">STATUS</span>
              <strong className="text-green">✓ Verified SRKR</strong>
            </div>
          </div>

          {/* LEVEL PROGRESSION */}
          <div className="passport-level-progress">
            <div className="level-label-row">
              <span>Level {level.level} • {level.name}</span>
              <strong>⭐ {xp} / {levelProgress.nextLevelXp} XP</strong>
            </div>
            <div className="game-progress-bar-wrap">
              <div className="game-progress-bar-fill" style={{ width: `${levelProgress.percent}%` }} />
            </div>
          </div>
        </section>

        {/* 2. STATS QUAD */}
        <section className="desktop-stats-quad-card desktop-card">
          <div className="section-title-bar">
            <div>
              <span className="game-kicker">EXPLORATION METRICS</span>
              <h3>📊 Explorer Stats</h3>
            </div>
          </div>

          <div className="desktop-stats-grid">
            <div className="stat-bubble">
              <span className="stat-icon">⭐</span>
              <strong>{xp} XP</strong>
              <small>Earned</small>
            </div>
            <div className="stat-bubble">
              <span className="stat-icon">🎯</span>
              <strong>{completedQuestsCount} / 12</strong>
              <small>Quests</small>
            </div>
            <div className="stat-bubble">
              <span className="stat-icon">🏆</span>
              <strong>{student?.badges?.length || (completedQuestsCount > 0 ? 1 : 0)}</strong>
              <small>Badges</small>
            </div>
            <div className="stat-bubble">
              <span className="stat-icon">🔔</span>
              <strong>{reminders.length}</strong>
              <small>Reminders</small>
            </div>
          </div>

          <div className="profile-quick-actions">
            <button
              className="game-secondary-btn"
              type="button"
              onClick={() => setShowConfirmReset(true)}
            >
              🔄 Reset Progress
            </button>
            {onSwitchToAdmin && (
              <button
                className="game-secondary-btn"
                type="button"
                onClick={onSwitchToAdmin}
              >
                🏛️ Admin Portal
              </button>
            )}
            <button
              className="game-secondary-btn logout-danger-btn"
              type="button"
              onClick={() => setShowConfirmLogout(true)}
            >
              🚪 Log Out
            </button>
          </div>
        </section>
      </div>

      {/* 2-COLUMN BOTTOM: ACHIEVEMENTS + REMINDERS */}
      <div className="desktop-dashboard-grid-2col">
        {/* 3. STICKER ACHIEVEMENT BADGES */}
        <section className="desktop-section-block">
          <div className="section-title-bar">
            <div>
              <span className="game-kicker">COLLECTION</span>
              <h3>🏆 Achievement Badges</h3>
            </div>
          </div>

          <div className="achievements-badges-grid">
            {ACHIEVEMENTS_LIST.map((ach, idx) => {
              const isUnlocked = completedQuestsCount > idx

              return (
                <div key={ach.id} className={`desktop-card ach-badge-card${isUnlocked ? ' unlocked' : ' locked'}`}>
                  <span className="ach-icon-graphic">{ach.icon}</span>
                  <h4>{ach.title}</h4>
                  <p>{ach.desc}</p>
                  <span className="ach-status-tag">{isUnlocked ? '✓ UNLOCKED' : '🔒 LOCKED'}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* 4. SAVED EVENT REMINDERS */}
        <section className="desktop-section-block">
          <div className="section-title-bar">
            <div>
              <span className="game-kicker">SAVED NOTIFICATIONS</span>
              <h3>🔔 My Event Reminders</h3>
            </div>
            {onNavigateTab && (
              <button className="game-link-btn" type="button" onClick={() => onNavigateTab('events')}>
                Browse Events →
              </button>
            )}
          </div>

          {reminders.length > 0 ? (
            <div className="mini-cards-stack">
              {reminders.map((rem) => (
                <article key={rem.id} className="desktop-card event-reminder-card">
                  <div className="mini-card-top">
                    <span className="mini-chip">{rem.category || 'Event'}</span>
                    <button
                      className="remove-x-btn"
                      type="button"
                      onClick={() => handleRemoveReminder(rem.id)}
                      title="Remove Reminder"
                    >
                      ✕
                    </button>
                  </div>
                  <h4>{rem.name}</h4>
                  <p className="mini-meta">📅 {rem.date} • 📍 {rem.venue}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="desktop-card empty-feed-card">
              <span className="empty-sticker">🔔</span>
              <p>No saved event reminders. Click <strong>Remind Me</strong> on any campus event!</p>
            </div>
          )}
        </section>
      </div>

      {/* 3. ISOLATED "MY INTERESTS" SECTION */}
      <section className="desktop-card profile-interests-card" style={{ marginTop: '20px' }}>
        <div className="section-title-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span className="game-kicker" style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', letterSpacing: '0.06em' }}>STUDENT INTERESTS & PASSIONS</span>
            <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 800 }}>⭐ My Selected Interests</h3>
          </div>
          {onNavigateTab && (
            <button
              className="game-secondary-btn"
              type="button"
              onClick={() => onNavigateTab('clubs')}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              + Explore Clubs & Add Interests
            </button>
          )}
        </div>

        {myInterests.length > 0 ? (
          <div className="interests-badge-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {myInterests.map((interest, idx) => (
              <span
                key={idx}
                className="profile-interest-pill"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#ecfdf5',
                  color: '#065f46',
                  border: '1.5px solid #a7f3d0',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                <span>⭐ {interest}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(interest)}
                  style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer', fontWeight: 900, padding: '0 2px' }}
                  title="Remove Interest"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="desktop-card empty-feed-card" style={{ padding: '20px', textAlign: 'center' }}>
            <span className="empty-sticker" style={{ fontSize: '28px' }}>⭐</span>
            <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748b' }}>
              No interests recorded yet. Browse <strong>Clubs</strong> and click <strong>⭐ I'M INTERESTED</strong> to save your technical and cultural interests!
            </p>
          </div>
        )}
      </section>

      {/* DIALOGS */}
      {showConfirmReset && (
        <div className="clean-modal-backdrop" role="presentation" onClick={() => setShowConfirmReset(false)}>
          <div className="desktop-card dialog-modal-box" role="dialog">
            <h3>Reset Progress?</h3>
            <p>This will reset your XP, completed quests, and badges. Your student account will remain registered.</p>
            <div className="modal-actions-row">
              <button className="game-secondary-btn" type="button" onClick={() => setShowConfirmReset(false)}>Cancel</button>
              <button className="game-primary-btn dialog-danger-btn" type="button" onClick={() => { onResetProgress(); setShowConfirmReset(false) }}>Reset</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmLogout && (
        <div className="clean-modal-backdrop" role="presentation" onClick={() => setShowConfirmLogout(false)}>
          <div className="desktop-card dialog-modal-box" role="dialog">
            <h3>Log Out of CampusQuest?</h3>
            <p>You will be returned to the student login screen. Your progress will remain saved on this workstation.</p>
            <div className="modal-actions-row">
              <button className="game-secondary-btn" type="button" onClick={() => setShowConfirmLogout(false)}>Cancel</button>
              <button className="game-primary-btn dialog-danger-btn" type="button" onClick={onLogout}>Log Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage