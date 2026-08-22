function CampusGuidePage({ onBack }) {
  const guideCards = [
    {
      icon: '🏛️',
      title: 'SRKR Heritage & Legacy',
      tag: 'ESTD 1980',
      description: 'Sagi Rama Krishnam Raju Engineering College (SRKREC) in Bhimavaram is a premier autonomous institution with NAAC A+ accreditation, known for decades of excellence in technical education.',
    },
    {
      icon: '💻',
      title: 'Computing & AI Facilities',
      tag: 'CSE · AIML · AIDS · IT',
      description: 'Advanced computer centres, high-speed networking laboratories, cloud computing suites, and specialized AI & Data Science research workspaces.',
    },
    {
      icon: '📚',
      title: 'Central Library & Digital Hub',
      tag: '100,000+ VOLUMES',
      description: 'Comprehensive digital library collections, IEEE journals, reference volumes, competitive exam reading halls, and quiet study zones.',
    },
    {
      icon: '🔬',
      title: 'Technology & Incubation Centre',
      tag: 'INNOVATION HUB',
      description: 'Campus innovation center supporting student prototypes, entrepreneurship, IoT projects, robotics, drone technologies, and faculty research.',
    },
    {
      icon: '⚡',
      title: 'Core Engineering Labs',
      tag: 'ECE · EEE · MECH · CIVIL',
      description: 'Fully equipped mechanical workshops, foundry, electrical machines test benches, electronics circuit testing laboratories, and civil structures labs.',
    },
    {
      icon: '🏀',
      title: 'Sports & Athletics Complex',
      tag: 'FITNESS & GAMES',
      description: 'Expansive cricket and football grounds, basketball and volleyball courts, modern gymnasium, and annual inter-college sports meets.',
    },
    {
      icon: '👥',
      title: 'Student Life & SAC',
      tag: 'CLUBS & CULTURE',
      description: 'Student Activity Centre coordinates tech clubs, hackathons, coding contests, and flagship annual cultural celebrations like SAMAGRA and JAITRA.',
    },
    {
      icon: '🚪',
      title: 'Campus Gates & Navigation',
      tag: '3 MAIN GATES',
      description: 'Gate 1: Main Heritage Arch (Admin & Academic access), Gate 2: Sports & Student Gate (Hostels & Grounds), Gate 3: Engineering Workshops & Service Bay.',
    },
  ]

  return (
    <main className="game-guide-page" aria-label="SRKR Campus Guide">
      <header className="guide-header-bar">
        <div>
          <div className="game-kicker">CAMPUS COMPASS</div>
          <h1>📚 SRKR CAMPUS GUIDE</h1>
          <p className="guide-sub">
            Essential information, departments, research centres, and facilities across our Bhimavaram campus.
          </p>
        </div>
        <a
          href="https://www.google.com/maps/search/?api=1&query=SRKR+Engineering+College+Bhimavaram"
          target="_blank"
          rel="noopener noreferrer"
          className="guide-map-btn"
        >
          🗺️ Open in Google Maps ↗
        </a>
      </header>

      <section className="guide-cards-grid">
        {guideCards.map((card, idx) => (
          <article key={idx} className="guide-info-card">
            <div className="guide-card-top">
              <span className="guide-icon">{card.icon}</span>
              <span className="guide-tag">{card.tag}</span>
            </div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

export default CampusGuidePage
