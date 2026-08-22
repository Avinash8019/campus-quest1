import quests from '../data/quests.js'

function CollegeHistoryPage({ onNavigateTab, onSelectQuest }) {
  // Find Quest 11 for direct CTA
  const legacyQuest = quests.find((q) => q.id === 11)

  return (
    <div className="desktop-history-page" aria-label="SRKR College History">
      {/* 1. HEADER SECTION */}
      <header className="history-header-card">
        <span className="game-kicker">HERITAGE SINCE 1980</span>
        <h1 className="history-main-title">🏫 College History</h1>
        <p className="history-intro-text">
          Discover the journey of Sagi Rama Krishnam Raju Engineering College from its foundation in 1980 to becoming one of Andhra Pradesh's premier autonomous technical institutions.
        </p>

        <div className="history-quick-actions">
          {legacyQuest && onSelectQuest && (
            <button
              className="game-primary-btn history-action-btn"
              type="button"
              onClick={() => onSelectQuest(legacyQuest)}
            >
              🎯 Start Legacy Quest (+100 XP)
            </button>
          )}

          {onNavigateTab && (
            <button
              className="game-secondary-btn history-action-btn"
              type="button"
              onClick={() => onNavigateTab('campus')}
            >
              🏫 Explore Campus Facilities →
            </button>
          )}
        </div>
      </header>

      {/* 2. COMPACT INSTITUTIONAL FACTS */}
      <section className="history-facts-bar" aria-label="Quick Facts">
        <div className="fact-badge">
          <span className="fact-label">ESTABLISHED</span>
          <strong className="fact-val">1980</strong>
        </div>
        <div className="fact-badge">
          <span className="fact-label">LOCATION</span>
          <strong className="fact-val">China Amiram, Bhimavaram</strong>
        </div>
        <div className="fact-badge">
          <span className="fact-label">STATUS</span>
          <strong className="fact-val">UGC Autonomous</strong>
        </div>
        <div className="fact-badge">
          <span className="fact-label">ACCREDITATION</span>
          <strong className="fact-val">NAAC 'A+' & NBA</strong>
        </div>
        <div className="fact-badge">
          <span className="fact-label">CAMPUS</span>
          <strong className="fact-val">30+ Lush Acres</strong>
        </div>
        <div className="fact-badge">
          <span className="fact-label">ALUMNI</span>
          <strong className="fact-val">40,000+ Worldwide</strong>
        </div>
      </section>

      {/* 3. SECTION 1: OUR BEGINNING */}
      <section className="history-section-card" aria-label="Our Beginning">
        <h2>🏛️ Our Beginning</h2>
        <span className="history-section-subtitle">1980 • Foundation & Early Vision</span>
        
        <p className="history-body-text">
          Sagi Rama Krishnam Raju Engineering College was established in 1980 by the SRKR Engineering College Association under the visionary philanthropy of Late Sri Sagi Rama Krishnam Raju. The institution was founded with the mission to bring top-tier technical and engineering education to rural and urban youth in the Coastal Andhra region.
        </p>

        <ul className="history-bullet-list">
          <li>
            <span className="history-bullet-dot">▸</span>
            <span>Commenced operations in 1980 at China Amiram, Bhimavaram.</span>
          </li>
          <li>
            <span className="history-bullet-dot">▸</span>
            <span>Recognized by AICTE and affiliated with Jawaharlal Nehru Technological University (JNTUK).</span>
          </li>
          <li>
            <span className="history-bullet-dot">▸</span>
            <span>Inaugurated with foundational engineering disciplines: Civil, Mechanical, and Electrical Engineering.</span>
          </li>
        </ul>
      </section>

      {/* 4. SECTION 2: GROWTH & DEVELOPMENT */}
      <section className="history-section-card" aria-label="Growth & Development">
        <h2>📈 Growth & Development</h2>
        <span className="history-section-subtitle">1990s – 2000s • Academic Expansion & Modern Infrastructure</span>

        <p className="history-body-text">
          During the 1990s and early 2000s, SRKR underwent substantial academic expansion, introducing Computer Science & Engineering (CSE), Electronics & Communication (ECE), and Information Technology (IT) to meet the growing demands of India's technology revolution.
        </p>
        <p className="history-body-text">
          State-of-the-art campus infrastructure followed, including the Centre for IT Infrastructure (CITI) with high-speed fiber optic networking, dedicated Technology Incubation bays for student prototyping, and the Centre for Foreign Languages offering courses in Japanese, German, and French.
        </p>

        <ul className="history-bullet-list">
          <li>
            <span className="history-bullet-dot">▸</span>
            <span>Established advanced Electronics laboratories and dedicated departmental Computer Centres.</span>
          </li>
          <li>
            <span className="history-bullet-dot">▸</span>
            <span>Built the Centre for IT Infrastructure (CITI) campus-wide network backbone.</span>
          </li>
          <li>
            <span className="history-bullet-dot">▸</span>
            <span>Forged enduring industry partnerships for internships, placements, and collaborative research.</span>
          </li>
        </ul>
      </section>

      {/* 5. SECTION 3: ACADEMIC EXCELLENCE & AUTONOMY */}
      <section className="history-section-card" aria-label="Academic Excellence">
        <h2>🎓 Academic Excellence</h2>
        <span className="history-section-subtitle">2010s • Autonomous Status & National Accreditations</span>

        <p className="history-body-text">
          SRKR was granted Autonomous Status by the University Grants Commission (UGC) and JNTUK, empowering the college to design modern, industry-relevant curricula and flexible academic programs.
        </p>

        <ul className="history-bullet-list">
          <li>
            <span className="history-bullet-dot">▸</span>
            <span>Conferred Autonomous Status by UGC and JNTUK Kakinada.</span>
          </li>
          <li>
            <span className="history-bullet-dot">▸</span>
            <span>Accredited with prestigious NAAC 'A+' Grade for institutional excellence.</span>
          </li>
          <li>
            <span className="history-bullet-dot">▸</span>
            <span>National Board of Accreditation (NBA) accreditation across undergraduate engineering branches.</span>
          </li>
        </ul>
      </section>

      {/* 6. SECTION 4: RESEARCH & INNOVATION */}
      <section className="history-section-card" aria-label="Research and Innovation">
        <h2>🔬 Research & Innovation</h2>
        <span className="history-section-subtitle">Centre for Research and Development (CRD)</span>

        <p className="history-body-text">
          SRKR has developed an active research ecosystem led by the Centre for Research and Development. Faculty and students collaborate on impactful projects including AI agricultural solutions, unmanned aerial drone systems, solar microgrids, IoT edge computing, and water quality testing across the Godavari delta.
        </p>

        <div className="history-pillars-stack">
          <div className="history-mini-pillar">
            <strong>🤖 AI & Data Science Hub</strong>
            <span>High-performance compute clusters for deep learning and neural vision research.</span>
          </div>
          <div className="history-mini-pillar">
            <strong>🛸 Robotics & Drone Lab</strong>
            <span>Autonomous aerial vehicles, sensor telemetry, and precision agricultural robotics.</span>
          </div>
          <div className="history-mini-pillar">
            <strong>💡 Startup Incubation</strong>
            <span>Institutional workspace, patent assistance, and seed funding for student ventures.</span>
          </div>
          <div className="history-mini-pillar">
            <strong>☀️ Renewable Energy Lab</strong>
            <span>Photovoltaic testing, smart microgrids, and electric vehicle battery systems.</span>
          </div>
        </div>
      </section>

      {/* 7. SECTION 5: OUR VISION & STUDENT LIFE */}
      <section className="history-section-card" aria-label="Our Vision">
        <h2>🚀 Our Vision & Student Life</h2>
        <span className="history-section-subtitle">Today & Beyond • Emerging Tech Hub & Global Community</span>

        <p className="history-body-text">
          Today, SRKR Engineering College stands as a forward-looking hub with specialized undergraduate programs in AI & ML, AI & Data Science, and Cyber Security. The campus thrives with technical hackathons like HackOverflow and flagship cultural festivals including SAMAGRA and JAITRA.
        </p>
        <p className="history-body-text">
          Our global alumni community of over 40,000 engineers actively leads technology enterprises, research laboratories, and entrepreneurial ventures across India, North America, Europe, and Asia.
        </p>

        <ul className="history-bullet-list">
          <li>
            <span className="history-bullet-dot">▸</span>
            <span>Active student technical chapters: Coding Club, AI & ML Club, and ISTE Chapter.</span>
          </li>
          <li>
            <span className="history-bullet-dot">▸</span>
            <span>Cultural & artistic societies including Srujana Vatika fine arts club.</span>
          </li>
          <li>
            <span className="history-bullet-dot">▸</span>
            <span>Comprehensive athletic complex: cricket grounds, basketball & volleyball courts, and badminton arena.</span>
          </li>
          <li>
            <span className="history-bullet-dot">▸</span>
            <span>Dedicated NSS social service wings conducting regular community outreach and blood donation drives.</span>
          </li>
        </ul>

        {/* BOTTOM EXPLORE CTA */}
        <div className="history-card-footer-cta">
          <div className="footer-cta-text">
            <strong>Ready to explore SRKR in person?</strong>
            <span>Visit historical landmarks, research bays, and facilities using CampusQuest.</span>
          </div>
          <div className="footer-cta-actions">
            {legacyQuest && onSelectQuest && (
              <button
                className="game-primary-btn footer-action-btn"
                type="button"
                onClick={() => onSelectQuest(legacyQuest)}
              >
                📜 Start Quest 11 (+100 XP)
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default CollegeHistoryPage
