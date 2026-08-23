import { useEffect, useState } from 'react'
import './App.css'
import Dashboard from './components/Dashboard.jsx'
import CollegeHistoryPage from './components/CollegeHistoryPage.jsx'
import ExplorePage from './components/ExplorePage.jsx'
import LeaderboardPage from './components/LeaderboardPage.jsx'
import EventsPage from './components/EventsPage.jsx'
import ClubsPage from './components/ClubsPage.jsx'
import CampusFacilitiesPage from './components/CampusFacilitiesPage.jsx'
import ProfilePage from './components/ProfilePage.jsx'
import QuestDetails from './components/QuestDetails.jsx'
import StudentLoginPage from './components/StudentLoginPage.jsx'
import StudentRegisterPage from './components/StudentRegisterPage.jsx'
import AdminLoginPage from './components/AdminLoginPage.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import AnimatedGameBackground from './components/AnimatedGameBackground.jsx'
import { loadData, saveData, saveLastNotifiedLevel } from './utils/storage.js'
import { getAuthSession, clearAuthSession, syncStudentProgressToCentralDb } from './utils/authService.js'
import { getAdminSession, logoutAdmin } from './utils/adminAuthService.js'
import { getPlayerLevel } from './utils/gameLevels.js'

function App() {
  // Mobile Drawer State
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  // Portal Mode: 'student' | 'admin'
  const [portalMode, setPortalMode] = useState(() => {
    if (window.location.pathname.startsWith('/admin') || window.location.hash.startsWith('#/admin')) {
      return 'admin'
    }
    return 'student'
  })

  // Student Auth Subview: 'login' | 'register'
  const [studentAuthView, setStudentAuthView] = useState(() => {
    if (window.location.pathname.includes('/register') || window.location.hash.includes('/register')) {
      return 'register'
    }
    return 'login'
  })

  const [authSuccessNotice, setAuthSuccessNotice] = useState('')

  // Auth Sessions
  const [studentSession, setStudentSession] = useState(getAuthSession)
  const [adminSession, setAdminSession] = useState(getAdminSession)

  // Student Navigation state: 'home' | 'history' | 'quests' | 'leaderboard' | 'events' | 'clubs' | 'campus' | 'profile'
  const [studentTab, setStudentTab] = useState(() => {
    const path = (window.location.pathname + window.location.hash).toLowerCase()
    if (path.includes('history')) return 'history'
    if (path.includes('quests') || path.includes('explore')) return 'quests'
    if (path.includes('leaderboard')) return 'leaderboard'
    if (path.includes('events')) return 'events'
    if (path.includes('clubs')) return 'clubs'
    if (path.includes('campus') || path.includes('facilities')) return 'campus'
    if (path.includes('profile')) return 'profile'
    return 'home' // Default route is Dashboard/Home
  })
  const [selectedQuest, setSelectedQuest] = useState(null)

  // URL listener
  useEffect(() => {
    function handleLocationChange() {
      const path = (window.location.pathname + window.location.hash).toLowerCase()
      if (path.includes('admin')) {
        setPortalMode('admin')
      } else {
        setPortalMode('student')
        if (path.includes('register')) {
          setStudentAuthView('register')
        } else if (path.includes('history')) {
          setStudentTab('history')
          setSelectedQuest(null)
        } else if (path.includes('quests') || path.includes('explore')) {
          setStudentTab('quests')
          setSelectedQuest(null)
        } else if (path.includes('leaderboard')) {
          setStudentTab('leaderboard')
          setSelectedQuest(null)
        } else if (path.includes('events')) {
          setStudentTab('events')
          setSelectedQuest(null)
        } else if (path.includes('clubs')) {
          setStudentTab('clubs')
          setSelectedQuest(null)
        } else if (path.includes('campus') || path.includes('facilities')) {
          setStudentTab('campus')
          setSelectedQuest(null)
        } else if (path.includes('profile')) {
          setStudentTab('profile')
          setSelectedQuest(null)
        } else {
          // Default fallback route is Dashboard/Home
          setStudentTab('home')
          setSelectedQuest(null)
        }
      }
    }

    window.addEventListener('hashchange', handleLocationChange)
    window.addEventListener('popstate', handleLocationChange)
    return () => {
      window.removeEventListener('hashchange', handleLocationChange)
      window.removeEventListener('popstate', handleLocationChange)
    }
  }, [])

  // Student Data
  const [student, setStudent] = useState(() => {
    const activeSession = getAuthSession()
    if (!activeSession) return null
    const saved = loadData()
    if (saved && (saved.registrationNumber === activeSession.registrationNumber || saved.email === activeSession.email)) {
      return {
        ...saved,
        studentName: activeSession.studentName || saved.studentName || 'AVINASH',
        registrationNumber: activeSession.registrationNumber || saved.registrationNumber || '24B91A6101',
        email: activeSession.email || saved.email || 'avinash@srkrec.ac.in',
        branch: activeSession.branch || saved.branch || 'AI & ML',
        year: activeSession.year || saved.year || '2nd Year',
      }
    }
    return {
      email: activeSession.email || 'avinash@srkrec.ac.in',
      registrationNumber: activeSession.registrationNumber || '24B91A6101',
      studentName: activeSession.studentName || activeSession.displayName || 'AVINASH',
      mobileNumber: activeSession.mobileNumber || '',
      branch: activeSession.branch || 'AI & ML',
      year: activeSession.year || '2nd Year',
      isVerified: true,
      xp: typeof activeSession.xp === 'number' ? activeSession.xp : 0,
      completedQuests: Array.isArray(activeSession.completedQuests) ? activeSession.completedQuests : (activeSession.completed_quests || []),
      badges: activeSession.badges || [],
      xpHistory: activeSession.xpHistory || [],
      questProgress: activeSession.questProgress || {},
      achievements: activeSession.achievements || [],
      uploadedProofs: activeSession.uploadedProofs || {},
      reminders: activeSession.reminders || [],
    }
  })

  function handleStudentLoginSuccess(authenticatedUser) {
    setStudentSession(authenticatedUser)

    const saved = loadData()
    if (saved && (saved.registrationNumber === authenticatedUser.registrationNumber || saved.email === authenticatedUser.email)) {
      const updatedSaved = {
        ...saved,
        studentName: authenticatedUser.studentName || saved.studentName || 'AVINASH',
        registrationNumber: authenticatedUser.registrationNumber || saved.registrationNumber,
        email: authenticatedUser.email || saved.email,
        branch: authenticatedUser.branch || saved.branch,
        year: authenticatedUser.year || saved.year,
        xp: typeof authenticatedUser.xp === 'number' ? authenticatedUser.xp : (saved.xp || 0),
        completedQuests: Array.isArray(authenticatedUser.completedQuests) ? authenticatedUser.completedQuests : (saved.completedQuests || []),
      }
      saveData(updatedSaved)
      setStudent(updatedSaved)
    } else {
      const newStudent = {
        email: authenticatedUser.email,
        registrationNumber: authenticatedUser.registrationNumber || '24B91A6101',
        studentName: authenticatedUser.studentName || authenticatedUser.displayName || 'AVINASH',
        mobileNumber: authenticatedUser.mobileNumber || '',
        branch: authenticatedUser.branch || 'AI & ML',
        year: authenticatedUser.year || '2nd Year',
        isVerified: true,
        xp: typeof authenticatedUser.xp === 'number' ? authenticatedUser.xp : 0,
        completedQuests: Array.isArray(authenticatedUser.completedQuests) ? authenticatedUser.completedQuests : [],
        badges: authenticatedUser.badges || [],
        xpHistory: authenticatedUser.xpHistory || [],
        questProgress: authenticatedUser.questProgress || {},
        achievements: authenticatedUser.achievements || [],
        uploadedProofs: authenticatedUser.uploadedProofs || {},
        reminders: authenticatedUser.reminders || [],
      }
      saveData(newStudent)
      saveLastNotifiedLevel(1)
      setStudent(newStudent)
    }
    setStudentTab('home')
    setSelectedQuest(null)
    setAuthSuccessNotice('')
    window.location.hash = '#/home'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleRegistrationSuccess(message) {
    setAuthSuccessNotice(message || 'Account created successfully. Please log in with your credentials.')
    setStudentAuthView('login')
  }

  function handleStudentUpdate(updatedStudent) {
    saveData(updatedStudent)
    setStudent(updatedStudent)
    syncStudentProgressToCentralDb(updatedStudent)
  }

  function handleUpdateReminders(updatedReminders) {
    const updated = { ...student, reminders: updatedReminders }
    saveData(updated)
    setStudent(updated)
    syncStudentProgressToCentralDb(updated)
  }

  function handleResetStudentProgress() {
    if (!student) return
    const resetStudent = {
      ...student,
      xp: 0,
      completedQuests: [],
      badges: [],
      xpHistory: [],
      questProgress: {},
      uploadedProofs: {},
      achievements: [],
      reminders: [],
    }
    saveData(resetStudent)
    saveLastNotifiedLevel(1)
    setStudent(resetStudent)
    syncStudentProgressToCentralDb(resetStudent)
    setStudentTab('home')
  }

  function handleStudentLogout() {
    clearAuthSession()
    setStudentSession(null)
    setStudent(null)
    setSelectedQuest(null)
    setStudentAuthView('login')
    setAuthSuccessNotice('')
  }

  function handleAdminLoginSuccess(adminUser) {
    setAdminSession(adminUser)
    setPortalMode('admin')
  }

  function handleAdminLogout() {
    logoutAdmin()
    setAdminSession(null)
    setPortalMode('student')
  }

  // ==========================================
  // RENDER: ADMIN PORTAL MODE
  // ==========================================
  if (portalMode === 'admin') {
    if (!adminSession) {
      return (
        <>
          <AnimatedGameBackground />
          <AdminLoginPage
            onAdminLoginSuccess={handleAdminLoginSuccess}
            onSwitchToStudent={() => setPortalMode('student')}
          />
        </>
      )
    }

    return (
      <>
        <AnimatedGameBackground />
        <AdminDashboard
          adminUser={adminSession}
          onLogout={handleAdminLogout}
          onSwitchToStudent={() => setPortalMode('student')}
        />
      </>
    )
  }

  // ==========================================
  // RENDER: STUDENT AUTH (REGISTER / LOGIN)
  // ==========================================
  if (!studentSession || !student) {
    if (studentAuthView === 'register') {
      return (
        <>
          <AnimatedGameBackground />
          <StudentRegisterPage
            onGoToLogin={() => {
              setStudentAuthView('login')
              setAuthSuccessNotice('')
            }}
            onRegistrationSuccess={handleRegistrationSuccess}
          />
        </>
      )
    }

    return (
      <>
        <AnimatedGameBackground />
        <StudentLoginPage
          onLoginSuccess={handleStudentLoginSuccess}
          onGoToRegister={() => {
            setStudentAuthView('register')
            setAuthSuccessNotice('')
          }}
          onSwitchToAdmin={() => setPortalMode('admin')}
          successMessage={authSuccessNotice}
        />
      </>
    )
  }

  // ==========================================
  // RENDER: DEDICATED FULL-SCREEN QUEST VIEW
  // ==========================================
  if (selectedQuest) {
    return (
      <>
        <AnimatedGameBackground />
        <QuestDetails
          quest={selectedQuest}
          student={student}
          onStudentUpdate={handleStudentUpdate}
          onBack={() => setSelectedQuest(null)}
        />
      </>
    )
  }

  // ==========================================
  // RENDER: FULL DESKTOP WEB APPLICATION
  // (16:9 Full Viewport Layout with Left Sidebar & Top Header)
  // ==========================================
  const xp = Math.max(0, Number(student?.xp) || 0)
  const currentLevel = getPlayerLevel(xp)
  const studentName = student?.studentName || student?.name || 'AVINASH'
  const studentInitial = studentName.charAt(0).toUpperCase()
  const remindersCount = Array.isArray(student?.reminders) ? student.reminders.length : 0

  // 8 Student Navigation Items in Exact Order
  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'history', label: 'College History', icon: '📜' },
    { id: 'quests', label: 'Quests', icon: '🗺️' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'clubs', label: 'Clubs', icon: '🏛️' },
    { id: 'campus', label: 'Campus', icon: '🏫' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <div className="desktop-app-layout">
      {/* AMBIENT LIGHT GREEN NEON GAMING BACKGROUND */}
      <AnimatedGameBackground />

      {/* MOBILE DRAWER OVERLAY */}
      {isMobileDrawerOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setIsMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 1. FIXED LEFT SIDEBAR (WIDTH: 260px, COLOUR: #0B1F3A) */}
      <aside
        className={`desktop-sidebar${isMobileDrawerOpen ? ' mobile-drawer-open' : ''}`}
        aria-label="Desktop Sidebar Navigation"
      >
        {/* Brand Header */}
        <div className="sidebar-brand-header">
          <div className="sidebar-brand-logo">CQ</div>
          <div className="sidebar-brand-text">
            <span className="brand-title">CAMPUSQUEST</span>
            <small className="brand-subtitle">SRKR Campus Adventure</small>
          </div>
          {isMobileDrawerOpen && (
            <button
              className="drawer-close-btn"
              type="button"
              onClick={() => setIsMobileDrawerOpen(false)}
              aria-label="Close Navigation"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav-list" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = studentTab === item.id

            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav-item${isActive ? ' active' : ''}`}
                onClick={() => {
                  setSelectedQuest(null)
                  setStudentTab(item.id)
                  setIsMobileDrawerOpen(false)
                  window.location.hash = `#/${item.id}`
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.label}</span>
                {isActive && <span className="active-glow-pill" />}
              </button>
            )
          })}
        </nav>

        {/* Sidebar Bottom Student Passport Info */}
        <div className="sidebar-bottom-card">
          <div className="sidebar-user-avatar">{studentInitial}</div>
          <div className="sidebar-user-details">
            <strong>{studentName}</strong>
            <span>{student?.branch || 'AI & ML'} • {student?.registrationNumber || '24B91A6101'}</span>
          </div>
          <button
            className="sidebar-logout-btn"
            type="button"
            onClick={handleStudentLogout}
            title="Log Out"
            aria-label="Log Out"
          >
            🚪
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA (FILLING ENTIRE DESKTOP 16:9 VIEWPORT) */}
      <div className="desktop-main-wrapper">
        {/* TOP HEADER */}
        <header className="desktop-top-header">
          <div className="top-header-left">
            {/* Mobile Hamburger Toggle Button */}
            <button
              className="mobile-hamburger-btn"
              type="button"
              onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
              aria-label="Toggle Menu"
            >
              <span className="ham-line" />
              <span className="ham-line" />
              <span className="ham-line" />
            </button>

            <div className="page-breadcrumb">
              <span className="bc-brand">CAMPUSQUEST</span>
              <span className="bc-sep">/</span>
              <span className="bc-current">{studentTab.toUpperCase()}</span>
            </div>
          </div>

          <div className="top-header-right">
            {/* Level Tag */}
            <div className="header-level-pill">
              <span>Level {currentLevel.level} • {currentLevel.name}</span>
            </div>

            {/* XP Counter Pill */}
            <div className="header-xp-pill">
              <span className="xp-star-spin">⭐</span>
              <strong>{xp} XP</strong>
            </div>

            {/* Notifications Button */}
            <button
              className="header-bell-btn"
              type="button"
              onClick={() => setStudentTab('profile')}
              title="My Reminders"
              aria-label="My Reminders"
            >
              <span className="bell-icon">🔔</span>
              {remindersCount > 0 && <span className="bell-badge-count">{remindersCount}</span>}
            </button>

            {/* Profile Avatar Button */}
            <button
              className="header-user-btn"
              type="button"
              onClick={() => setStudentTab('profile')}
              title="View Profile"
              aria-label="View Profile"
            >
              <div className="header-avatar-circle">{studentInitial}</div>
              <span className="header-username">{studentName}</span>
            </button>
          </div>
        </header>

        {/* SCROLLABLE DESKTOP VIEWPORT */}
        <main className="desktop-content-viewport">
          {studentTab === 'home' && (
            <Dashboard
              student={student}
              onSelectQuest={setSelectedQuest}
              onNavigateTab={setStudentTab}
            />
          )}

          {studentTab === 'history' && (
            <CollegeHistoryPage
              onNavigateTab={setStudentTab}
              onSelectQuest={setSelectedQuest}
            />
          )}

          {studentTab === 'quests' && (
            <ExplorePage
              student={student}
              onSelectQuest={setSelectedQuest}
              onBack={() => setStudentTab('home')}
            />
          )}

          {studentTab === 'leaderboard' && (
            <LeaderboardPage
              student={student}
            />
          )}

          {studentTab === 'events' && (
            <EventsPage
              student={student}
              onUpdateReminders={handleUpdateReminders}
            />
          )}

          {studentTab === 'clubs' && (
            <ClubsPage student={student} />
          )}

          {studentTab === 'campus' && (
            <CampusFacilitiesPage />
          )}

          {studentTab === 'profile' && (
            <ProfilePage
              student={student}
              onResetProgress={handleResetStudentProgress}
              onLogout={handleStudentLogout}
              onUpdateReminders={handleUpdateReminders}
              onNavigateTab={setStudentTab}
              onSwitchToAdmin={() => setPortalMode('admin')}
            />
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAV (FOR QUICK MOBILE ACCESS) */}
      <nav className="mobile-only-bottom-nav" aria-label="Bottom Navigation">
        {navItems.map((item) => {
          const isActive = studentTab === item.id

          return (
            <button
              key={item.id}
              type="button"
              className={`bottom-nav-item${isActive ? ' active' : ''}`}
              onClick={() => {
                setSelectedQuest(null)
                setStudentTab(item.id)
                window.location.hash = `#/${item.id}`
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span className="nav-item-label">{item.label}</span>
              {isActive && <span className="nav-indicator-dot" />}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default App
