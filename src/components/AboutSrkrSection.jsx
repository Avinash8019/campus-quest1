function AboutSrkrSection() {
  const cards = [
    {
      icon: '🎓',
      title: 'ACADEMICS',
      desc: 'Programs across engineering and computing fields including CSE, AI & ML, AI & DS, ECE, EEE, Mechanical, Civil, and IT.',
    },
    {
      icon: '🔬',
      title: 'RESEARCH',
      desc: 'Research and innovation across multiple engineering areas including AI, IoT & Embedded Systems, Drones, and Sustainability.',
    },
    {
      icon: '🏫',
      title: 'CAMPUS LIFE',
      desc: 'Technical clubs, cultural activities, student chapters, and flagship techno-cultural events like SAMAGRA and JAITRA.',
    },
    {
      icon: '🏃',
      title: 'SPORTS',
      desc: 'Athletics, indoor game arenas, fitness facilities, and dedicated outdoor sports grounds.',
    },
    {
      icon: '💻',
      title: 'TECHNOLOGY',
      desc: 'Technology-focused infrastructure, Technology Centre, computer facilities, and digital learning setups.',
    },
    {
      icon: '📚',
      title: 'LEARNING',
      desc: 'Central Library, specialized laboratories, digital learning, and comprehensive academic resources.',
    },
  ]

  return (
    <section className="about-srkr-section" aria-label="About SRKR Engineering College">
      <div className="about-srkr-header">
        <div className="about-srkr-title-wrap">
          <p className="kicker"><span></span> SAGI RAMA KRISHNAM RAJU ENGINEERING COLLEGE</p>
          <h2>🏫 About SRKR</h2>
          <p className="about-srkr-loc">
            <strong>SRKR Engineering College</strong> · Bhimavaram, Andhra Pradesh · <em>Established in 1980</em>
          </p>
        </div>
        <a
          href="https://www.srkrec.ac.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="srkr-website-link"
        >
          LEARN MORE ABOUT SRKR →
        </a>
      </div>

      <div className="about-srkr-grid">
        {cards.map((item) => (
          <article className="about-srkr-card" key={item.title}>
            <div className="about-srkr-card-top">
              <span className="about-card-icon" aria-hidden="true">{item.icon}</span>
              <h3>{item.title}</h3>
            </div>
            <p>{item.desc}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default AboutSrkrSection
