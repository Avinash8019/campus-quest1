import { useState, useMemo } from 'react'
import { getStoredEvents } from '../utils/adminStorage.js'
import { getEventTimingStatus, formatEventTime, formatEventDate } from '../data/srkrEvents.js'

const FILTER_CHIPS = [
  { id: 'All', label: '🔥 All Events' },
  { id: 'Technical', label: '💻 Tech Events' },
  { id: 'Cultural', label: '🎭 Cultural' },
  { id: 'Competition', label: '🏆 Competitions' },
  { id: 'Workshop', label: '🛠️ Workshops' },
  { id: 'Sports', label: '🏏 Sports' },
  { id: 'Seminar', label: '🎤 Seminars' },
  { id: 'Hackathon', label: '🎉 Hackathons' },
]

const DEFAULT_EVENT_IMG = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'

function EventsPage({ student, onUpdateReminders }) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeEventModal, setActiveEventModal] = useState(null)

  const eventsList = useMemo(() => {
    return getStoredEvents()
  }, [])

  const reminders = Array.isArray(student?.reminders) ? student.reminders : []

  function isReminderSet(eventId) {
    return reminders.some((r) => r.id === eventId)
  }

  function handleToggleReminder(eventItem, e) {
    if (e) e.stopPropagation()
    if (!onUpdateReminders) return

    let updated
    if (isReminderSet(eventItem.id)) {
      updated = reminders.filter((r) => r.id !== eventItem.id)
    } else {
      updated = [
        ...reminders,
        {
          id: eventItem.id,
          name: eventItem.name,
          date: formatEventDate(eventItem.eventDate || eventItem.date),
          venue: eventItem.venue || eventItem.location,
          category: eventItem.category,
          savedAt: new Date().toISOString(),
        },
      ]
    }
    onUpdateReminders(updated)
  }

  const filteredEvents = useMemo(() => {
    return eventsList.filter((ev) => {
      const matchCat =
        selectedCategory === 'All' ||
        ev.category?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        (selectedCategory === 'Hackathon' && (ev.category === 'Hackathon' || ev.category === 'Technical')) ||
        (selectedCategory === 'Technical' && (ev.category === 'Technical' || ev.category === 'Hackathon' || ev.category === 'Competition'))
      const matchQuery =
        !searchQuery ||
        ev.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.organizer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.description?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchQuery
    })
  }, [eventsList, selectedCategory, searchQuery])

  function openLocationInMaps(venue) {
    const query = encodeURIComponent(`SRKR Engineering College ${venue || 'Bhimavaram'}`)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="desktop-events-page" aria-label="Campus Events Dashboard">
      {/* HEADER BAR */}
      <header className="desktop-page-header">
        <div>
          <span className="game-kicker">CAMPUS CALENDAR & ACTIVITIES</span>
          <h1>📅 What's Happening?</h1>
          <p className="desktop-subhead">Stay updated with official hackathons, technical symposiums, fests, and workshops at SRKR.</p>
        </div>

        {/* SEARCH BAR */}
        <div className="desktop-search-wrapper">
          <div className="game-search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fests, workshops, hackathons..."
              aria-label="Search Events"
            />
            {searchQuery && (
              <button className="search-clear-btn" type="button" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>
        </div>
      </header>

      {/* HORIZONTAL CATEGORY FILTER BAR */}
      <div className="desktop-chips-filter-row" role="tablist" aria-label="Event Categories">
        {FILTER_CHIPS.map((chip) => (
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

      {/* DESKTOP MULTI-COLUMN EVENTS GRID */}
      <div className="desktop-events-grid">
        {filteredEvents.map((ev) => {
          const timingStatus = getEventTimingStatus(ev)
          const isReminded = isReminderSet(ev.id)
          const formattedDate = formatEventDate(ev.eventDate || ev.date)
          const formattedTime = formatEventTime(ev.startTime, ev.endTime)
          const eventVenue = ev.venue || ev.location || 'SRKR Campus'
          const eventImg = ev.image || DEFAULT_EVENT_IMG

          return (
            <article
              key={ev.id}
              className="desktop-card event-desktop-card"
              onClick={() => setActiveEventModal(ev)}
            >
              {/* Top Event Image */}
              <div className="event-card-image-wrap">
                <img
                  src={eventImg}
                  alt={ev.name}
                  className="event-card-img"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = DEFAULT_EVENT_IMG
                  }}
                />
                <div className="event-image-overlay">
                  <span className="event-category-badge">{ev.category}</span>
                  <span className={`event-status-badge status-${timingStatus.color}`}>
                    {timingStatus.text}
                  </span>
                </div>
              </div>

              {/* Event Card Content */}
              <div className="event-card-body-content">
                <div>
                  <h2 className="event-card-title">{ev.name}</h2>
                  <div className="event-organizer-tag">🏛️ {ev.organizer}</div>
                  <p className="event-desc-snippet">{ev.description}</p>
                </div>

                <div>
                  {/* Information Table */}
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
                      <span className="info-text">{eventVenue}</span>
                    </div>
                    <div className="event-info-row">
                      <span className="info-icon">🏛️</span>
                      <span className="info-text">{ev.organizer}</span>
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="event-card-action-footer">
                    <button
                      className="game-secondary-btn event-view-btn"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveEventModal(ev)
                      }}
                    >
                      VIEW DETAILS ↗
                    </button>

                    <button
                      className={`game-reminder-chip-btn${isReminded ? ' active' : ''}`}
                      type="button"
                      onClick={(e) => handleToggleReminder(ev, e)}
                      title="Set a reminder"
                    >
                      {isReminded ? '✓ REMINDED' : '🔔 REMIND ME'}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {/* MODAL SHEET FOR EVENT DETAILS */}
      {activeEventModal && (
        <div
          className="clean-modal-backdrop"
          role="presentation"
          onClick={(e) => e.target === e.currentTarget && setActiveEventModal(null)}
        >
          <div className="desktop-card event-modal-sheet" role="dialog" aria-modal="true">
            {/* Modal Top Image */}
            <div className="event-modal-image-wrap">
              <img
                src={activeEventModal.image || DEFAULT_EVENT_IMG}
                alt={activeEventModal.name}
                className="event-modal-img"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = DEFAULT_EVENT_IMG
                }}
              />
              <button
                className="clean-close-btn modal-img-close-btn"
                type="button"
                onClick={() => setActiveEventModal(null)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-sheet-content-wrap">
              <div className="modal-sheet-header">
                <span className="modal-category-chip">{activeEventModal.category}</span>
                <span className={`event-status-badge status-${getEventTimingStatus(activeEventModal).color}`}>
                  {getEventTimingStatus(activeEventModal).text}
                </span>
              </div>

              <h2 className="modal-event-name">{activeEventModal.name}</h2>

              <div className="modal-info-bubble">
                <div className="event-info-row">
                  <span className="info-icon">📅</span>
                  <span className="info-text">{formatEventDate(activeEventModal.eventDate || activeEventModal.date)}</span>
                </div>
                <div className="event-info-row">
                  <span className="info-icon">⏰</span>
                  <span className="info-text">{formatEventTime(activeEventModal.startTime, activeEventModal.endTime)}</span>
                </div>
                <div className="event-info-row">
                  <span className="info-icon">📍</span>
                  <span className="info-text">{activeEventModal.venue || activeEventModal.location}</span>
                </div>
                <div className="event-info-row">
                  <span className="info-icon">🏛️</span>
                  <span className="info-text">{activeEventModal.organizer}</span>
                </div>
              </div>

              <div className="modal-description-box">
                <h4>Event Overview</h4>
                <p>{activeEventModal.description}</p>
              </div>

              <div className="modal-actions-row">
                <button
                  className={`game-secondary-btn modal-reminder-btn${isReminderSet(activeEventModal.id) ? ' active' : ''}`}
                  type="button"
                  onClick={() => handleToggleReminder(activeEventModal)}
                >
                  {isReminderSet(activeEventModal.id) ? '✓ REMINDER SET' : '🔔 REMIND ME'}
                </button>

                <button
                  className="game-primary-btn modal-maps-btn"
                  type="button"
                  onClick={() => openLocationInMaps(activeEventModal.venue || activeEventModal.location)}
                >
                  🗺️ DIRECTIONS (GOOGLE MAPS) ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventsPage
