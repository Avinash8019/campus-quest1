import { useState } from 'react'
import quests from '../data/quests.js'
import { getQuestStatus } from '../utils/gameLevels.js'

function CampusMap({ student, onSelectQuest }) {
  const [selectedQuest, setSelectedQuest] = useState(quests[0])
  const completedQuests = Array.isArray(student?.completedQuests) ? student.completedQuests : []

  function openGoogleMaps(query) {
    const searchQuery = encodeURIComponent(`SRKR Engineering College Bhimavaram ${query || ''}`)
    window.open(`https://www.google.com/maps/search/?api=1&query=${searchQuery}`, '_blank', 'noopener,noreferrer')
  }

  const campusGates = [
    { name: 'Gate 1: Main Heritage Arch', desc: 'Main College Road entry for Administrative Block, Central Library, and CSE/IT Blocks.' },
    { name: 'Gate 2: Sports & Student Gate', desc: 'Direct access to Outdoor Cricket Grounds, Basketball Courts, and Hostels.' },
    { name: 'Gate 3: Workshops & Tech Bay', desc: 'Service entrance for Mechanical Engineering Workshops and Foundry.' },
  ]

  return (
    <main className="clean-campus-map-page" aria-label="Campus Map and Navigation">
      <header className="clean-page-header">
        <div>
          <span className="clean-kicker">CAMPUS NAVIGATION</span>
          <h1>Campus Map & Navigation</h1>
          <p className="page-subtitle">
            Navigate SRKR Engineering College campus landmarks, buildings, and quest facilities using Google Maps.
          </p>
        </div>
        <button
          className="clean-primary-btn"
          type="button"
          onClick={() => openGoogleMaps('')}
        >
          📍 Open SRKR in Google Maps ↗
        </button>
      </header>

      {/* TWO COLUMN NAVIGATION LAYOUT */}
      <div className="campus-map-grid-layout">
        {/* LEFT: LOCATION SELECTOR & GATES */}
        <section className="map-sidebar-col">
          <div className="clean-card map-locations-list-card">
            <h3>Campus Quest Locations</h3>
            <div className="quest-locations-stack">
              {quests.map((q) => {
                const isSelected = selectedQuest?.id === q.id
                const isCompleted = completedQuests.some((id) => Number(id) === q.id)
                return (
                  <button
                    key={q.id}
                    type="button"
                    className={`loc-select-btn${isSelected ? ' active' : ''}`}
                    onClick={() => setSelectedQuest(q)}
                  >
                    <div className="loc-btn-title">
                      <strong>{q.title}</strong>
                      <span>{q.correctPlace}</span>
                    </div>
                    <span className="loc-status-text">
                      {isCompleted ? '✓ Done' : `+${q.xp} XP`}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="clean-card campus-gates-card">
            <h3>Campus Entry Gates</h3>
            <div className="gates-stack">
              {campusGates.map((gate, i) => (
                <div key={i} className="gate-item">
                  <strong>{gate.name}</strong>
                  <p>{gate.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RIGHT: INTERACTIVE PREVIEW & GOOGLE MAPS LAUNCHER */}
        <section className="map-main-view-col">
          <div className="clean-card location-preview-card">
            <div className="preview-top-row">
              <div>
                <span className="preview-kicker">SELECTED LOCATION</span>
                <h2>{selectedQuest?.title}: {selectedQuest?.correctPlace}</h2>
              </div>
              <span className="preview-xp-tag">+{selectedQuest?.xp} XP</span>
            </div>

            <p className="preview-clue-quote">"{selectedQuest?.clue}"</p>

            <div className="preview-embed-frame">
              <iframe
                title="SRKR Campus Map Location"
                src={`https://maps.google.com/maps?q=SRKR+Engineering+College+Bhimavaram+${encodeURIComponent(selectedQuest?.correctPlace || '')}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="340"
                style={{ border: 0, borderRadius: '8px' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="preview-action-row">
              <button
                className="clean-map-btn"
                type="button"
                onClick={() => openGoogleMaps(selectedQuest?.correctPlace)}
              >
                📍 Open in Google Maps App ↗
              </button>

              <button
                className="clean-primary-btn"
                type="button"
                onClick={() => onSelectQuest(selectedQuest)}
              >
                Start This Quest ({selectedQuest?.title}) →
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default CampusMap