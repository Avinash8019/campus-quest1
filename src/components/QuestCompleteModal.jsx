function QuestCompleteModal({ quest, earnedXp, onContinue }) {
  return (
    <div className="clean-modal-backdrop" role="presentation" onClick={(e) => e.target === e.currentTarget && onContinue()}>
      <section className="game-celebration-card" role="dialog" aria-modal="true" aria-labelledby="celebration-title">
        {/* TOP CELEBRATION GRAPHIC */}
        <div className="celebration-sticker-wrap">
          <span className="celebration-bounce-sticker">🎉</span>
          <span className="trophy-bounce-sticker">🏆</span>
        </div>

        <h2 id="celebration-title">QUEST COMPLETE!</h2>
        <p className="celebration-quest-tag">{quest.title.toUpperCase()}</p>

        {/* XP REWARD DISPLAY */}
        <div className="game-xp-reward-box">
          <span className="reward-sub-tag">TOTAL REWARD</span>
          <strong className="reward-xp-giant">+{earnedXp} XP</strong>
          <span className="reward-star-sticker">⭐</span>
        </div>

        {/* 4 VERIFICATION POINTS */}
        <div className="celebration-checklist-box">
          <span className="checklist-box-title">MISSION COMPLETED</span>
          <div className="celebration-check-items">
            <div className="check-item-pill">✓ Location Discovered</div>
            <div className="check-item-pill">✓ Question Answered</div>
            <div className="check-item-pill">✓ Photo Uploaded</div>
            <div className="check-item-pill">✓ QR Code Verified</div>
          </div>
        </div>

        {/* CONTINUE ACTION */}
        <button
          className="game-primary-btn celebration-continue-btn"
          type="button"
          onClick={onContinue}
          autoFocus
        >
          CONTINUE ADVENTURE 🚀
        </button>
      </section>
    </div>
  )
}

export default QuestCompleteModal