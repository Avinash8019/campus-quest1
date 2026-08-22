import { useState } from 'react'
import quests from '../data/quests.js'
import { getQuestStatus } from '../utils/gameLevels.js'

function ScanPage({ student, onSelectQuest }) {
  const [manualCode, setManualCode] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [scanError, setScanError] = useState('')

  function handleManualSubmit(e) {
    e.preventDefault()
    setScanError('')
    setScanResult(null)

    const code = manualCode.trim()
    if (!code) {
      setScanError('Please enter a QR code.')
      return
    }

    const matchedQuest = quests.find((q) => q.qrCode.toLowerCase() === code.toLowerCase())
    if (!matchedQuest) {
      setScanError('Invalid QR Code. Please check the code and try again.')
      return
    }

    setScanResult(matchedQuest)
  }

  return (
    <main className="clean-scan-page" aria-label="Scan QR Code">
      <header className="clean-page-header">
        <div>
          <span className="clean-kicker">QR SCANNER</span>
          <h1>Scan Location QR</h1>
          <p className="page-subtitle">
            Find the QR code posted at any SRKR campus quest location and verify your visit.
          </p>
        </div>
      </header>

      <section className="scan-layout-grid">
        <div className="clean-card scan-box-card">
          <h2>Enter QR Code Manually</h2>
          <p className="scan-desc-text">
            Enter the unique quest code found at the campus location (e.g. <code>CQ-Q1-SRKR-001</code>).
          </p>

          <form onSubmit={handleManualSubmit} className="manual-scan-form">
            <div className="input-field-group">
              <label htmlFor="manual-qr-input">Location QR Code</label>
              <input
                id="manual-qr-input"
                type="text"
                value={manualCode}
                onChange={(e) => { setManualCode(e.target.value); setScanError('') }}
                placeholder="e.g. CQ-Q1-SRKR-001"
              />
            </div>

            {scanError && (
              <p className="scan-error-text" role="alert">{scanError}</p>
            )}

            <button className="clean-primary-btn verify-qr-btn" type="submit">
              Verify QR Code →
            </button>
          </form>

          {scanResult && (
            <div className="scan-success-matched-box">
              <div className="matched-header">
                <span>✓ QR Code Matched!</span>
                <h3>{scanResult.title} ({scanResult.correctPlace})</h3>
              </div>
              <p>+{scanResult.xp} XP · {scanResult.difficulty}</p>
              <button
                className="clean-primary-btn"
                type="button"
                onClick={() => onSelectQuest(scanResult)}
              >
                Open {scanResult.title} →
              </button>
            </div>
          )}
        </div>

        <div className="clean-card qr-help-card">
          <h3>Quick QR Codes (Demo Reference)</h3>
          <p>You can test any of these 12 SRKR campus quest codes:</p>
          <div className="demo-qr-list">
            {quests.map((q) => (
              <div key={q.id} className="demo-qr-item" onClick={() => setManualCode(q.qrCode)}>
                <strong>{q.title} ({q.correctPlace}):</strong>
                <code>{q.qrCode}</code>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default ScanPage