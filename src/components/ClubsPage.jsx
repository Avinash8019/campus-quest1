import { useState, useMemo } from 'react'
import { getStoredClubs } from '../utils/adminStorage.js'
import { formatClubTime, formatClubDate } from '../data/srkrClubs.js'
import { getAuthSession } from '../utils/authService.js'
import { getStudentInterestsByRegNo, toggleStudentInterest } from '../utils/studentInterestsService.js'

const CLUB_CATEGORIES = [
  { id: 'All', label: '🔥 All Clubs' },
  { id: 'Technical', label: '💻 Technical' },
  { id: 'Cultural', label: '🎭 Cultural' },
  { id: 'Student Activity', label: '🌐 Languages & Activities' },
  { id: 'Professional Societies', label: '⚙️ Professional Chapters' },
]

const DEFAULT_CLUB_IMG = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80'

function ClubsPage({ student }) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeClubModal, setActiveClubModal] = useState(null)

  const activeStudent = student || getAuthSession() || {
    registrationNumber: '24B91A6101',
    studentName: 'AVINASH',
    branch: 'AI & ML',
    year: '2nd Year',
  }

  const [interestedClubs, setInterestedClubs] = useState(() => {
    try {
      const studentSaved = getStudentInterestsByRegNo(activeStudent?.registrationNumber)
      if (Array.isArray(studentSaved) && studentSaved.length > 0) {
        return studentSaved
      }
      const raw = localStorage.getItem('campusquest_interested_clubs')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const clubsList = useMemo(() => {
    return getStoredClubs()
  }, [])

  function toggleInterest(club) {
    if (!club) return
    const clubIdentifier = club.name || club.id || String(club)
    const clubId = club.id || clubIdentifier

    let updated
    if (interestedClubs.includes(clubIdentifier) || interestedClubs.includes(clubId)) {
      updated = interestedClubs.filter((id) => id !== clubIdentifier && id !== clubId)
    } else {
      updated = [...interestedClubs, clubIdentifier]
    }
    setInterestedClubs(updated)

    try {
      localStorage.setItem('campusquest_interested_clubs', JSON.stringify(updated))
      if (activeStudent) {
        toggleStudentInterest(activeStudent, club.name || clubIdentifier)
      }
    } catch (e) {
      console.error('Error saving interest:', e)
    }
  }

  const filteredClubs = useMemo(() => {
    return clubsList.filter((c) => {
      const matchCat =
        selectedCategory === 'All' ||
        c.category?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        (selectedCategory === 'Technical' && (c.category === 'Technical' || c.category === 'Professional Societies'))
      const matchQuery =
        !searchQuery ||
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchQuery
    })
  }, [clubsList, selectedCategory, searchQuery])

  function openLocationInMaps(location) {
    const query = encodeURIComponent(`SRKR Engineering College ${location || 'Bhimavaram'}`)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="desktop-clubs-page" aria-label="Campus Clubs Dashboard">
      {/* HEADER BAR */}
      <header className="desktop-page-header">
        <div>
          <span className="game-kicker">STUDENT BODIES & SOCIETIES</span>
          <h1>🏛️ Find Your Community</h1>
          <p className="desktop-subhead">Join official student technical clubs, arts communities, sports teams, and innovation societies at SRKR.</p>
        </div>

        {/* SEARCH BAR */}
        <div className="desktop-search-wrapper">
          <div className="game-search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coding clubs, cultural fests, NSS..."
              aria-label="Search Clubs"
            />
            {searchQuery && (
              <button className="search-clear-btn" type="button" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>
        </div>
      </header>

      {/* HORIZONTAL CATEGORY CHIPS */}
      <div className="desktop-chips-filter-row" role="tablist" aria-label="Club Categories">
        {CLUB_CATEGORIES.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className={`desktop-filter-chip${selectedCategory === chip.id ? ' active' : ''}`}
            onClick={() => setSelectedCategory(chip.id)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* DESKTOP MULTI-COLUMN CLUBS GRID */}
      <div className="desktop-clubs-grid">
        {filteredClubs.map((club) => {
          const isInterested = interestedClubs.includes(club.id) || interestedClubs.includes(club.name)
          const formattedDate = formatClubDate(club.meetingDate || club.meetingSchedule)
          const formattedTime = formatClubTime(club.startTime, club.endTime)
          const clubLocation = club.location || 'SRKR Campus'
          const clubImg = club.image || DEFAULT_CLUB_IMG

          return (
            <article
              key={club.id}
              className="desktop-card club-desktop-card"
              onClick={() => setActiveClubModal(club)}
            >
              {/* Club Aspect-Ratio Card Header Image */}
              <div className="club-card-image-wrap">
                <img
                  src={clubImg}
                  alt={club.name}
                  className="club-card-img"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = DEFAULT_CLUB_IMG
                  }}
                />
                <div className="event-image-overlay">
                  <span className="event-category-badge">{club.icon || '🏛️'} {club.category}</span>
                  <span className="official-verified-tag">✓ Official</span>
                </div>
              </div>

              <div>
                <h2 className="event-card-title">{club.name}</h2>
                <p className="event-desc-snippet">{club.shortDescription || club.description}</p>
              </div>

              <div>
                {/* Meeting Timings Table */}
                <div className="event-info-table">
                  <div className="event-info-row">
                    <span className="info-icon">📅</span>
                    <span className="info-text">{formattedDate}</span>
                  </div>
                  <div className="event-info-row">
                    <span className="info-icon">⏰</span>
                    <span className="info-text">{formattedTime}</span>
                  </div>
                  <div className="event-info-row">
                    <span className="info-icon">📍</span>
                    <span className="info-text">{clubLocation}</span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="club-feed-footer">
                  <button
                    className="game-secondary-btn club-explore-btn"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveClubModal(club)
                    }}
                  >
                    EXPLORE CLUB ↗
                  </button>

                  <button
                    className={`game-reminder-chip-btn${isInterested ? ' active' : ''}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleInterest(club)
                    }}
                  >
                    {isInterested ? '⭐ INTERESTED' : '⭐ I\'M INTERESTED'}
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {/* MODAL SHEET FOR CLUB DETAILS */}
      {activeClubModal && (
        <div
          className="clean-modal-backdrop"
          role="presentation"
          onClick={(e) => e.target === e.currentTarget && setActiveClubModal(null)}
        >
          <div className="desktop-card club-modal-sheet" role="dialog" aria-modal="true">
            {/* Modal Top Image */}
            <div className="club-modal-image-wrap">
              <img
                src={activeClubModal.image || DEFAULT_CLUB_IMG}
                alt={activeClubModal.name}
                className="club-modal-img"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = DEFAULT_CLUB_IMG
                }}
              />
              <button
                className="clean-close-btn modal-img-close-btn"
                type="button"
                onClick={() => setActiveClubModal(null)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-sheet-content-wrap">
              <div className="modal-sheet-header">
                <div className="club-badge-row">
                  <span className="club-sticker-mini">{activeClubModal.icon || '🏛️'}</span>
                  <span className="modal-category-chip">{activeClubModal.category}</span>
                </div>
              </div>

              <h2 className="modal-club-name">{activeClubModal.name}</h2>

            <div className="modal-info-bubble">
              <div className="event-info-row">
                <span className="info-icon">📅</span>
                <span className="info-text">{formatClubDate(activeClubModal.meetingDate || activeClubModal.meetingSchedule)}</span>
              </div>
              <div className="event-info-row">
                <span className="info-icon">⏰</span>
                <span className="info-text">{formatClubTime(activeClubModal.startTime, activeClubModal.endTime)}</span>
              </div>
              <div className="event-info-row">
                <span className="info-icon">📍</span>
                <span className="info-text">{activeClubModal.location}</span>
              </div>
              {activeClubModal.contact && (
                <div className="event-info-row">
                  <span className="info-icon">👤</span>
                  <span className="info-text">{activeClubModal.contact}</span>
                </div>
              )}
            </div>

            <div className="modal-description-box">
              <h4>About the Club</h4>
              <p>{activeClubModal.description || activeClubModal.shortDescription}</p>
            </div>

            {Array.isArray(activeClubModal.activities) && activeClubModal.activities.length > 0 && (
              <div className="modal-description-box">
                <h4>Key Activities & Initiatives</h4>
                <ul className="activities-bullet-list">
                  {activeClubModal.activities.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            )}

              <div className="modal-actions-row">
                <button
                  className={`game-secondary-btn modal-reminder-btn${interestedClubs.includes(activeClubModal.id) || interestedClubs.includes(activeClubModal.name) ? ' active' : ''}`}
                  type="button"
                  onClick={() => toggleInterest(activeClubModal)}
                >
                  {interestedClubs.includes(activeClubModal.id) || interestedClubs.includes(activeClubModal.name) ? '⭐ INTEREST RECORDED' : '⭐ I\'M INTERESTED'}
                </button>

                <button
                  className="game-primary-btn modal-maps-btn"
                  type="button"
                  onClick={() => openLocationInMaps(activeClubModal.location)}
                >
                  🗺️ FIND MEETING VENUE ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClubsPage
