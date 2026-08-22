import { useState, useMemo, useEffect } from 'react'
import {
  DEPARTMENTS,
  YEARS,
  getAllLeaderboardStudents,
  fetchCentralLeaderboard,
  rankStudents,
  getStudentRanks,
  normalizeDepartment,
} from '../utils/leaderboardService.js'

function LeaderboardPage({ student }) {
  const [activeTab, setActiveTab] = useState('overall') // 'overall' | 'departments'
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments')
  const [selectedYear, setSelectedYear] = useState('All Years')
  const [searchQuery, setSearchQuery] = useState('')
  const [centralStudents, setCentralStudents] = useState(() => getAllLeaderboardStudents(student))
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 1. Fetch live central database students cohort
  useEffect(() => {
    let isMounted = true
    setIsRefreshing(true)
    fetchCentralLeaderboard(student)
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setCentralStudents(data)
        }
      })
      .finally(() => {
        if (isMounted) setIsRefreshing(false)
      })

    return () => {
      isMounted = false
    }
  }, [student])

  // 2. Dynamic rank calculations for the current student
  const myRanks = useMemo(() => {
    return getStudentRanks(student, centralStudents)
  }, [student, centralStudents])

  // 3. Filter students based on active tab and selected filters
  const filteredStudents = useMemo(() => {
    return centralStudents.filter((st) => {
      // Department Filter
      const deptTarget = activeTab === 'departments' && selectedDepartment === 'All Departments'
        ? (myRanks.department || 'AI & ML')
        : selectedDepartment

      const matchDept =
        activeTab === 'overall' && selectedDepartment === 'All Departments'
          ? true
          : normalizeDepartment(st.department || st.branch) === (activeTab === 'departments' && selectedDepartment === 'All Departments' ? deptTarget : selectedDepartment)

      // Year Filter
      const matchYear =
        selectedYear === 'All Years' ||
        (st.year || '').trim().toLowerCase() === selectedYear.trim().toLowerCase()

      // Search Filter
      const matchSearch =
        !searchQuery ||
        st.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.department?.toLowerCase().includes(searchQuery.toLowerCase())

      return matchDept && matchYear && matchSearch
    })
  }, [centralStudents, activeTab, selectedDepartment, selectedYear, searchQuery, myRanks.department])

  // 4. Sort and apply standard competitive ranking with tie-handling
  const rankedList = useMemo(() => {
    return rankStudents(filteredStudents)
  }, [filteredStudents])

  // Top 3 Podium
  const top3 = rankedList.slice(0, 3)

  const currentRegNo = (student?.registrationNumber || '').trim().toUpperCase()
  const studentFullName = student?.studentName || student?.name || 'Rahul Kumar'
  const studentXp = Math.max(0, Number(student?.xp) || 0)

  return (
    <div className="desktop-leaderboard-page" aria-label="CampusQuest Leaderboard">
      {/* 1. HEADER SECTION */}
      <header className="desktop-page-header">
        <div>
          <span className="game-kicker">SRKR CAMPUS COMPETITION</span>
          <h1>🏆 CAMPUSQUEST LEADERBOARD</h1>
          <p className="desktop-subhead">Compete, explore, and climb the rankings!</p>
        </div>

        {/* SEARCH BOX */}
        <div className="desktop-search-wrapper">
          <div className="game-search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student or reg no..."
              aria-label="Search Leaderboard"
            />
            {searchQuery && (
              <button className="search-clear-btn" type="button" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>
        </div>
      </header>

      {/* 2. MY RANK BANNER CARD */}
      <section className="clean-card my-rank-banner" aria-label="Your Current Ranking">
        <div className="my-rank-avatar-col">
          <div className="my-rank-avatar-circle">
            {studentFullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="my-rank-kicker">👤 YOUR RANK</span>
            <h3 className="my-rank-name">{studentFullName}</h3>
            <span className="my-rank-submeta">
              {myRanks.department} • {myRanks.year}
            </span>
          </div>
        </div>

        <div className="my-rank-stats-grid">
          <div className="rank-stat-box">
            <span className="stat-pill-label">🏆 OVERALL RANK</span>
            <strong className="stat-pill-value">#{myRanks.overallRank}</strong>
            <small>out of {myRanks.totalStudents} students</small>
          </div>

          <div className="rank-stat-box">
            <span className="stat-pill-label">🏛️ DEPT RANK</span>
            <strong className="stat-pill-value">#{myRanks.departmentRank}</strong>
            <small>{myRanks.department}</small>
          </div>

          <div className="rank-stat-box">
            <span className="stat-pill-label">🎓 YEAR RANK</span>
            <strong className="stat-pill-value">#{myRanks.yearRank}</strong>
            <small>{myRanks.year}</small>
          </div>

          <div className="rank-stat-box xp-box">
            <span className="stat-pill-label">⭐ TOTAL XP</span>
            <strong className="stat-pill-value gold">{studentXp} XP</strong>
            <small>Live Verified XP</small>
          </div>
        </div>
      </section>

      {/* 3. TABS & FILTER BAR */}
      <div className="leaderboard-controls-bar">
        {/* Main Tabs */}
        <div className="leaderboard-tabs-switch" role="tablist">
          <button
            type="button"
            className={`leaderboard-tab-btn${activeTab === 'overall' ? ' active' : ''}`}
            onClick={() => {
              setActiveTab('overall')
              setSelectedDepartment('All Departments')
            }}
          >
            🏆 Overall
          </button>
          <button
            type="button"
            className={`leaderboard-tab-btn${activeTab === 'departments' ? ' active' : ''}`}
            onClick={() => {
              setActiveTab('departments')
              if (selectedDepartment === 'All Departments') {
                setSelectedDepartment(myRanks.department || 'AI & ML')
              }
            }}
          >
            🏛️ Departments
          </button>
        </div>

        {/* Dropdown Filters */}
        <div className="leaderboard-filters-group">
          {/* Department Filter */}
          <div className="filter-select-wrapper">
            <label htmlFor="dept-filter-select">Department:</label>
            <select
              id="dept-filter-select"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="filter-select-wrapper">
            <label htmlFor="year-filter-select">Year:</label>
            <select
              id="year-filter-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {YEARS.map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. LEADERBOARD CONTENT */}
      {rankedList.length === 0 ? (
        <div className="clean-card empty-leaderboard-card">
          <span className="empty-sticker">🏆</span>
          <h3>No students on the leaderboard yet.</h3>
          <p>Complete campus quests to earn XP and claim the #1 rank on the podium!</p>
        </div>
      ) : (
        <>
          {/* TOP 3 PODIUM */}
          <section className="podium-section" aria-label="Top 3 Leaders">
            <div className="podium-grid">
              {/* 2ND PLACE (SILVER) */}
              {top3[1] ? (
                <div className={`podium-card silver${top3[1].registrationNumber.toUpperCase() === currentRegNo ? ' current-user' : ''}`}>
                  <div className="podium-medal-sticker">🥈</div>
                  <span className="podium-rank-tag">🥈 2nd Place</span>
                  <h3 className="podium-student-name">
                    {top3[1].name}
                    {top3[1].registrationNumber.toUpperCase() === currentRegNo && <span className="you-badge"> (You)</span>}
                  </h3>
                  <div className="podium-reg-tag"><code>{top3[1].registrationNumber}</code></div>
                  <div className="podium-dept-tag">{top3[1].department} • {top3[1].year}</div>
                  <div className="podium-xp-pill">
                    <span className="star-icon">⭐</span>
                    <strong>{top3[1].xp} XP</strong>
                  </div>
                </div>
              ) : <div className="podium-card placeholder" />}

              {/* 1ST PLACE (GOLD) */}
              {top3[0] && (
                <div className={`podium-card gold center-champion${top3[0].registrationNumber.toUpperCase() === currentRegNo ? ' current-user' : ''}`}>
                  <div className="podium-crown-sticker">👑</div>
                  <div className="podium-medal-sticker">🥇</div>
                  <span className="podium-rank-tag">🥇 1st Place</span>
                  <h3 className="podium-student-name">
                    {top3[0].name}
                    {top3[0].registrationNumber.toUpperCase() === currentRegNo && <span className="you-badge"> (You)</span>}
                  </h3>
                  <div className="podium-reg-tag"><code>{top3[0].registrationNumber}</code></div>
                  <div className="podium-dept-tag">{top3[0].department} • {top3[0].year}</div>
                  <div className="podium-xp-pill gold-pill">
                    <span className="star-icon">⭐</span>
                    <strong>{top3[0].xp} XP</strong>
                  </div>
                </div>
              )}

              {/* 3RD PLACE (BRONZE) */}
              {top3[2] ? (
                <div className={`podium-card bronze${top3[2].registrationNumber.toUpperCase() === currentRegNo ? ' current-user' : ''}`}>
                  <div className="podium-medal-sticker">🥉</div>
                  <span className="podium-rank-tag">🥉 3rd Place</span>
                  <h3 className="podium-student-name">
                    {top3[2].name}
                    {top3[2].registrationNumber.toUpperCase() === currentRegNo && <span className="you-badge"> (You)</span>}
                  </h3>
                  <div className="podium-reg-tag"><code>{top3[2].registrationNumber}</code></div>
                  <div className="podium-dept-tag">{top3[2].department} • {top3[2].year}</div>
                  <div className="podium-xp-pill">
                    <span className="star-icon">⭐</span>
                    <strong>{top3[2].xp} XP</strong>
                  </div>
                </div>
              ) : <div className="podium-card placeholder" />}
            </div>
          </section>

          {/* FULL RANKINGS TABLE */}
          <section className="rankings-table-section" aria-label="Full Leaderboard Table">
            <div className="admin-table-container rankings-table-wrapper">
              <table className="admin-data-table rankings-table">
                <thead>
                  <tr>
                    <th style={{ width: 90 }}>Rank</th>
                    <th>Student Name</th>
                    <th>Registration Number</th>
                    <th>Department</th>
                    <th>Year</th>
                    <th style={{ textAlign: 'right' }}>XP</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedList.map((st) => {
                    const isCurrent = st.registrationNumber.toUpperCase() === currentRegNo
                    let rankDisplay = `#${st.rank}`
                    if (st.rank === 1) rankDisplay = '🥇 1'
                    else if (st.rank === 2) rankDisplay = '🥈 2'
                    else if (st.rank === 3) rankDisplay = '🥉 3'

                    return (
                      <tr key={st.id || st.registrationNumber} className={isCurrent ? 'current-user-row' : ''}>
                        <td>
                          <span className={`leader-rank-badge rank-${st.rank <= 3 ? st.rank : 'default'}`}>
                            {rankDisplay}
                          </span>
                        </td>
                        <td>
                          <strong className="table-student-name">
                            {st.name}
                            {isCurrent && <span className="you-pill">YOU</span>}
                          </strong>
                        </td>
                        <td>
                          <code>{st.registrationNumber}</code>
                        </td>
                        <td>
                          <span className="dept-label-chip">{st.department || st.branch}</span>
                        </td>
                        <td>{st.year || '2nd Year'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="table-xp-badge">⭐ {st.xp} XP</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default LeaderboardPage