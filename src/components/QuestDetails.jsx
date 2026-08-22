import { useState, useMemo } from 'react'
import QrScannerModal from './QrScannerModal.jsx'

function QuestDetails({ quest, student, onStudentUpdate, onBack }) {
  const questId = Number(quest.id)
  const questKey = String(questId)

  // Student progress state
  const existingProgress = student?.questProgress?.[questKey] || {}
  const isAlreadyCompleted = Array.isArray(student?.completedQuests) && student.completedQuests.includes(questId)

  const [currentStep, setCurrentStep] = useState(existingProgress.step || 1)
  const [selectedChoiceId, setSelectedChoiceId] = useState(existingProgress.selectedChoiceId || '')
  const [isLocationSolved, setIsLocationSolved] = useState(Boolean(existingProgress.isLocationSolved || isAlreadyCompleted))
  const [step1Feedback, setStep1Feedback] = useState('')

  // Step 2 (Factual Question)
  const [selectedAnswer, setSelectedAnswer] = useState(existingProgress.selectedAnswer || '')
  const [isQuestionAnswered, setIsQuestionAnswered] = useState(Boolean(existingProgress.isQuestionAnswered || isAlreadyCompleted))
  const [questionFeedback, setQuestionFeedback] = useState('')

  // Step 3 (Image Observation & Photo Proof)
  const [imagePreview, setImagePreview] = useState(existingProgress.imagePreview || null)
  const [selectedStep3Answer, setSelectedStep3Answer] = useState(existingProgress.selectedStep3Answer || '')
  const [isStep3Answered, setIsStep3Answered] = useState(Boolean(existingProgress.isStep3Answered || isAlreadyCompleted))
  const [step3Feedback, setStep3Feedback] = useState('')
  const [isPhotoUploaded, setIsPhotoUploaded] = useState(Boolean(existingProgress.isPhotoUploaded || isAlreadyCompleted))
  const [photoError, setPhotoError] = useState('')

  // Step 4
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [manualVerificationCode, setManualVerificationCode] = useState('')
  const [manualCodeError, setManualCodeError] = useState('')
  const [isQrVerified, setIsQrVerified] = useState(Boolean(existingProgress.isQrVerified || isAlreadyCompleted))

  // Fullscreen Completion View State
  const [isCompletedScreenVisible, setIsCompletedScreenVisible] = useState(false)

  // Real campus choices for Step 1
  const choices = useMemo(() => {
    if (Array.isArray(quest.choices) && quest.choices.length > 0) {
      return quest.choices
    }
    return [
      { id: 'computer-lab', label: '💻 Computer Laboratory', locationId: 'computer-lab' },
      { id: 'library', label: '📚 Central Library', locationId: 'library' },
      { id: 'sports-area', label: '🏟️ Sports Arena', locationId: 'sports-area' },
      { id: 'food-court', label: '🍽️ Food Court', locationId: 'food-court' },
    ]
  }, [quest])

  // Step 3 Observation Options
  const step3Options = useMemo(() => {
    if (Array.isArray(quest.step3Options) && quest.step3Options.length > 0) {
      return quest.step3Options
    }
    return [
      'Advanced specialized learning equipment and collaborative workstations',
      'Heavy metal foundry forging hammer',
      'Highway civil asphalt testing machine',
      'Outdoor cricket sprinkler system',
    ]
  }, [quest])

  function saveProgress(partial) {
    const updated = {
      ...student,
      questProgress: {
        ...(student?.questProgress || {}),
        [questKey]: {
          ...(student?.questProgress?.[questKey] || {}),
          ...partial,
        },
      },
    }
    onStudentUpdate(updated)
  }

  // --- STEP 1: DISCOVER LOCATION ---
  function handleSelectChoice(choice) {
    if (isLocationSolved) return
    setSelectedChoiceId(choice.id)

    const correctId = quest.correctChoiceId
    if (choice.id === correctId) {
      setIsLocationSolved(true)
      setStep1Feedback('correct')
      saveProgress({
        selectedChoiceId: choice.id,
        isLocationSolved: true,
        step: 1,
      })
    } else {
      setStep1Feedback('incorrect')
    }
  }

  function handleContinueToStep2() {
    setCurrentStep(2)
    saveProgress({ step: 2 })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // --- STEP 2: KNOWLEDGE CHALLENGE ---
  function handleAnswerSubmit(option) {
    if (isQuestionAnswered) return
    setSelectedAnswer(option)

    const isMatch =
      option === quest.correctAnswer ||
      option.replace(/^[A-D]\.\s*/, '').trim() === quest.correctAnswer.replace(/^[A-D]\.\s*/, '').trim()

    if (isMatch) {
      setIsQuestionAnswered(true)
      setQuestionFeedback('correct')
      saveProgress({
        selectedAnswer: option,
        isQuestionAnswered: true,
        step: 2,
      })
    } else {
      setQuestionFeedback('incorrect')
    }
  }

  function handleContinueToStep3() {
    setCurrentStep(3)
    saveProgress({ step: 3 })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // --- STEP 3: IMAGE OBSERVATION & PHOTO PROOF ---
  function handleStep3AnswerSubmit(option) {
    if (isStep3Answered) return
    setSelectedStep3Answer(option)

    const isMatch =
      !quest.step3CorrectAnswer ||
      option === quest.step3CorrectAnswer ||
      option.replace(/^[A-D]\.\s*/, '').trim() === quest.step3CorrectAnswer.replace(/^[A-D]\.\s*/, '').trim()

    if (isMatch) {
      setIsStep3Answered(true)
      setIsPhotoUploaded(true)
      setStep3Feedback('correct')
      saveProgress({
        selectedStep3Answer: option,
        isStep3Answered: true,
        isPhotoUploaded: true,
        step: 3,
      })
    } else {
      setStep3Feedback('incorrect')
    }
  }

  function handleImageUpload(e) {
    setPhotoError('')
    const file = e.target.files?.[0]
    if (!file) return

    // 1. Validate file type
    if (!file.type || !file.type.startsWith('image/')) {
      setPhotoError('Invalid file type. Please upload a valid image file (PNG, JPG, WebP).')
      return
    }

    // 2. Validate file size (Max 10MB)
    const maxSizeBytes = 10 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setPhotoError('Image file is too large (max 10MB). Please choose a smaller photo.')
      return
    }

    const reader = new FileReader()
    reader.onerror = () => {
      setPhotoError('Failed to read image file. Please try again.')
    }
    reader.onload = (event) => {
      const dataUrl = event.target.result
      setImagePreview(dataUrl)
      setIsPhotoUploaded(true)
      setIsStep3Answered(true)
      saveProgress({
        imagePreview: dataUrl,
        isPhotoUploaded: true,
        isStep3Answered: true,
        step: 3,
      })
    }
    reader.readAsDataURL(file)
  }

  function handleRemovePhoto() {
    setImagePreview(null)
    setPhotoError('')
    saveProgress({
      imagePreview: null,
    })
  }

  function handleContinueToStep4() {
    setCurrentStep(4)
    saveProgress({ step: 4 })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // --- STEP 4: VERIFICATION (QR SCAN & MANUAL CODE) ---
  const validCodes = useMemo(() => {
    return [
      (quest.verificationCode || '').trim().toUpperCase(),
      (quest.qrId || '').trim().toUpperCase(),
      (quest.qrCode || '').trim().toUpperCase(),
      (quest.qrCodeData || '').trim().toUpperCase(),
      (quest.qrVerificationCode || '').trim().toUpperCase(),
    ].filter(Boolean)
  }, [quest])

  function handleScanSuccess() {
    setIsScannerOpen(false)
    setIsQrVerified(true)
    setManualCodeError('')
    saveProgress({
      isQrVerified: true,
      step: 4,
    })
  }

  function handleManualCodeSubmit(e) {
    e.preventDefault()
    setManualCodeError('')

    const cleanInput = manualVerificationCode.trim().toUpperCase()
    if (!cleanInput) {
      setManualCodeError('Please enter a verification code.')
      return
    }

    if (validCodes.includes(cleanInput)) {
      setIsQrVerified(true)
      saveProgress({
        isQrVerified: true,
        step: 4,
      })
    } else {
      setManualCodeError('Please check the code and try again.')
    }
  }

  // --- FINISH QUEST CELEBRATION ---
  function handleFinishQuest() {
    if (isAlreadyCompleted) {
      setIsCompletedScreenVisible(true)
      return
    }

    const currentXp = Math.max(0, Number(student?.xp) || 0)
    const newXp = currentXp + (quest.xp || 100)
    const completedList = Array.isArray(student?.completedQuests) ? [...student.completedQuests] : []

    if (!completedList.includes(questId)) {
      completedList.push(questId)
    }

    const badgesList = Array.isArray(student?.badges) ? [...student.badges] : []
    if (quest.badge && !badgesList.includes(quest.badge)) {
      badgesList.push(quest.badge)
    }

    const nextStudent = {
      ...student,
      xp: newXp,
      completedQuests: completedList,
      badges: badgesList,
      questProgress: {
        ...(student?.questProgress || {}),
        [questKey]: {
          ...(student?.questProgress?.[questKey] || {}),
          step: 4,
          isCompleted: true,
          completedAt: new Date().toISOString(),
        },
      },
    }

    onStudentUpdate(nextStudent)
    setIsCompletedScreenVisible(true)
  }

  function openGoogleMapsRoute() {
    const query = encodeURIComponent(quest.mapsQuery || `SRKR Engineering College Bhimavaram ${quest.destinationName || ''}`)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer')
  }

  const isStep1Done = isLocationSolved
  const isStep2Done = isQuestionAnswered
  const isStep3Done = isStep3Answered || isPhotoUploaded
  const isStep4Done = isQrVerified
  const canCompleteQuest = isStep1Done && isStep2Done && isStep3Done && isStep4Done

  // =========================================================================
  // 1. FULL-SCREEN COMPLETION SCREEN (OCCUPIES COMPLETE VIEWPORT)
  // =========================================================================
  if (isCompletedScreenVisible) {
    return (
      <main className="fullscreen-quest-completion-page" aria-label="Quest Completed Celebration">
        <div className="fullscreen-celebration-container">
          <div className="celebration-giant-sticker">🎉</div>

          <h1 className="celebration-giant-title">QUEST COMPLETE!</h1>
          <p className="celebration-quest-name">{quest.title.toUpperCase()} — {quest.location || quest.destinationName}</p>

          <div className="celebration-gold-xp-pill">
            <span className="star-icon">⭐</span>
            <strong>+{quest.xp} XP EARNED</strong>
          </div>

          <div className="celebration-full-checklist">
            <div className="completion-check-row">
              <span className="check-icon">✓</span>
              <span>Location Identified</span>
            </div>
            <div className="completion-check-row">
              <span className="check-icon">✓</span>
              <span>Factual Knowledge Challenge Answered</span>
            </div>
            <div className="completion-check-row">
              <span className="check-icon">✓</span>
              <span>Image Observation Verified</span>
            </div>
            <div className="completion-check-row">
              <span className="check-icon">✓</span>
              <span>Location Verified</span>
            </div>
          </div>

          <button
            className="game-primary-btn celebration-full-action-btn"
            type="button"
            onClick={onBack}
            autoFocus
          >
            CONTINUE ADVENTURE 🚀
          </button>
        </div>
      </main>
    )
  }

  // =========================================================================
  // 2. DEDICATED FULL-SCREEN QUEST APPLICATION PAGE
  // =========================================================================
  return (
    <div className="fullscreen-quest-app-page" aria-label="Quest Play Screen">
      {/* FULLSCREEN QUEST TOPBAR */}
      <header className="fullscreen-quest-topbar">
        <div className="quest-topbar-wrapper">
          <button className="game-icon-back-btn" type="button" onClick={onBack} aria-label="Back to Quests">
            ← Back
          </button>

          <div className="quest-topbar-title-block">
            <h1>🎯 {quest.title.toUpperCase()} — {quest.location || quest.destinationName}</h1>
            <span className="quest-topbar-loc-tag">📍 {quest.location || quest.destinationName}</span>
          </div>

          <div className="quest-topbar-xp-badge">
            <span>⭐ +{quest.xp} XP</span>
          </div>
        </div>
      </header>

      {/* 4-STEP HORIZONTAL PROGRESS BAR */}
      <nav className="fullscreen-step-tracker-bar" aria-label="Quest Step Progress">
        <div className="step-tracker-container">
          {/* STEP 1 */}
          <div
            className={`step-node${currentStep === 1 ? ' current' : ''}${isStep1Done ? ' done' : ''}`}
            onClick={() => setCurrentStep(1)}
          >
            <div className="step-symbol">{isStep1Done ? '✓' : '1'}</div>
            <span>1. Identification</span>
          </div>

          <div className={`step-connector-line${isStep1Done ? ' filled' : ''}`} />

          {/* STEP 2 */}
          <div
            className={`step-node${currentStep === 2 ? ' current' : ''}${isStep2Done ? ' done' : ''}`}
            onClick={() => isStep1Done && setCurrentStep(2)}
          >
            <div className="step-symbol">{isStep2Done ? '✓' : '2'}</div>
            <span>2. Factual</span>
          </div>

          <div className={`step-connector-line${isStep2Done ? ' filled' : ''}`} />

          {/* STEP 3 */}
          <div
            className={`step-node${currentStep === 3 ? ' current' : ''}${isStep3Done ? ' done' : ''}`}
            onClick={() => isStep2Done && setCurrentStep(3)}
          >
            <div className="step-symbol">{isStep3Done ? '✓' : '3'}</div>
            <span>3. Observation</span>
          </div>

          <div className={`step-connector-line${isStep3Done ? ' filled' : ''}`} />

          {/* STEP 4 */}
          <div
            className={`step-node${currentStep === 4 ? ' current' : ''}${isStep4Done ? ' done' : ''}`}
            onClick={() => isStep3Done && setCurrentStep(4)}
          >
            <div className="step-symbol">{isStep4Done ? '✓' : '4'}</div>
            <span>4. Verification</span>
          </div>
        </div>
      </nav>

      {/* FULLSCREEN ACTIVE STEP CONTENT */}
      <main className="fullscreen-quest-main-viewport">
        <div className="fullscreen-quest-content-box">
          {/* ================= STEP 1: IDENTIFICATION QUESTION ================= */}
          {currentStep === 1 && (
            <section className="fullscreen-step-section" aria-labelledby="step1-title">
              <header className="step-title-header">
                <span className="step-kicker-pill">STEP 1</span>
                <h2 id="step1-title">🔍 STEP 1 • IDENTIFICATION</h2>
              </header>

              {/* MYSTERY CLUE */}
              <div className="clue-description-bubble">
                <span className="clue-tag-title">📍 Location Clue</span>
                <p className="clue-body-text">"{quest.clue}"</p>
              </div>

              <h3 className="choice-question-prompt">
                {quest.step1Question || 'What department or place are you visiting?'}
              </h3>

              {/* MEANINGFUL REAL PLACE CHOICES */}
              <div className="meaningful-places-grid">
                {choices.map((choice) => {
                  const isSelected = selectedChoiceId === choice.id
                  const isCorrect = isLocationSolved && choice.id === quest.correctChoiceId
                  const isWrong = !isLocationSolved && isSelected && step1Feedback === 'incorrect'

                  return (
                    <button
                      key={choice.id}
                      type="button"
                      className={`place-choice-btn${isSelected ? ' selected' : ''}${isCorrect ? ' correct' : ''}${isWrong ? ' incorrect' : ''}`}
                      onClick={() => handleSelectChoice(choice)}
                      disabled={isLocationSolved}
                    >
                      <span className="place-label">{choice.label}</span>
                      {isCorrect && <span className="place-status-check">✓</span>}
                    </button>
                  )
                })}
              </div>

              {/* WRONG ANSWER FEEDBACK */}
              {step1Feedback === 'incorrect' && !isLocationSolved && (
                <div className="feedback-notice-card error" role="alert">
                  <div className="feedback-title">❌ Wrong option</div>
                  <p style={{ margin: '0 0 6px', fontWeight: 700 }}>Try again!</p>
                  {quest.step1Hint && (
                    <p style={{ margin: 0, fontSize: 13, color: '#991b1b' }}>
                      <strong>💡 Hint:</strong> {quest.step1Hint}
                    </p>
                  )}
                </div>
              )}

              {/* CORRECT ANSWER REVEAL & GOOGLE MAPS */}
              {isLocationSolved && (
                <div className="location-discovered-panel">
                  <div className="feedback-notice-card success" role="status">
                    <div className="feedback-title">🎉 LOCATION IDENTIFIED!</div>
                    <p>Great job! You identified the correct quest location.</p>
                    <div className="revealed-place-name">
                      <span>✓ Location:</span>
                      <strong>{quest.destinationName}</strong>
                    </div>
                  </div>

                  <div className="step-action-row">
                    <button
                      className="game-secondary-btn view-route-btn"
                      type="button"
                      onClick={openGoogleMapsRoute}
                    >
                      🗺️ VIEW ROUTE (GOOGLE MAPS) ↗
                    </button>

                    <button
                      className="game-primary-btn next-step-action-btn"
                      type="button"
                      onClick={handleContinueToStep2}
                    >
                      CONTINUE TO STEP 2 →
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ================= STEP 2: FACTUAL KNOWLEDGE QUESTION ================= */}
          {currentStep === 2 && (
            <section className="fullscreen-step-section" aria-labelledby="step2-title">
              <header className="step-title-header">
                <span className="step-kicker-pill">STEP 2</span>
                <h2 id="step2-title">🧠 STEP 2 • FACTUAL KNOWLEDGE</h2>
              </header>

              <div className="quiz-question-box">
                <p className="quiz-prompt-text">{quest.question}</p>
              </div>

              <div className="quiz-options-list">
                {quest.options?.map((option, index) => {
                  const letter = String.fromCharCode(65 + index)
                  const formattedLabel = option.startsWith(`${letter}.`) ? option : `${letter}. ${option}`
                  const isSelected = selectedAnswer === option
                  const isMatch =
                    option === quest.correctAnswer ||
                    option.replace(/^[A-D]\.\s*/, '').trim() === quest.correctAnswer.replace(/^[A-D]\.\s*/, '').trim()
                  const isCorrect = isQuestionAnswered && isMatch
                  const isWrong = !isQuestionAnswered && isSelected && questionFeedback === 'incorrect'

                  return (
                    <button
                      key={index}
                      type="button"
                      className={`quiz-choice-btn${isSelected ? ' selected' : ''}${isCorrect ? ' correct' : ''}${isWrong ? ' incorrect' : ''}`}
                      onClick={() => handleAnswerSubmit(option)}
                      disabled={isQuestionAnswered}
                    >
                      <span className="opt-letter">{letter}</span>
                      <span className="opt-label">{formattedLabel}</span>
                      {isCorrect && <span className="opt-check">✓</span>}
                    </button>
                  )
                })}
              </div>

              {/* WRONG ANSWER FEEDBACK */}
              {questionFeedback === 'incorrect' && !isQuestionAnswered && (
                <div className="feedback-notice-card error" role="alert">
                  <div className="feedback-title">❌ Wrong option</div>
                  <p style={{ margin: '0 0 6px', fontWeight: 700 }}>Try again!</p>
                  {(quest.hint || quest.step2Hint) && (
                    <p style={{ margin: 0, fontSize: 13, color: '#991b1b' }}>
                      <strong>💡 Hint:</strong> {quest.hint || quest.step2Hint}
                    </p>
                  )}
                </div>
              )}

              {/* CORRECT SUBMISSION FEEDBACK */}
              {isQuestionAnswered && (
                <div className="feedback-notice-card success" role="status">
                  <div className="feedback-title">✓ Correct! Great job!</div>
                  <p>Knowledge challenge verified successfully.</p>
                </div>
              )}

              {isQuestionAnswered && (
                <div className="step-continue-wrap" style={{ marginTop: 18 }}>
                  <button
                    className="game-primary-btn next-step-action-btn"
                    type="button"
                    onClick={handleContinueToStep3}
                  >
                    CONTINUE TO STEP 3 →
                  </button>
                </div>
              )}
            </section>
          )}

          {/* ================= STEP 3: IMAGE-BASED OBSERVATION QUESTION ================= */}
          {currentStep === 3 && (
            <section className="fullscreen-step-section" aria-labelledby="step3-title">
              <header className="step-title-header">
                <span className="step-kicker-pill">STEP 3</span>
                <h2 id="step3-title">📸 STEP 3 • IMAGE OBSERVATION & VISIT PROOF</h2>
              </header>

              <div className="clue-description-bubble" style={{ marginBottom: 14 }}>
                <span className="clue-tag-title">📍 Location Reference</span>
                <p className="clue-body-text">
                  Examine the image from <strong>{quest.location || quest.destinationName}</strong> and answer the observation question below.
                </p>
              </div>

              {/* REDUCED SIZE IMAGE CONTAINER (MAX-WIDTH: 500px, MAX-HEIGHT: 300px, CENTERED, OBJECT-FIT: CONTAIN) */}
              <div className="step3-observation-image-card">
                <img
                  src={imagePreview || quest.step3Image || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80'}
                  alt={quest.title}
                  className="step3-image"
                />
              </div>

              {/* OBSERVATION QUESTION */}
              <div className="quiz-question-box">
                <p className="quiz-prompt-text">
                  {quest.step3Question || `Look at the image. Which area or feature shown belongs to the ${quest.location || quest.destinationName} environment?`}
                </p>
              </div>

              {/* OBSERVATION CHOICES */}
              <div className="quiz-options-list">
                {step3Options.map((option, index) => {
                  const letter = String.fromCharCode(65 + index)
                  const formattedLabel = option.startsWith(`${letter}.`) ? option : `${letter}. ${option}`
                  const isSelected = selectedStep3Answer === option
                  const isMatch =
                    !quest.step3CorrectAnswer ||
                    option === quest.step3CorrectAnswer ||
                    option.replace(/^[A-D]\.\s*/, '').trim() === (quest.step3CorrectAnswer || '').replace(/^[A-D]\.\s*/, '').trim()
                  const isCorrect = isStep3Answered && isMatch
                  const isWrong = !isStep3Answered && isSelected && step3Feedback === 'incorrect'

                  return (
                    <button
                      key={index}
                      type="button"
                      className={`quiz-choice-btn${isSelected ? ' selected' : ''}${isCorrect ? ' correct' : ''}${isWrong ? ' incorrect' : ''}`}
                      onClick={() => handleStep3AnswerSubmit(option)}
                      disabled={isStep3Answered}
                    >
                      <span className="opt-letter">{letter}</span>
                      <span className="opt-label">{formattedLabel}</span>
                      {isCorrect && <span className="opt-check">✓</span>}
                    </button>
                  )
                })}
              </div>

              {/* FEEDBACK FOR STEP 3 */}
              {step3Feedback === 'incorrect' && !isStep3Answered && (
                <div className="feedback-notice-card error" role="alert">
                  <div className="feedback-title">❌ Wrong option</div>
                  <p style={{ margin: '0 0 6px', fontWeight: 700 }}>Try again!</p>
                  {quest.step3Hint && (
                    <p style={{ margin: 0, fontSize: 13, color: '#991b1b' }}>
                      <strong>💡 Hint:</strong> {quest.step3Hint}
                    </p>
                  )}
                </div>
              )}

              {isStep3Answered && (
                <div className="feedback-notice-card success" role="status">
                  <div className="feedback-title">✓ Observation Verified!</div>
                  <p>Great visual analysis! You recognized the key feature of this location.</p>
                </div>
              )}

              {/* OPTIONAL PHOTO UPLOAD */}
              <div className="step3-custom-upload-bar">
                <label htmlFor="step3-photo-input" className="step3-upload-label">
                  <span>📷 {imagePreview ? 'Change Custom Photo' : 'Upload Your Own Campus Photo (Optional)'}</span>
                  <input
                    id="step3-photo-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden-file-input"
                  />
                </label>
                {imagePreview && (
                  <button className="game-link-btn" type="button" onClick={handleRemovePhoto}>
                    Reset Photo
                  </button>
                )}
              </div>

              {photoError && (
                <div className="feedback-notice-card error" role="alert" style={{ marginTop: 10 }}>
                  <div className="feedback-title">❌ Upload Error</div>
                  <p style={{ margin: 0 }}>{photoError}</p>
                </div>
              )}

              {isStep3Done && (
                <div className="step-continue-wrap" style={{ marginTop: 20 }}>
                  <button
                    className="game-primary-btn next-step-action-btn"
                    type="button"
                    onClick={handleContinueToStep4}
                  >
                    CONTINUE TO STEP 4 →
                  </button>
                </div>
              )}
            </section>
          )}

          {/* ================= STEP 4: VERIFICATION (SCAN QR OR ENTER CODE) ================= */}
          {currentStep === 4 && (
            <section className="fullscreen-step-section" aria-labelledby="step4-title">
              <header className="step-title-header">
                <span className="step-kicker-pill">STEP 4</span>
                <h2 id="step4-title">🎯 STEP 4 • COMPLETE THE QUEST</h2>
              </header>

              <p className="step-helper-desc">
                Verify that you reached the correct location.
              </p>

              {!isQrVerified ? (
                <div className="verification-methods-wrapper">
                  {/* OPTION 1: SCAN QR CODE */}
                  <div className="verification-box">
                    <div className="verification-box-header">
                      <span className="v-icon">📷</span>
                      <h3>SCAN QR CODE</h3>
                    </div>
                    <p className="v-desc">Scan the QR placed at the quest location.</p>
                    <button
                      className="game-primary-btn v-action-btn"
                      type="button"
                      onClick={() => {
                        setManualCodeError('')
                        setIsScannerOpen(true)
                      }}
                    >
                      📷 OPEN QR SCANNER
                    </button>
                  </div>

                  <div className="verification-divider-row">
                    <span className="divider-text">— OR —</span>
                  </div>

                  {/* OPTION 2: ENTER VERIFICATION CODE */}
                  <div className="verification-box">
                    <div className="verification-box-header">
                      <span className="v-icon">⌨️</span>
                      <h3>ENTER VERIFICATION CODE</h3>
                    </div>
                    <p className="v-desc">Enter the code displayed at the quest location.</p>

                    <form onSubmit={handleManualCodeSubmit} className="manual-code-form">
                      <input
                        type="text"
                        className="clean-input"
                        placeholder="e.g. AIML25"
                        value={manualVerificationCode}
                        onChange={(e) => setManualVerificationCode(e.target.value)}
                        autoComplete="off"
                        spellCheck="false"
                      />
                      <button
                        className="game-secondary-btn v-action-btn"
                        type="submit"
                        style={{ marginTop: 10 }}
                      >
                        ✓ VERIFY CODE
                      </button>
                    </form>
                  </div>

                  {manualCodeError && (
                    <div className="feedback-notice-card error" role="alert">
                      <div className="feedback-title">Verification Failed</div>
                      <p>{manualCodeError}</p>
                    </div>
                  )}

                  <div className="verification-help-footer">
                    <p>
                      Look for the official <strong>CampusQuest QR sticker</strong> or code near the entrance/bulletin board of this facility.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="verification-success-panel">
                  <div className="feedback-notice-card success" role="status">
                    <div className="feedback-title">✓ Location Verified!</div>
                    <p>All quest challenges and location verification are complete.</p>
                  </div>

                  <button
                    className="game-primary-btn finish-quest-giant-btn"
                    type="button"
                    onClick={handleFinishQuest}
                    disabled={!canCompleteQuest}
                    style={{ marginTop: 24, width: '100%', padding: '16px' }}
                  >
                    🎉 COMPLETE QUEST & CLAIM +{quest.xp} XP 🚀
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* QR SCANNER MODAL */}
      {isScannerOpen && (
        <QrScannerModal
          quest={quest}
          onScanSuccess={handleScanSuccess}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </div>
  )
}

export default QuestDetails