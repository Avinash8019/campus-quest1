import { useState, useMemo } from 'react'
import { getStoredFacilities } from '../utils/adminStorage.js'
import { FACILITY_CATEGORIES } from '../data/srkrFacilities.js'

const DEFAULT_FACILITY_IMG = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80'

function CampusFacilitiesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFacilityModal, setActiveFacilityModal] = useState(null)

  const facilitiesList = useMemo(() => {
    return getStoredFacilities()
  }, [])

  const filteredFacilities = useMemo(() => {
    return facilitiesList.filter((f) => {
      const matchCat =
        selectedCategory === 'All' ||
        f.category?.toLowerCase() === selectedCategory.toLowerCase()

      const matchSearch =
        !searchQuery ||
        f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(f.highlights) && f.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase())))

      return matchCat && matchSearch
    })
  }, [facilitiesList, selectedCategory, searchQuery])

  function openLocationInMaps(facility) {
    if (facility.mapsUrl) {
      window.open(facility.mapsUrl, '_blank', 'noopener,noreferrer')
      return
    }
    const query = encodeURIComponent(`SRKR Engineering College Bhimavaram ${facility.location || facility.name}`)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="desktop-facilities-page" aria-label="SRKR Campus Facilities Directory">
      {/* HEADER BAR */}
      <header className="desktop-page-header">
        <div>
          <span className="game-kicker">CAMPUS INFRASTRUCTURE & HUBS</span>
          <h1>🏫 SRKR College Facilities</h1>
          <p className="desktop-subhead">Explore official academic blocks, state-of-the-art laboratories, computing centres, dining halls, and sports complexes.</p>
        </div>

        {/* SEARCH BAR */}
        <div className="desktop-search-wrapper">
          <div className="game-search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search library, labs, sports, canteen, hostel..."
              aria-label="Search Facilities"
            />
            {searchQuery && (
              <button className="search-clear-btn" type="button" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>
        </div>
      </header>

      {/* HORIZONTAL CATEGORY FILTER BAR */}
      <div className="desktop-chips-filter-row" role="tablist" aria-label="Facility Categories">
        {FACILITY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`desktop-filter-chip${selectedCategory === cat ? ' active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === 'All' ? '🔥 All Facilities' : cat}
          </button>
        ))}
      </div>

      {/* FACILITIES GRID */}
      {filteredFacilities.length === 0 ? (
        <div className="clean-card empty-leaderboard-card">
          <span className="empty-sticker">🏫</span>
          <h3>No facilities found matching your search.</h3>
          <p>Try searching for library, computing labs, sports, canteen, or hostels.</p>
        </div>
      ) : (
        <div className="desktop-facilities-grid">
          {filteredFacilities.map((facility) => {
            const facImg = facility.image || DEFAULT_FACILITY_IMG

            return (
              <article
                key={facility.id}
                className="desktop-card facility-desktop-card"
                onClick={() => setActiveFacilityModal(facility)}
              >
                {/* Facility Image */}
                <div className="facility-card-image-wrap">
                  <img
                    src={facImg}
                    alt={facility.name}
                    className="facility-card-img"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = DEFAULT_FACILITY_IMG
                    }}
                  />
                  <div className="facility-image-overlay">
                    <span className="facility-category-chip">{facility.category}</span>
                    <span className="official-verified-tag">✓ Official</span>
                  </div>
                </div>

                {/* Facility Body */}
                <div className="facility-card-body-content">
                  <div>
                    <h2 className="facility-card-title">
                      <span className="facility-icon-span">{facility.icon}</span>
                      <span>{facility.name}</span>
                    </h2>

                    <p className="facility-desc-snippet">{facility.shortDescription || facility.description}</p>
                  </div>

                  <div>
                    {/* Location Tag */}
                    <div className="facility-location-row">
                      <span className="info-icon">📍</span>
                      <span className="info-text">{facility.location}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="facility-card-action-footer">
                      <button
                        className="game-secondary-btn facility-details-btn"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveFacilityModal(facility)
                        }}
                      >
                        VIEW DETAILS ↗
                      </button>

                      <button
                        className="game-primary-btn facility-map-btn"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          openLocationInMaps(facility)
                        }}
                      >
                        🗺️ VIEW ON MAP
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* FACILITY DETAILS MODAL */}
      {activeFacilityModal && (
        <div
          className="clean-modal-backdrop"
          role="presentation"
          onClick={(e) => e.target === e.currentTarget && setActiveFacilityModal(null)}
        >
          <div className="desktop-card facility-modal-sheet" role="dialog" aria-modal="true">
            {/* Modal Top Image */}
            <div className="facility-modal-image-wrap">
              <img
                src={activeFacilityModal.image || DEFAULT_FACILITY_IMG}
                alt={activeFacilityModal.name}
                className="facility-modal-img"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = DEFAULT_FACILITY_IMG
                }}
              />
              <button
                className="clean-close-btn modal-img-close-btn"
                type="button"
                onClick={() => setActiveFacilityModal(null)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-sheet-content-wrap">
              <div className="modal-sheet-header">
                <span className="modal-category-chip">{activeFacilityModal.category}</span>
                <span className="official-verified-tag">✓ Verified SRKR Facility</span>
              </div>

              <h2 className="modal-event-name">
                <span>{activeFacilityModal.icon} </span>
                <span>{activeFacilityModal.name}</span>
              </h2>

              <div className="modal-info-bubble">
                <div className="event-info-row">
                  <span className="info-icon">📍</span>
                  <span className="info-text"><strong>Campus Location:</strong> {activeFacilityModal.location}</span>
                </div>
                <div className="event-info-row">
                  <span className="info-icon">🏛️</span>
                  <span className="info-text"><strong>Category:</strong> {activeFacilityModal.category}</span>
                </div>
              </div>

              <div className="modal-description-box">
                <h4>Facility Overview</h4>
                <p>{activeFacilityModal.description}</p>
              </div>

              {Array.isArray(activeFacilityModal.highlights) && activeFacilityModal.highlights.length > 0 && (
                <div className="modal-description-box">
                  <h4>Infrastructure & Key Highlights</h4>
                  <ul className="activities-bullet-list">
                    {activeFacilityModal.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="modal-actions-row">
                <button
                  className="clean-secondary-btn modal-reminder-btn"
                  type="button"
                  onClick={() => setActiveFacilityModal(null)}
                >
                  Close
                </button>

                <button
                  className="game-primary-btn modal-maps-btn"
                  type="button"
                  onClick={() => openLocationInMaps(activeFacilityModal)}
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

export default CampusFacilitiesPage
