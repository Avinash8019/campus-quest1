import quests from '../data/quests.js'
import { isQuestUnlocked } from '../utils/gameLevels.js'

function ExplorePage({ student, onSelectQuest, onBack }) {
  const completedQuests = Array.isArray(student?.completedQuests) ? student.completedQuests : []

  return (
    <div className="desktop-quests-page" aria-label="Campus Quests Dashboard">
      {/* HEADER */}
      <header className="desktop-page-header">
        <div>
          <span className="game-kicker">CAMPUS MISSIONS & EXPEDITIONS</span>
          <h1>🎯 Campus Quests</h1>
          <p className="desktop-subhead">Explore SRKR Engineering College • Discover Landmark Locations • Earn XP</p>
        </div>
      </header>

      {/* QUEST CARDS DESKTOP GRID */}
      <div className="desktop-quests-grid">
        {quests.map((quest, index) => {
          const questId = Number(quest.id)
          const isCompleted = completedQuests.includes(questId)
          const isUnlocked = isQuestUnlocked(questId, completedQuests)
          const progress = student?.questProgress?.[String(questId)] || {}
          const step = progress.step || 1

          return (
            <article
              key={quest.id}
              className={`desktop-card quest-desktop-card${isCompleted ? ' completed' : ''}${!isUnlocked ? ' locked' : ''}`}
            >
              {/* STICKER / STATUS BADGE */}
              <div className="quest-card-header">
                <div className="quest-title-pill">
                  <span className="quest-icon-graphic">
                    {isCompleted ? '✓' : isUnlocked ? '🎯' : '🔒'}
                  </span>
                  <h2>{quest.title}</h2>
                </div>

                <div className="quest-xp-tag">
                  {isCompleted ? (
                    <span className="earned-badge">✓ +{quest.xp} XP</span>
                  ) : (
                    <span className="reward-badge">⭐ +{quest.xp} XP</span>
                  )}
                </div>
              </div>

              {/* CARD BODY */}
              <div className="quest-card-body">
                {isUnlocked ? (
                  <>
                    <p className="quest-clue-snippet">"{quest.clue}"</p>
                    <div className="quest-step-indicators">
                      <span className="step-count-text">Progress: Step {isCompleted ? '4 of 4' : `${step} of 4`}</span>
                      <div className="step-dots-row">
                        <span className={`step-dot ${isCompleted || step >= 1 ? 'filled' : ''}`} />
                        <span className={`step-dot ${isCompleted || step >= 2 ? 'filled' : ''}`} />
                        <span className={`step-dot ${isCompleted || step >= 3 ? 'filled' : ''}`} />
                        <span className={`step-dot ${isCompleted || step >= 4 ? 'filled' : ''}`} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="locked-quest-notice">
                    <p>🔒 Complete <strong>Quest {index}</strong> to unlock this mission.</p>
                  </div>
                )}
              </div>

              {/* ACTION BUTTON */}
              <div className="quest-card-footer">
                {isCompleted ? (
                  <button
                    className="game-secondary-btn quest-action-btn revisit-btn"
                    type="button"
                    onClick={() => onSelectQuest(quest)}
                  >
                    REVISIT QUEST ↺
                  </button>
                ) : isUnlocked ? (
                  <button
                    className="game-primary-btn quest-action-btn start-btn"
                    type="button"
                    onClick={() => onSelectQuest(quest)}
                  >
                    {step > 1 ? `CONTINUE (STEP ${step}) →` : 'START QUEST 🚀'}
                  </button>
                ) : (
                  <button className="game-disabled-btn quest-action-btn" type="button" disabled>
                    LOCKED 🔒
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default ExplorePage