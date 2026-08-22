function LevelUpModal({ level, onContinue }) {
  return (
    <div className="level-up-backdrop" role="presentation">
      <section className="level-up-modal" role="dialog" aria-modal="true" aria-labelledby="level-up-title">
        <div className="level-up-sparkle" aria-hidden="true">🌟 🔥 🌟</div>
        <p className="level-up-kicker">LEVEL UP!</p>
        <h2 id="level-up-title">LEVEL {level.number}</h2>
        <div className="level-up-rank-badge">
          <span className="level-up-icon">{level.icon}</span>
          <span className="level-up-rank">{level.name}</span>
        </div>
        <p className="level-up-message">Congratulations! You unlocked a new explorer rank on campus.</p>
        <button className="primary-action-btn modal-btn" type="button" onClick={onContinue}>
          CONTINUE ADVENTURE →
        </button>
      </section>
    </div>
  )
}

export default LevelUpModal