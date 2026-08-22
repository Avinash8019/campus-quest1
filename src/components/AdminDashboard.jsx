import { useState, useMemo, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import initialQuests from '../data/quests.js'
import initialEvents, { EVENT_CATEGORIES, getEventTimingStatus, formatEventTime, formatEventDate } from '../data/srkrEvents.js'
import initialClubs, { CLUB_CATEGORIES, formatClubTime, formatClubDate } from '../data/srkrClubs.js'
import initialFacilities from '../data/srkrFacilities.js'
import { logoutAdmin } from '../utils/adminAuthService.js'
import {
  ADMIN_QUESTS_KEY,
  ADMIN_EVENTS_KEY,
  ADMIN_CLUBS_KEY,
  ADMIN_FACILITIES_KEY,
  getStoredQuests,
  getStoredEvents,
  getStoredClubs,
  getStoredFacilities,
} from '../utils/adminStorage.js'
import {
  DEPARTMENTS,
  YEARS,
  getAllLeaderboardStudents,
  rankStudents,
  getDepartmentStatistics,
  getOverallAnalytics,
  normalizeDepartment,
} from '../utils/leaderboardService.js'
import { getAllStudentInterests } from '../utils/studentInterestsService.js'

function AdminDashboard({ adminUser, onLogout, onSwitchToStudent }) {
  // Parse initial route from URL hash if present
  const [activeNav, setActiveNav] = useState(() => {
    const hash = (window.location.hash || '').toLowerCase()
    if (hash.includes('quest')) return 'quests'
    if (hash.includes('qr')) return 'qr_codes'
    if (hash.includes('event')) return 'events'
    if (hash.includes('club')) return 'clubs'
    if (hash.includes('interest')) return 'interests'
    if (hash.includes('campus')) return 'campus'
    if (hash.includes('analytic') || hash.includes('leaderboard')) return 'analytics'
    if (hash.includes('setting')) return 'settings'
    return 'overview'
  })

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Listen to hash changes for sub-navigation
  useEffect(() => {
    function handleHashChange() {
      const hash = (window.location.hash || '').toLowerCase()
      if (hash.includes('admin')) {
        if (hash.includes('quest')) setActiveNav('quests')
        else if (hash.includes('qr')) setActiveNav('qr_codes')
        else if (hash.includes('event')) setActiveNav('events')
        else if (hash.includes('club')) setActiveNav('clubs')
        else if (hash.includes('interest')) setActiveNav('interests')
        else if (hash.includes('campus')) setActiveNav('campus')
        else if (hash.includes('analytic') || hash.includes('leaderboard')) setActiveNav('analytics')
        else if (hash.includes('setting')) setActiveNav('settings')
        else setActiveNav('overview')
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  function switchNav(navId) {
    setActiveNav(navId)
    setIsMobileMenuOpen(false)
    const hashMapping = {
      overview: '#/admin/dashboard',
      quests: '#/admin/quests',
      qr_codes: '#/admin/qr',
      events: '#/admin/events',
      clubs: '#/admin/clubs',
      interests: '#/admin/interests',
      campus: '#/admin/campus',
      analytics: '#/admin/analytics',
      settings: '#/admin/settings',
    }
    window.location.hash = hashMapping[navId] || '#/admin/dashboard'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Stored state
  const [questsList, setQuestsList] = useState(getStoredQuests)
  const [eventsList, setEventsList] = useState(getStoredEvents)
  const [clubsList, setClubsList] = useState(getStoredClubs)
  const [facilitiesList, setFacilitiesList] = useState(getStoredFacilities)
  const [registeredStudents, setRegisteredStudents] = useState(() => {
    try {
      const raw = localStorage.getItem('campusquest_registered_students')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  // Admin Leaderboard filters
  const [adminDeptFilter, setAdminDeptFilter] = useState('All Departments')
  const [adminYearFilter, setAdminYearFilter] = useState('All Years')
  const [adminSearchQuery, setAdminSearchQuery] = useState('')

  // Student Interests Directory State (Isolated)
  const [studentInterestsList, setStudentInterestsList] = useState(getAllStudentInterests)
  const [interestSearchQuery, setInterestSearchQuery] = useState('')
  const [interestDeptFilter, setInterestDeptFilter] = useState('All Departments')
  const [interestTopicFilter, setInterestTopicFilter] = useState('All Interests')

  // Extract all unique interest topics for filtering
  const availableInterestTopics = useMemo(() => {
    const set = new Set()
    studentInterestsList.forEach((item) => {
      if (Array.isArray(item.interests)) {
        item.interests.forEach((intr) => set.add(intr))
      }
    })
    return ['All Interests', ...Array.from(set).sort()]
  }, [studentInterestsList])

  // Filtered student interest submissions
  const filteredStudentInterests = useMemo(() => {
    return studentInterestsList.filter((item) => {
      const matchDept =
        interestDeptFilter === 'All Departments' ||
        normalizeDepartment(item.branch) === normalizeDepartment(interestDeptFilter) ||
        item.branch?.toLowerCase().includes(interestDeptFilter.toLowerCase())

      const matchTopic =
        interestTopicFilter === 'All Interests' ||
        (Array.isArray(item.interests) && item.interests.includes(interestTopicFilter))

      const q = interestSearchQuery.toLowerCase()
      const matchSearch =
        !q ||
        item.studentName?.toLowerCase().includes(q) ||
        item.registrationNumber?.toLowerCase().includes(q) ||
        (Array.isArray(item.interests) && item.interests.some((intr) => intr.toLowerCase().includes(q)))

      return matchDept && matchTopic && matchSearch
    })
  }, [studentInterestsList, interestDeptFilter, interestTopicFilter, interestSearchQuery])

  // Edit / Create Modals state
  const [editingQuest, setEditingQuest] = useState(null)
  const [isNewQuest, setIsNewQuest] = useState(false)

  const [editingEvent, setEditingEvent] = useState(null)
  const [isNewEvent, setIsNewEvent] = useState(false)

  const [editingClub, setEditingClub] = useState(null)
  const [isNewClub, setIsNewClub] = useState(false)

  // Single QR Preview Modal State
  const [previewQrQuest, setPreviewQrQuest] = useState(null)

  // Save to localStorage whenever state changes
  function updateQuests(newList) {
    setQuestsList(newList)
    localStorage.setItem(ADMIN_QUESTS_KEY, JSON.stringify(newList))
  }

  function updateEvents(newList) {
    setEventsList(newList)
    localStorage.setItem(ADMIN_EVENTS_KEY, JSON.stringify(newList))
  }

  function updateClubs(newList) {
    setClubsList(newList)
    localStorage.setItem(ADMIN_CLUBS_KEY, JSON.stringify(newList))
  }

  function updateFacilities(newList) {
    setFacilitiesList(newList)
    localStorage.setItem(ADMIN_FACILITIES_KEY, JSON.stringify(newList))
  }

  // Leaderboard & Analytics computations
  const allLeaderboardStudents = useMemo(() => {
    return getAllLeaderboardStudents()
  }, [registeredStudents])

  const overallAnalytics = useMemo(() => {
    return getOverallAnalytics(allLeaderboardStudents)
  }, [allLeaderboardStudents])

  const departmentStats = useMemo(() => {
    return getDepartmentStatistics(allLeaderboardStudents)
  }, [allLeaderboardStudents])

  const adminRankedStudents = useMemo(() => {
    const rankedOverall = rankStudents(allLeaderboardStudents)

    return rankedOverall.map((st) => {
      const deptList = allLeaderboardStudents.filter(
        (s) => normalizeDepartment(s.department || s.branch) === normalizeDepartment(st.department || st.branch)
      )
      const rankedDept = rankStudents(deptList)
      const deptItem = rankedDept.find((s) => s.registrationNumber === st.registrationNumber)

      const yearList = deptList.filter(
        (s) => (s.year || '').trim().toLowerCase() === (st.year || '').trim().toLowerCase()
      )
      const rankedYear = rankStudents(yearList)
      const yearItem = rankedYear.find((s) => s.registrationNumber === st.registrationNumber)

      return {
        ...st,
        overallRank: st.rank,
        departmentRank: deptItem ? deptItem.rank : 1,
        yearRank: yearItem ? yearItem.rank : 1,
      }
    }).filter((st) => {
      const matchDept =
        adminDeptFilter === 'All Departments' ||
        normalizeDepartment(st.department || st.branch) === adminDeptFilter
      const matchYear =
        adminYearFilter === 'All Years' ||
        (st.year || '').trim().toLowerCase() === adminYearFilter.trim().toLowerCase()
      const matchSearch =
        !adminSearchQuery ||
        st.name?.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
        st.registrationNumber?.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
        st.email?.toLowerCase().includes(adminSearchQuery.toLowerCase())

      return matchDept && matchYear && matchSearch
    })
  }, [allLeaderboardStudents, adminDeptFilter, adminYearFilter, adminSearchQuery])

  // --- QUEST ACTIONS ---
  function handleToggleQuest(id) {
    const updated = questsList.map((q) =>
      q.id === id ? { ...q, enabled: q.enabled === false ? true : false } : q
    )
    updateQuests(updated)
  }

  function handleDeleteQuest(id) {
    if (window.confirm(`Are you sure you want to delete Quest ${id}?`)) {
      const updated = questsList.filter((q) => q.id !== id)
      updateQuests(updated)
    }
  }

  function handleSaveQuest(e) {
    e.preventDefault()
    if (!editingQuest.name && !editingQuest.title) return

    let updated
    if (isNewQuest) {
      const newId = questsList.length > 0 ? Math.max(...questsList.map((q) => q.id)) + 1 : 1
      const created = {
        ...editingQuest,
        id: newId,
        name: editingQuest.name || `Quest ${newId}`,
        title: editingQuest.name || `Quest ${newId}`,
        displayName: `Quest ${newId}: ${editingQuest.name || ''}`,
        enabled: true,
        destinationName: editingQuest.location || editingQuest.destinationName || 'SRKR Campus',
        qrId: editingQuest.qrId || `CQ-NEW-${String(newId).padStart(3, '0')}`,
        qrCode: editingQuest.qrId || `CQ-NEW-${String(newId).padStart(3, '0')}`,
        qrCodeData: editingQuest.qrId || `CQ-NEW-${String(newId).padStart(3, '0')}`,
        verificationCode: editingQuest.verificationCode || `QUEST${newId}`,
      }
      updated = [...questsList, created]
    } else {
      updated = questsList.map((q) => (q.id === editingQuest.id ? editingQuest : q))
    }

    updateQuests(updated)
    setEditingQuest(null)
    setIsNewQuest(false)
  }

  // --- EVENT ACTIONS ---
  function handleDeleteEvent(id) {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const updated = eventsList.filter((ev) => ev.id !== id)
      updateEvents(updated)
    }
  }

  function handleSaveEvent(e) {
    e.preventDefault()
    if (!editingEvent.name) return

    let updated
    if (isNewEvent) {
      const newId = eventsList.length > 0 ? Math.max(...eventsList.map((ev) => ev.id)) + 1 : 1
      const created = {
        ...editingEvent,
        id: newId,
        eventDate: editingEvent.eventDate || editingEvent.date || '2026-09-01',
        date: editingEvent.eventDate || editingEvent.date || '2026-09-01',
      }
      updated = [...eventsList, created]
    } else {
      updated = eventsList.map((ev) => (ev.id === editingEvent.id ? editingEvent : ev))
    }

    updateEvents(updated)
    setEditingEvent(null)
    setIsNewEvent(false)
  }

  // --- CLUB ACTIONS ---
  function handleDeleteClub(id) {
    if (window.confirm('Are you sure you want to delete this club?')) {
      const updated = clubsList.filter((c) => c.id !== id)
      updateClubs(updated)
    }
  }

  function handleSaveClub(e) {
    e.preventDefault()
    if (!editingClub.name) return

    let updated
    if (isNewClub) {
      const newId = clubsList.length > 0 ? Math.max(...clubsList.map((c) => c.id)) + 1 : 1
      const created = {
        ...editingClub,
        id: newId,
        meetingDate: editingClub.meetingDate || '2026-09-01',
        meetingSchedule: editingClub.meetingDate || '2026-09-01',
      }
      updated = [...clubsList, created]
    } else {
      updated = clubsList.map((c) => (c.id === editingClub.id ? editingClub : c))
    }

    updateClubs(updated)
    setEditingClub(null)
    setIsNewClub(false)
  }

  // --- PRINT ALL QR CODES ---
  function handlePrintAllQr() {
    window.print()
  }

  // --- PRINT SINGLE QR CODE ---
  function handlePrintSingleQr(quest) {
    const printWindow = window.open('', '_blank', 'width=800,height=900')
    if (!printWindow) {
      alert('Please allow popups to print individual QR codes.')
      return
    }

    const svgElement = document.getElementById(`admin-qr-svg-${quest.id}`)
    const svgHtml = svgElement ? svgElement.outerHTML : ''
    const qName = quest.name || quest.title
    const qLoc = quest.location || quest.destinationName

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CampusQuest QR - ${qName}</title>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #fff; padding: 20px; }
            .print-card { border: 3px solid #0f172a; border-radius: 20px; padding: 40px; text-align: center; max-width: 480px; width: 100%; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
            h1 { font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #0f172a; margin: 0 0 4px; }
            h2 { font-size: 20px; font-weight: 800; color: #2563eb; margin: 8px 0; }
            .loc-tag { font-size: 16px; font-weight: 700; color: #475569; margin-bottom: 20px; }
            .qr-wrap { margin: 24px 0; display: flex; justify-content: center; }
            .qr-wrap svg { width: 280px !important; height: 280px !important; }
            .sub-tag { font-size: 15px; font-weight: 800; color: #0f172a; margin: 16px 0 4px; }
            .hint { font-size: 13px; color: #64748b; margin-top: 4px; }
            @media print { body { padding: 0; } .print-card { border-width: 2px; box-shadow: none; } }
          </style>
        </head>
        <body>
          <div class="print-card">
            <h1>CAMPUSQUEST</h1>
            <h2>${qName}</h2>
            <div class="loc-tag">📍 ${qLoc}</div>
            <div class="qr-wrap">${svgHtml}</div>
            <div class="sub-tag">Print this QR code and place it at the designated location.</div>
            <div class="hint">SRKR Engineering College • Campus Adventure Quest</div>
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  function handleDownloadPng(quest) {
    const svg = document.getElementById(`admin-qr-svg-${quest.id}`)
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    canvas.width = 400
    canvas.height = 400

    img.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 20, 20, 360, 360)
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `CampusQuest-${(quest.name || quest.title).replace(/\s+/g, '')}-QR.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  // 9 Admin Navigation Items
  const adminNavItems = [
    { id: 'overview', label: 'Dashboard', icon: '🏠' },
    { id: 'quests', label: 'Quest Management', icon: '🎯' },
    { id: 'qr_codes', label: 'QR Management', icon: '🔳' },
    { id: 'events', label: 'Event Management', icon: '📅' },
    { id: 'clubs', label: 'Club Management', icon: '🏛️' },
    { id: 'interests', label: 'Student Interests', icon: '⭐' },
    { id: 'campus', label: 'Campus Information', icon: '🏫' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className="admin-shell-layout" aria-label="CampusQuest Admin Portal">
      {/* MOBILE BACKDROP */}
      {isMobileMenuOpen && (
        <div
          className="admin-mobile-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 1. ADMIN SIDEBAR (FIXED LEFT NAVIGATION) */}
      <aside className={`admin-sidebar${isMobileMenuOpen ? ' mobile-open' : ''}`} aria-label="Admin Navigation">
        <div className="admin-brand-card">
          <div className="admin-logo-mark">CQ</div>
          <div className="admin-brand-info">
            <span className="admin-app-name">CAMPUSQUEST</span>
            <span className="admin-app-role">ADMIN CONTROL</span>
          </div>
          {isMobileMenuOpen && (
            <button
              className="admin-mobile-close-btn"
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          )}
        </div>

        <nav className="admin-nav-menu">
          {adminNavItems.map((item) => {
            const isActive = activeNav === item.id

            return (
              <button
                key={item.id}
                type="button"
                className={`admin-nav-link${isActive ? ' active' : ''}`}
                onClick={() => switchNav(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {isActive && <span className="admin-active-indicator" />}
              </button>
            )
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-pill">
            <span className="admin-user-icon">👤</span>
            <div className="admin-user-text">
              <strong>{adminUser?.name || 'Administrator'}</strong>
              <small>{adminUser?.email || 'admin@srkrec.ac.in'}</small>
            </div>
          </div>

          <div className="admin-footer-actions">
            <button
              type="button"
              className="admin-secondary-btn return-portal-btn"
              onClick={onSwitchToStudent}
              title="Return to Student Portal"
            >
              🎓 Student App
            </button>
            <button
              type="button"
              className="admin-secondary-btn admin-logout-btn"
              onClick={onLogout}
              title="Sign Out"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </aside>

      {/* 2. ADMIN MAIN VIEWPORT */}
      <main className="admin-main-viewport">
        {/* STICKY TOPBAR */}
        <header className="admin-topbar no-print">
          <div className="topbar-left">
            <button
              className="admin-mobile-toggle-btn"
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              ☰
            </button>
            <div className="topbar-title-wrap">
              <span className="topbar-badge">SRKR ENGINEERING COLLEGE</span>
              <h2>Administrator Control Portal</h2>
            </div>
          </div>

          <div className="topbar-right">
            <span className="workstation-status">🟢 System Online</span>
            <button
              type="button"
              className="admin-header-action-btn"
              onClick={onSwitchToStudent}
            >
              🎓 Exit to Student App
            </button>
            <button
              type="button"
              className="admin-header-action-btn logout"
              onClick={onLogout}
            >
              🚪 Logout
            </button>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT AREA */}
        <div className="admin-scrollable-content">
          {/* ========================================================
              SECTION 1: DASHBOARD HOME (OVERVIEW ONLY)
              ======================================================== */}
          {activeNav === 'overview' && (
            <div className="admin-view-pane" aria-label="Admin Dashboard Overview">
              <div className="admin-page-header">
                <div>
                  <span className="clean-kicker">CONTROL CENTER</span>
                  <h1>ADMIN DASHBOARD</h1>
                  <p className="page-subtitle">Welcome, {adminUser?.name || 'Admin'} • Real-time campus adventure management overview.</p>
                </div>
              </div>

              {/* 4 Core Summary Cards */}
              <div className="admin-stats-overview-grid">
                <div className="admin-card admin-stat-card" onClick={() => switchNav('quests')}>
                  <span className="stat-icon">🎯</span>
                  <span className="stat-label">Total Quests</span>
                  <strong className="stat-value">{questsList.length}</strong>
                  <span className="stat-helper">Configured & active</span>
                </div>

                <div className="admin-card admin-stat-card" onClick={() => switchNav('events')}>
                  <span className="stat-icon">📅</span>
                  <span className="stat-label">Upcoming Events</span>
                  <strong className="stat-value">{eventsList.length}</strong>
                  <span className="stat-helper">Hackathons & Fests</span>
                </div>

                <div className="admin-card admin-stat-card" onClick={() => switchNav('clubs')}>
                  <span className="stat-icon">🏛️</span>
                  <span className="stat-label">Active Clubs</span>
                  <strong className="stat-value">{clubsList.length}</strong>
                  <span className="stat-helper">Technical & Cultural</span>
                </div>

                <div className="admin-card admin-stat-card" onClick={() => switchNav('analytics')}>
                  <span className="stat-icon">👥</span>
                  <span className="stat-label">Students</span>
                  <strong className="stat-value">{overallAnalytics.totalStudents}</strong>
                  <span className="stat-helper">Across all departments</span>
                </div>
              </div>

              {/* Quick Jump Shortcuts */}
              <div className="admin-card admin-summary-section">
                <h2>⚡ Quick Management Actions</h2>
                <div className="quick-actions-row">
                  <button
                    className="admin-primary-btn"
                    type="button"
                    onClick={() => {
                      switchNav('quests')
                      setIsNewQuest(true)
                      setEditingQuest({
                        name: `Quest ${questsList.length + 1}`,
                        location: 'SRKR Campus',
                        clue: '',
                        destinationName: 'SRKR Campus',
                        choices: [
                          { id: 'c1', label: 'Option 1', locationId: 'c1' },
                          { id: 'c2', label: 'Option 2', locationId: 'c2' },
                          { id: 'c3', label: 'Option 3', locationId: 'c3' },
                          { id: 'c4', label: 'Option 4', locationId: 'c4' },
                        ],
                        correctChoiceId: 'c1',
                        question: '',
                        options: ['', '', '', ''],
                        correctAnswer: '',
                        xp: 100,
                        difficulty: 'Easy',
                        qrId: `CQ-NEW-${String(questsList.length + 1).padStart(3, '0')}`,
                        verificationCode: `QUEST${questsList.length + 1}`,
                      })
                    }}
                  >
                    + Create Quest
                  </button>

                  <button
                    className="admin-secondary-btn"
                    type="button"
                    onClick={() => switchNav('qr_codes')}
                  >
                    🔳 Print QR Codes
                  </button>

                  <button
                    className="admin-secondary-btn"
                    type="button"
                    onClick={() => {
                      switchNav('events')
                      setIsNewEvent(true)
                      setEditingEvent({
                        name: '',
                        category: 'Technical',
                        date: '2026-09-01',
                        eventDate: '2026-09-01',
                        startTime: '10:00',
                        endTime: '12:00',
                        venue: 'Main Auditorium',
                        organizer: 'SRKR Engineering College',
                        description: '',
                        status: 'Upcoming Official Event',
                      })
                    }}
                  >
                    📅 Add Event
                  </button>

                  <button
                    className="admin-secondary-btn"
                    type="button"
                    onClick={() => switchNav('analytics')}
                  >
                    📊 View Analytics
                  </button>
                </div>
              </div>

              {/* Recent Activity Log */}
              <div className="admin-card admin-summary-section">
                <h2>📋 Recent System Activity</h2>
                <div className="admin-activity-list">
                  <div className="admin-activity-item">
                    <span className="activity-icon">🟢</span>
                    <div className="activity-info">
                      <strong>All {questsList.length} Quests Verified & Active</strong>
                      <small>Physical QR codes synchronized with verification engine.</small>
                    </div>
                  </div>
                  <div className="admin-activity-item">
                    <span className="activity-icon">📅</span>
                    <div className="activity-info">
                      <strong>{eventsList.length} Campus Events Live</strong>
                      <small>Schedules and reminder notifications available in student portal.</small>
                    </div>
                  </div>
                  <div className="admin-activity-item">
                    <span className="activity-icon">🏆</span>
                    <div className="activity-info">
                      <strong>Department Leaderboard Online</strong>
                      <small>{overallAnalytics.totalXpEarned.toLocaleString()} Total XP calculated across {overallAnalytics.totalStudents} active student records.</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 2: QUEST MANAGEMENT ONLY
              ======================================================== */}
          {activeNav === 'quests' && (
            <div className="admin-view-pane" aria-label="Quest Management">
              <div className="admin-page-header">
                <div>
                  <span className="clean-kicker">QUEST CONTROL</span>
                  <h1>QUEST MANAGEMENT</h1>
                  <p className="page-subtitle">Configure quest locations, clues, questions, XP awards, QR IDs, and verification codes.</p>
                </div>

                <button
                  className="admin-primary-btn"
                  type="button"
                  onClick={() => {
                    setIsNewQuest(true)
                    setEditingQuest({
                      name: `Quest ${questsList.length + 1}`,
                      location: 'SRKR Campus',
                      clue: '',
                      destinationName: 'SRKR Campus',
                      choices: [
                        { id: 'c1', label: 'Option 1', locationId: 'c1' },
                        { id: 'c2', label: 'Option 2', locationId: 'c2' },
                        { id: 'c3', label: 'Option 3', locationId: 'c3' },
                        { id: 'c4', label: 'Option 4', locationId: 'c4' },
                      ],
                      correctChoiceId: 'c1',
                      question: '',
                      options: ['', '', '', ''],
                      correctAnswer: '',
                      xp: 100,
                      difficulty: 'Easy',
                      qrId: `CQ-NEW-${String(questsList.length + 1).padStart(3, '0')}`,
                      verificationCode: `QUEST${questsList.length + 1}`,
                    })
                  }}
                >
                  + Create Quest
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Quest Name</th>
                      <th>Target Location</th>
                      <th>XP</th>
                      <th>QR ID (Admin-Only)</th>
                      <th>Verification Code</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questsList.map((q) => (
                      <tr key={q.id}>
                        <td><strong>Q{q.id}</strong></td>
                        <td><strong>{q.name || q.title}</strong></td>
                        <td>{q.location || q.destinationName}</td>
                        <td><span className="xp-tag">+{q.xp} XP</span></td>
                        <td><code>{q.qrId || q.qrCode}</code></td>
                        <td><code>{q.verificationCode}</code></td>
                        <td>
                          <span className={`status-pill ${q.enabled !== false ? 'active' : 'disabled'}`}>
                            {q.enabled !== false ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="action-cell">
                          <button
                            type="button"
                            className="table-action-btn edit"
                            onClick={() => {
                              setIsNewQuest(false)
                              setEditingQuest(q)
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="table-action-btn toggle"
                            onClick={() => handleToggleQuest(q.id)}
                          >
                            {q.enabled !== false ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            type="button"
                            className="table-action-btn delete"
                            onClick={() => handleDeleteQuest(q.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 3: QR MANAGEMENT ONLY
              ======================================================== */}
          {activeNav === 'qr_codes' && (
            <div className="admin-view-pane" aria-label="QR Management">
              <div className="admin-page-header no-print">
                <div>
                  <span className="clean-kicker">PHYSICAL VERIFICATION CODES</span>
                  <h1>QR MANAGEMENT</h1>
                  <p className="page-subtitle">
                    Admin-only portal to view, download, and print official physical QR cards for each quest location.
                  </p>
                </div>

                <button
                  className="admin-primary-btn"
                  type="button"
                  onClick={handlePrintAllQr}
                >
                  🖨️ Print All QR Codes
                </button>
              </div>

              {/* Grid of QR Cards */}
              <div className="admin-qr-grid no-print">
                {questsList.map((quest) => (
                  <article key={quest.id} className="admin-card admin-qr-card">
                    <div className="admin-card-top">
                      <span className="admin-quest-badge">{quest.name || quest.title}</span>
                      <span className="admin-place-label">📍 {quest.location || quest.destinationName}</span>
                    </div>

                    <div className="admin-qr-frame">
                      <QRCodeSVG
                        id={`admin-qr-svg-${quest.id}`}
                        value={quest.qrId || quest.qrCode || quest.qrVerificationCode}
                        size={180}
                        level="Q"
                        includeMargin={true}
                        bgColor="#ffffff"
                        fgColor="#0f172a"
                      />
                    </div>

                    <div className="admin-qr-captions">
                      <p className="qr-card-title">{quest.name || quest.title}</p>
                      <p className="qr-meta-line"><strong>Location:</strong> {quest.location || quest.destinationName}</p>
                      <p className="qr-meta-line"><strong>QR ID:</strong> <code>{quest.qrId || quest.qrCode}</code></p>
                      <p className="qr-meta-line"><strong>Verification Code:</strong> <code>{quest.verificationCode}</code></p>
                    </div>

                    <div className="admin-card-actions">
                      <button
                        className="admin-secondary-btn qr-action-btn"
                        type="button"
                        onClick={() => setPreviewQrQuest(quest)}
                      >
                        👁️ View QR
                      </button>
                      <button
                        className="admin-secondary-btn qr-action-btn"
                        type="button"
                        onClick={() => handlePrintSingleQr(quest)}
                      >
                        🖨️ Print
                      </button>
                      <button
                        className="admin-secondary-btn qr-action-btn"
                        type="button"
                        onClick={() => handleDownloadPng(quest)}
                      >
                        ⬇️ Download
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* Printable A4 Sheet for browser window.print() */}
              <div className="printable-qr-sheet print-only" aria-hidden="true">
                {questsList.map((quest) => (
                  <div key={quest.id} className="printable-qr-card-item">
                    <div className="print-card-border">
                      <div className="print-brand-tag">CAMPUSQUEST</div>
                      <h2 className="print-quest-title">{(quest.name || quest.title).toUpperCase()}</h2>
                      <div style={{ fontSize: 16, fontWeight: 700, margin: '6px 0 16px', color: '#475569' }}>
                        📍 {quest.location || quest.destinationName}
                      </div>

                      <div className="print-qr-svg-holder">
                        <QRCodeSVG
                          value={quest.qrId || quest.qrCode}
                          size={260}
                          level="Q"
                          includeMargin={true}
                          bgColor="#ffffff"
                          fgColor="#000000"
                        />
                      </div>

                      <div className="print-scan-instruction">
                        Print this QR code and place it at the designated location.
                      </div>
                      <div className="print-sub-notice">
                        SRKR Engineering College • Campus Adventure Quest
                      </div>
                    </div>
                    <div className="print-divider-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 4: EVENT MANAGEMENT ONLY
              ======================================================== */}
          {activeNav === 'events' && (
            <div className="admin-view-pane" aria-label="Event Management">
              <div className="admin-page-header">
                <div>
                  <span className="clean-kicker">EVENT CALENDAR</span>
                  <h1>EVENT MANAGEMENT</h1>
                  <p className="page-subtitle">Add, edit, and set schedules for official campus hackathons, symposiums, and festivals.</p>
                </div>

                <button
                  className="admin-primary-btn"
                  type="button"
                  onClick={() => {
                    setIsNewEvent(true)
                    setEditingEvent({
                      name: '',
                      category: 'Technical',
                      date: '2026-09-01',
                      eventDate: '2026-09-01',
                      startTime: '10:00',
                      endTime: '12:00',
                      venue: 'Main Auditorium',
                      organizer: 'SRKR Engineering College',
                      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
                      description: '',
                      status: 'Upcoming Official Event',
                    })
                  }}
                >
                  + Add Event
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}>Poster</th>
                      <th>Event Name</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Timing</th>
                      <th>Venue</th>
                      <th>Organizer</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventsList.map((ev) => {
                      const timingStatus = getEventTimingStatus(ev)
                      return (
                        <tr key={ev.id}>
                          <td>
                            <img
                              src={ev.image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'}
                              alt={ev.name}
                              style={{ width: 44, height: 32, objectFit: 'cover', borderRadius: 4, border: '1px solid #cbd5e1' }}
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'
                              }}
                            />
                          </td>
                          <td><strong>{ev.name}</strong></td>
                          <td><span className="event-cat-badge">{ev.category}</span></td>
                          <td>{formatEventDate(ev.eventDate || ev.date)}</td>
                          <td>{formatEventTime(ev.startTime, ev.endTime)}</td>
                          <td>{ev.venue || ev.location}</td>
                          <td>{ev.organizer}</td>
                          <td>
                            <span className={`status-pill ${timingStatus.color}`}>
                              {timingStatus.text}
                            </span>
                          </td>
                          <td className="action-cell">
                            <button
                              type="button"
                              className="table-action-btn edit"
                              onClick={() => {
                                setIsNewEvent(false)
                                setEditingEvent({
                                  ...ev,
                                  eventDate: ev.eventDate || (ev.date && ev.date.match(/^\d{4}-\d{2}-\d{2}$/) ? ev.date : '2026-09-01'),
                                  startTime: ev.startTime || '10:00',
                                  endTime: ev.endTime || '12:00',
                                  image: ev.image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
                                })
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="table-action-btn delete"
                              onClick={() => handleDeleteEvent(ev.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 5: CLUB MANAGEMENT ONLY
              ======================================================== */}
          {activeNav === 'clubs' && (
            <div className="admin-view-pane" aria-label="Club Management">
              <div className="admin-page-header">
                <div>
                  <span className="clean-kicker">STUDENT BODIES</span>
                  <h1>CLUB MANAGEMENT</h1>
                  <p className="page-subtitle">Configure student chapters, meeting days, timings, venues, and coordinator details.</p>
                </div>

                <button
                  className="admin-primary-btn"
                  type="button"
                  onClick={() => {
                    setIsNewClub(true)
                    setEditingClub({
                      name: '',
                      category: 'Technical',
                      icon: '🏛️',
                      shortDescription: '',
                      description: '',
                      meetingDate: '2026-09-01',
                      startTime: '16:00',
                      endTime: '17:30',
                      location: 'SRKR Campus',
                      contact: 'Faculty Coordinator',
                    })
                  }}
                >
                  + Add Club
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Club Name</th>
                      <th>Category</th>
                      <th>Meeting Day/Date</th>
                      <th>Meeting Time</th>
                      <th>Venue</th>
                      <th>Contact / Lead</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clubsList.map((c) => (
                      <tr key={c.id}>
                        <td><strong>{c.name}</strong></td>
                        <td><span className="event-cat-badge">{c.category}</span></td>
                        <td>{formatClubDate(c.meetingDate || c.meetingSchedule)}</td>
                        <td>{formatClubTime(c.startTime, c.endTime)}</td>
                        <td>{c.location}</td>
                        <td>{c.contact}</td>
                        <td className="action-cell">
                          <button
                            type="button"
                            className="table-action-btn edit"
                            onClick={() => {
                              setIsNewClub(false)
                              setEditingClub({
                                ...c,
                                meetingDate: c.meetingDate || (c.meetingSchedule && c.meetingSchedule.match(/^\d{4}-\d{2}-\d{2}$/) ? c.meetingSchedule : '2026-09-01'),
                                startTime: c.startTime || '16:00',
                                endTime: c.endTime || '17:30',
                              })
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="table-action-btn delete"
                            onClick={() => handleDeleteClub(c.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 6: CAMPUS INFORMATION ONLY
              ======================================================== */}
          {activeNav === 'campus' && (
            <div className="admin-view-pane" aria-label="Campus Information">
              <div className="admin-page-header">
                <div>
                  <span className="clean-kicker">INFRASTRUCTURE</span>
                  <h1>CAMPUS INFORMATION</h1>
                  <p className="page-subtitle">Inspect campus buildings, department blocks, and facilities integrated with Google Maps.</p>
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Facility Name</th>
                      <th>Category</th>
                      <th>Location Area</th>
                      <th>Operating Timings</th>
                      <th>Navigation Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facilitiesList.map((f) => (
                      <tr key={f.id}>
                        <td><strong>{f.name}</strong></td>
                        <td><span className="event-cat-badge">{f.category}</span></td>
                        <td>{f.location}</td>
                        <td>{f.timings || 'Standard Academic Hours'}</td>
                        <td><span className="status-pill active">✓ Maps Synced</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 7: ANALYTICS ONLY
              ======================================================== */}
          {activeNav === 'analytics' && (
            <div className="admin-view-pane" aria-label="Analytics and Statistics">
              <div className="admin-page-header">
                <div>
                  <span className="clean-kicker">CAMPUS-WIDE STATISTICS</span>
                  <h1>ANALYTICS & STUDENT RANKINGS</h1>
                  <p className="page-subtitle">Track student progress, XP distribution, department metrics, and individual registration records.</p>
                </div>
              </div>

              {/* Top Analytics Cards */}
              <div className="admin-stats-overview-grid">
                <div className="admin-card admin-stat-card">
                  <span className="stat-label">TOTAL STUDENTS</span>
                  <strong className="stat-value">{overallAnalytics.totalStudents}</strong>
                  <span className="stat-helper">Enrolled explorers</span>
                </div>

                <div className="admin-card admin-stat-card">
                  <span className="stat-label">TOTAL XP EARNED</span>
                  <strong className="stat-value">{overallAnalytics.totalXpEarned.toLocaleString()}</strong>
                  <span className="stat-helper">Points accumulated</span>
                </div>

                <div className="admin-card admin-stat-card">
                  <span className="stat-label">TOP DEPARTMENT</span>
                  <strong className="stat-value" style={{ fontSize: 22, color: '#2563eb' }}>
                    {overallAnalytics.topDepartment}
                  </strong>
                  <span className="stat-helper">{overallAnalytics.topDepartmentXp.toLocaleString()} Total XP</span>
                </div>

                <div className="admin-card admin-stat-card">
                  <span className="stat-label">TOP STUDENT (#1)</span>
                  <strong className="stat-value" style={{ fontSize: 18, color: '#b45309' }}>
                    {overallAnalytics.topStudent.name}
                  </strong>
                  <span className="stat-helper">⭐ {overallAnalytics.topStudent.xp} XP ({overallAnalytics.topStudent.department})</span>
                </div>
              </div>

              {/* Department Performance Breakdown */}
              <div className="admin-card admin-summary-section">
                <h2>📊 Department Performance Summary</h2>
                <div className="admin-table-container" style={{ marginTop: 14 }}>
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Students Enrolled</th>
                        <th>Total XP</th>
                        <th>Average XP / Student</th>
                        <th>Top Department Student</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentStats.map((ds) => (
                        <tr key={ds.department}>
                          <td><strong>{ds.department}</strong></td>
                          <td>{ds.studentsCount}</td>
                          <td><strong style={{ color: '#2563eb' }}>{ds.totalXp.toLocaleString()} XP</strong></td>
                          <td>{ds.avgXp} XP</td>
                          <td>
                            {ds.topStudentName !== '—' ? (
                              <span>👑 <strong>{ds.topStudentName}</strong> ({ds.topStudentXp} XP)</span>
                            ) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Student Rankings Directory with Filters */}
              <div className="admin-card admin-summary-section">
                <div className="admin-page-header" style={{ marginBottom: 16 }}>
                  <div>
                    <h3>👥 Student Directory & Leaderboard</h3>
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                      Filter by department, academic year, or search by student name/registration number.
                    </p>
                  </div>

                  <div className="admin-filters-toolbar">
                    <select
                      value={adminDeptFilter}
                      onChange={(e) => setAdminDeptFilter(e.target.value)}
                      className="admin-select-input"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>

                    <select
                      value={adminYearFilter}
                      onChange={(e) => setAdminYearFilter(e.target.value)}
                      className="admin-select-input"
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>

                    <input
                      type="search"
                      value={adminSearchQuery}
                      onChange={(e) => setAdminSearchQuery(e.target.value)}
                      placeholder="Search student, reg no, email..."
                      className="admin-search-input"
                    />
                  </div>
                </div>

                <div className="admin-table-container">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Overall Rank</th>
                        <th>Dept Rank</th>
                        <th>Year Rank</th>
                        <th>Student Name</th>
                        <th>Registration No</th>
                        <th>Institutional Email</th>
                        <th>Department</th>
                        <th>Year</th>
                        <th style={{ textAlign: 'right' }}>XP Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminRankedStudents.length === 0 ? (
                        <tr>
                          <td colSpan={9} style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>
                            No students match the selected filter criteria.
                          </td>
                        </tr>
                      ) : (
                        adminRankedStudents.map((st) => (
                          <tr key={st.registrationNumber}>
                            <td>
                              <strong style={{ color: st.overallRank <= 3 ? '#b45309' : '#0f172a' }}>
                                #{st.overallRank}
                              </strong>
                            </td>
                            <td>#{st.departmentRank}</td>
                            <td>#{st.yearRank}</td>
                            <td><strong>{st.name}</strong></td>
                            <td><code>{st.registrationNumber}</code></td>
                            <td><small>{st.email}</small></td>
                            <td><span className="event-cat-badge">{st.department || st.branch}</span></td>
                            <td>{st.year}</td>
                            <td style={{ textAlign: 'right' }}>
                              <strong style={{ color: '#2563eb' }}>{st.xp} XP</strong>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 8: SETTINGS ONLY
              ======================================================== */}
          {activeNav === 'settings' && (
            <div className="admin-view-pane" aria-label="System Settings">
              <div className="admin-page-header">
                <div>
                  <span className="clean-kicker">CONFIGURATION</span>
                  <h1>SETTINGS</h1>
                  <p className="page-subtitle">Manage administrator credentials, application environment, and system storage.</p>
                </div>
              </div>

              <div className="admin-settings-grid">
                {/* Admin Profile Card */}
                <div className="admin-card">
                  <h3>👤 Administrator Profile</h3>
                  <div className="settings-field-row">
                    <span className="settings-field-label">Admin Name:</span>
                    <strong className="settings-field-val">{adminUser?.name || 'Administrator'}</strong>
                  </div>
                  <div className="settings-field-row">
                    <span className="settings-field-label">Institutional Email:</span>
                    <strong className="settings-field-val">{adminUser?.email || 'admin@srkrec.ac.in'}</strong>
                  </div>
                  <div className="settings-field-row">
                    <span className="settings-field-label">Access Role:</span>
                    <span className="status-pill active">Super Admin (Full Access)</span>
                  </div>
                  <div className="settings-field-row">
                    <span className="settings-field-label">Institution:</span>
                    <strong className="settings-field-val">SRKR Engineering College, Bhimavaram</strong>
                  </div>
                </div>

                {/* System Configuration Card */}
                <div className="admin-card">
                  <h3>⚙️ Application Environment</h3>
                  <div className="settings-field-row">
                    <span className="settings-field-label">Application:</span>
                    <strong className="settings-field-val">CampusQuest v2.0</strong>
                  </div>
                  <div className="settings-field-row">
                    <span className="settings-field-label">Engine:</span>
                    <strong className="settings-field-val">Autonomous Quest Engine</strong>
                  </div>
                  <div className="settings-field-row">
                    <span className="settings-field-label">QR Security:</span>
                    <span className="status-pill active">Admin Verification Active</span>
                  </div>
                  <div className="settings-field-row">
                    <span className="settings-field-label">Local Storage Sync:</span>
                    <span className="status-pill active">Active & Persisted</span>
                  </div>
                </div>

                {/* Storage & Portal Actions */}
                <div className="admin-card admin-full-span-card">
                  <h3>🗄️ Portal Actions & Storage Maintenance</h3>
                  <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
                    Quickly switch portals or reset local mock data back to factory defaults.
                  </p>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="admin-primary-btn"
                      onClick={onSwitchToStudent}
                    >
                      🎓 Open Student Application Portal
                    </button>
                    <button
                      type="button"
                      className="admin-secondary-btn"
                      onClick={() => {
                        if (window.confirm('Reset all quests, events, and clubs back to initial defaults?')) {
                          localStorage.removeItem(ADMIN_QUESTS_KEY)
                          localStorage.removeItem(ADMIN_EVENTS_KEY)
                          localStorage.removeItem(ADMIN_CLUBS_KEY)
                          localStorage.removeItem(ADMIN_FACILITIES_KEY)
                          setQuestsList(initialQuests)
                          setEventsList(initialEvents)
                          setClubsList(initialClubs)
                          setFacilitiesList(initialFacilities)
                          alert('Reset to initial defaults complete!')
                        }
                      }}
                    >
                      🔄 Reset Custom Data to Factory Defaults
                    </button>
                    <button
                      type="button"
                      className="admin-secondary-btn logout-action"
                      onClick={onLogout}
                    >
                      🚪 Sign Out of Admin
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION: STUDENT INTERESTS (ISOLATED INTEREST DIRECTORY)
              ======================================================== */}
          {activeNav === 'interests' && (
            <div className="admin-view-pane" aria-label="Student Interests Directory">
              <div className="admin-page-header">
                <div>
                  <span className="clean-kicker">INTEREST DIRECTORY</span>
                  <h1>STUDENT INTERESTS</h1>
                  <p className="page-subtitle">Track and filter student interest submissions across technical clubs, societies, and campus initiatives.</p>
                </div>
                <button
                  className="admin-secondary-btn"
                  type="button"
                  onClick={() => setStudentInterestsList(getAllStudentInterests())}
                  title="Refresh Interests Data"
                >
                  🔄 Refresh Data
                </button>
              </div>

              {/* 3 Summary Stat Cards */}
              <div className="admin-stats-overview-grid">
                <div className="admin-card admin-stat-card">
                  <span className="stat-icon">⭐</span>
                  <span className="stat-label">Total Submissions</span>
                  <strong className="stat-value">{studentInterestsList.length}</strong>
                  <span className="stat-helper">Active student records</span>
                </div>

                <div className="admin-card admin-stat-card">
                  <span className="stat-icon">🏛️</span>
                  <span className="stat-label">Unique Interests</span>
                  <strong className="stat-value">{Math.max(0, availableInterestTopics.length - 1)}</strong>
                  <span className="stat-helper">Clubs & initiatives</span>
                </div>

                <div className="admin-card admin-stat-card">
                  <span className="stat-icon">🎓</span>
                  <span className="stat-label">Departments</span>
                  <strong className="stat-value">
                    {new Set(studentInterestsList.map((s) => s.branch)).size}
                  </strong>
                  <span className="stat-helper">Participating branches</span>
                </div>
              </div>

              {/* Filters Toolbar */}
              <div className="admin-card admin-filters-toolbar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  type="search"
                  className="admin-search-input"
                  placeholder="🔍 Search name, reg no, or interest..."
                  value={interestSearchQuery}
                  onChange={(e) => setInterestSearchQuery(e.target.value)}
                  style={{ minWidth: '260px', flex: 1 }}
                />

                <select
                  className="admin-select-input"
                  value={interestTopicFilter}
                  onChange={(e) => setInterestTopicFilter(e.target.value)}
                  aria-label="Filter by interest"
                >
                  {availableInterestTopics.map((topic) => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>

                <select
                  className="admin-select-input"
                  value={interestDeptFilter}
                  onChange={(e) => setInterestDeptFilter(e.target.value)}
                  aria-label="Filter by department"
                >
                  <option value="All Departments">All Departments</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                {(interestSearchQuery || interestTopicFilter !== 'All Interests' || interestDeptFilter !== 'All Departments') && (
                  <button
                    className="admin-secondary-btn"
                    type="button"
                    onClick={() => {
                      setInterestSearchQuery('')
                      setInterestTopicFilter('All Interests')
                      setInterestDeptFilter('All Departments')
                    }}
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* Data Table */}
              <div className="admin-table-container">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Reg. Number</th>
                      <th>Department</th>
                      <th>Year</th>
                      <th>Selected Interests</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudentInterests.length > 0 ? (
                      filteredStudentInterests.map((rec, idx) => (
                        <tr key={rec.studentId || rec.registrationNumber || idx}>
                          <td>
                            <strong>{rec.studentName}</strong>
                          </td>
                          <td>
                            <code>{rec.registrationNumber}</code>
                          </td>
                          <td>
                            <span className="mini-chip" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700 }}>
                              {rec.branch || 'AI & ML'}
                            </span>
                          </td>
                          <td>{rec.year || '2nd Year'}</td>
                          <td>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '400px' }}>
                              {Array.isArray(rec.interests) && rec.interests.length > 0 ? (
                                rec.interests.map((interest, i) => (
                                  <span
                                    key={i}
                                    style={{
                                      backgroundColor: '#ecfdf5',
                                      color: '#065f46',
                                      border: '1px solid #a7f3d0',
                                      padding: '2px 8px',
                                      borderRadius: '12px',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                    }}
                                  >
                                    ⭐ {interest}
                                  </span>
                                ))
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>No interests selected</span>
                              )}
                            </div>
                          </td>
                          <td style={{ color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>
                            {rec.updatedAt ? new Date(rec.updatedAt).toLocaleDateString() : 'Recent'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                          No student interest records match the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* VIEW QR MODAL */}
      {previewQrQuest && (
        <div className="admin-modal-backdrop" role="presentation">
          <div className="admin-card admin-form-modal" role="dialog" aria-modal="true">
            <div className="modal-header-row">
              <h3>🔳 QR Preview — {previewQrQuest.name || previewQrQuest.title}</h3>
              <button className="admin-close-btn" type="button" onClick={() => setPreviewQrQuest(null)}>✕</button>
            </div>

            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                <QRCodeSVG
                  value={previewQrQuest.qrId || previewQrQuest.qrCode || previewQrQuest.qrVerificationCode}
                  size={220}
                  level="Q"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                />
              </div>
              <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800 }}>{previewQrQuest.name || previewQrQuest.title}</p>
              <p style={{ margin: '0 0 6px', fontSize: 13, color: '#64748b' }}>📍 {previewQrQuest.location || previewQrQuest.destinationName}</p>
              <p style={{ margin: '0 0 4px', fontSize: 13, color: '#2563eb' }}><strong>QR Code:</strong> <code>{previewQrQuest.qrId || previewQrQuest.qrCode}</code></p>
              <p style={{ margin: '0 0 16px', fontSize: 13, color: '#059669' }}><strong>Verification Code:</strong> <code>{previewQrQuest.verificationCode}</code></p>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button
                  className="admin-secondary-btn"
                  type="button"
                  onClick={() => {
                    handlePrintSingleQr(previewQrQuest)
                    setPreviewQrQuest(null)
                  }}
                >
                  🖨️ Print QR Card
                </button>
                <button
                  className="admin-secondary-btn"
                  type="button"
                  onClick={() => {
                    handleDownloadPng(previewQrQuest)
                    setPreviewQrQuest(null)
                  }}
                >
                  ⬇️ Download PNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {editingEvent && (
        <div className="admin-modal-backdrop" role="presentation">
          <div className="admin-card admin-form-modal" role="dialog" aria-modal="true">
            <div className="modal-header-row">
              <h3>{isNewEvent ? 'Create New Event' : 'Edit Event'}</h3>
              <button className="admin-close-btn" type="button" onClick={() => setEditingEvent(null)}>✕</button>
            </div>

            <form onSubmit={handleSaveEvent} className="admin-edit-form">
              <div className="auth-field-group">
                <label>Event Name</label>
                <input
                  type="text"
                  value={editingEvent.name || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                  placeholder="e.g. HackOverflow Hackathon"
                  required
                />
              </div>

              <div className="form-2col-row">
                <div className="auth-field-group">
                  <label>Category</label>
                  <select
                    value={editingEvent.category || 'Technical'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                  >
                    {EVENT_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="auth-field-group">
                  <label>Location / Venue</label>
                  <input
                    type="text"
                    value={editingEvent.venue || editingEvent.location || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value, location: e.target.value })}
                    placeholder="e.g. Main Auditorium"
                    required
                  />
                </div>
              </div>

              <div className="form-3col-row">
                <div className="auth-field-group">
                  <label>Event Date</label>
                  <input
                    type="date"
                    value={editingEvent.eventDate || editingEvent.date || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, eventDate: e.target.value, date: e.target.value })}
                    required
                  />
                </div>

                <div className="auth-field-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={editingEvent.startTime || '10:00'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, startTime: e.target.value })}
                    required
                  />
                </div>

                <div className="auth-field-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={editingEvent.endTime || '12:00'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <label>Organizer / Department / Club</label>
                <input
                  type="text"
                  value={editingEvent.organizer || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, organizer: e.target.value })}
                  placeholder="e.g. AI & ML Club"
                  required
                />
              </div>

              <div className="auth-field-group">
                <label>Event Poster Image URL</label>
                <input
                  type="url"
                  value={editingEvent.image || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="auth-field-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={editingEvent.description || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  placeholder="Enter event details and agenda..."
                  required
                />
              </div>

              <div className="modal-actions-row">
                <button className="admin-secondary-btn" type="button" onClick={() => setEditingEvent(null)}>
                  Cancel
                </button>
                <button className="admin-primary-btn" type="submit">
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CLUB MODAL */}
      {editingClub && (
        <div className="admin-modal-backdrop" role="presentation">
          <div className="admin-card admin-form-modal" role="dialog" aria-modal="true">
            <div className="modal-header-row">
              <h3>{isNewClub ? 'Create New Club' : 'Edit Club'}</h3>
              <button className="admin-close-btn" type="button" onClick={() => setEditingClub(null)}>✕</button>
            </div>

            <form onSubmit={handleSaveClub} className="admin-edit-form">
              <div className="auth-field-group">
                <label>Club Name</label>
                <input
                  type="text"
                  value={editingClub.name || ''}
                  onChange={(e) => setEditingClub({ ...editingClub, name: e.target.value })}
                  placeholder="e.g. AI & ML Club"
                  required
                />
              </div>

              <div className="form-2col-row">
                <div className="auth-field-group">
                  <label>Category</label>
                  <select
                    value={editingClub.category || 'Technical'}
                    onChange={(e) => setEditingClub({ ...editingClub, category: e.target.value })}
                  >
                    {CLUB_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="auth-field-group">
                  <label>Meeting Venue</label>
                  <input
                    type="text"
                    value={editingClub.location || ''}
                    onChange={(e) => setEditingClub({ ...editingClub, location: e.target.value })}
                    placeholder="e.g. AI & ML Department"
                    required
                  />
                </div>
              </div>

              <div className="form-3col-row">
                <div className="auth-field-group">
                  <label>Meeting Date</label>
                  <input
                    type="date"
                    value={editingClub.meetingDate || ''}
                    onChange={(e) => setEditingClub({ ...editingClub, meetingDate: e.target.value })}
                    required
                  />
                </div>

                <div className="auth-field-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={editingClub.startTime || '16:00'}
                    onChange={(e) => setEditingClub({ ...editingClub, startTime: e.target.value })}
                    required
                  />
                </div>

                <div className="auth-field-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={editingClub.endTime || '17:30'}
                    onChange={(e) => setEditingClub({ ...editingClub, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <label>Faculty Coordinator / Student Lead</label>
                <input
                  type="text"
                  value={editingClub.contact || ''}
                  onChange={(e) => setEditingClub({ ...editingClub, contact: e.target.value })}
                  placeholder="e.g. Dr. Faculty Coordinator"
                />
              </div>

              <div className="auth-field-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={editingClub.description || editingClub.shortDescription || ''}
                  onChange={(e) => setEditingClub({ ...editingClub, description: e.target.value })}
                  placeholder="Enter club mission and activities..."
                  required
                />
              </div>

              <div className="modal-actions-row">
                <button className="admin-secondary-btn" type="button" onClick={() => setEditingClub(null)}>
                  Cancel
                </button>
                <button className="admin-primary-btn" type="submit">
                  Save Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT QUEST MODAL */}
      {editingQuest && (
        <div className="admin-modal-backdrop" role="presentation">
          <div className="admin-card admin-form-modal" role="dialog" aria-modal="true">
            <div className="modal-header-row">
              <h3>{isNewQuest ? 'Create New Quest' : `Edit Quest ${editingQuest.id}`}</h3>
              <button className="admin-close-btn" type="button" onClick={() => setEditingQuest(null)}>✕</button>
            </div>

            <form onSubmit={handleSaveQuest} className="admin-edit-form">
              <div className="form-2col-row">
                <div className="auth-field-group">
                  <label>Quest Name</label>
                  <input
                    type="text"
                    value={editingQuest.name || editingQuest.title || ''}
                    onChange={(e) => setEditingQuest({ ...editingQuest, name: e.target.value, title: e.target.value })}
                    required
                  />
                </div>

                <div className="auth-field-group">
                  <label>Target Location</label>
                  <input
                    type="text"
                    value={editingQuest.location || editingQuest.destinationName || ''}
                    onChange={(e) => setEditingQuest({ ...editingQuest, location: e.target.value, destinationName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-3col-row">
                <div className="auth-field-group">
                  <label>XP Award</label>
                  <input
                    type="number"
                    value={editingQuest.xp || 100}
                    onChange={(e) => setEditingQuest({ ...editingQuest, xp: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="auth-field-group">
                  <label>QR ID (Admin-Only)</label>
                  <input
                    type="text"
                    value={editingQuest.qrId || editingQuest.qrCode || ''}
                    onChange={(e) => setEditingQuest({ ...editingQuest, qrId: e.target.value, qrCode: e.target.value })}
                    required
                  />
                </div>

                <div className="auth-field-group">
                  <label>Verification Code</label>
                  <input
                    type="text"
                    value={editingQuest.verificationCode || ''}
                    onChange={(e) => setEditingQuest({ ...editingQuest, verificationCode: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <label>Clue Description</label>
                <textarea
                  rows={2}
                  value={editingQuest.clue || ''}
                  onChange={(e) => setEditingQuest({ ...editingQuest, clue: e.target.value })}
                  required
                />
              </div>

              <div className="auth-field-group">
                <label>Question 2 (Factual Knowledge)</label>
                <input
                  type="text"
                  value={editingQuest.question || ''}
                  onChange={(e) => setEditingQuest({ ...editingQuest, question: e.target.value })}
                  required
                />
              </div>

              <div className="auth-field-group">
                <label>Correct Answer</label>
                <input
                  type="text"
                  value={editingQuest.correctAnswer || ''}
                  onChange={(e) => setEditingQuest({ ...editingQuest, correctAnswer: e.target.value })}
                  required
                />
              </div>

              <div className="modal-actions-row">
                <button className="admin-secondary-btn" type="button" onClick={() => setEditingQuest(null)}>
                  Cancel
                </button>
                <button className="admin-primary-btn" type="submit">
                  Save Quest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
