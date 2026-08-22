import { useEffect, useRef, useState } from 'react'

function QrScannerModal({ quest, onScanSuccess, onClose }) {
  const [activeTab, setActiveTab] = useState('camera') // 'camera' or 'manual'
  const [cameraError, setCameraError] = useState('')
  const [manualCode, setManualCode] = useState('')
  const [validationError, setValidationError] = useState('')
  const [successNotice, setSuccessNotice] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const scanIntervalRef = useRef(null)

  const expectedCodes = [
    (quest.qrId || '').trim().toUpperCase(),
    (quest.verificationCode || '').trim().toUpperCase(),
    (quest.qrCode || '').trim().toUpperCase(),
    (quest.qrCodeData || '').trim().toUpperCase(),
    (quest.qrVerificationCode || '').trim().toUpperCase(),
  ].filter(Boolean)

  // Start Camera Stream
  useEffect(() => {
    let isMounted = true

    async function startCamera() {
      if (activeTab !== 'camera') return
      setCameraError('')

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera not supported')
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        })

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.setAttribute('playsinline', 'true')
          await videoRef.current.play()
        }

        // Initialize BarcodeDetector API if available in browser
        if ('BarcodeDetector' in window) {
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
          scanIntervalRef.current = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              try {
                const barcodes = await detector.detect(videoRef.current)
                if (barcodes.length > 0) {
                  const scannedValue = barcodes[0].rawValue?.trim()
                  handleScannedValue(scannedValue)
                }
              } catch {
                // Frame scanning
              }
            }
          }, 350)
        }
      } catch {
        if (isMounted) {
          setCameraError('Camera access is unavailable. Please grant camera permissions or enter the code manually.')
        }
      }
    }

    startCamera()

    return () => {
      isMounted = false
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [activeTab])

  function handleScannedValue(scannedValue) {
    if (!scannedValue) return
    const cleanScanned = scannedValue.trim().toUpperCase()

    if (expectedCodes.includes(cleanScanned)) {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
      setSuccessNotice(`✓ Verified! Quest location confirmed. +${quest.xp} XP`)
      setTimeout(() => {
        onScanSuccess(cleanScanned)
      }, 700)
    } else {
      setValidationError('✕ Invalid QR: This QR code is not valid for this quest.')
    }
  }

  function handleManualSubmit(e) {
    e.preventDefault()
    const clean = manualCode.trim().toUpperCase()

    if (!clean) {
      setValidationError('Please enter a verification code.')
      return
    }

    if (expectedCodes.includes(clean)) {
      setSuccessNotice(`✓ Verified! Quest location confirmed. +${quest.xp} XP`)
      setTimeout(() => {
        onScanSuccess(clean)
      }, 500)
    } else {
      setValidationError('✕ Invalid Code: Please check the code and try again.')
    }
  }

  return (
    <div className="clean-modal-backdrop" role="presentation" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="clean-card scanner-dialog-modal" role="dialog" aria-modal="true" aria-labelledby="scanner-title">
        <div className="scanner-header-row">
          <div>
            <span className="game-kicker">STEP 4 VERIFICATION</span>
            <h2 id="scanner-title">Scan QR Code</h2>
          </div>
          <button className="clean-close-btn" type="button" onClick={onClose} aria-label="Close QR scanner">✕</button>
        </div>

        <p className="scanner-guide-text">
          Scan the QR placed at the quest location.
        </p>

        {/* Tab switch */}
        <div className="scanner-tab-switch">
          <button
            className={`scanner-tab${activeTab === 'camera' ? ' active' : ''}`}
            type="button"
            onClick={() => { setActiveTab('camera'); setValidationError('') }}
          >
            📷 Camera Scanner
          </button>
          <button
            className={`scanner-tab${activeTab === 'manual' ? ' active' : ''}`}
            type="button"
            onClick={() => { setActiveTab('manual'); setValidationError('') }}
          >
            ⌨️ Enter Manually
          </button>
        </div>

        {activeTab === 'camera' && (
          <div className="camera-scan-container">
            {!cameraError ? (
              <div className="camera-frame-box">
                <video ref={videoRef} className="live-video-element" />
                <div className="reticle-box">
                  <div className="reticle-line laser-sweep" />
                </div>
                <span className="camera-aim-hint">Point camera directly at the location QR code</span>
              </div>
            ) : (
              <div className="camera-denied-box">
                <span className="denied-icon">📷⚠️</span>
                <p>{cameraError}</p>
                <button
                  className="game-secondary-btn"
                  type="button"
                  onClick={() => setActiveTab('manual')}
                >
                  Enter Code Manually →
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'manual' && (
          <form className="manual-entry-form" onSubmit={handleManualSubmit}>
            <div className="auth-field-group">
              <label htmlFor="manual-scan-input">Verification Code</label>
              <input
                id="manual-scan-input"
                type="text"
                value={manualCode}
                onChange={(e) => { setManualCode(e.target.value); setValidationError('') }}
                placeholder="Enter verification code"
                autoComplete="off"
                autoFocus
              />
            </div>
            <button className="game-primary-btn manual-verify-btn" type="submit">
              Verify Code
            </button>
          </form>
        )}

        {validationError && (
          <div className="feedback-notice-card error" role="alert" style={{ marginTop: 12 }}>
            <span>{validationError}</span>
          </div>
        )}

        {successNotice && (
          <div className="feedback-notice-card success" role="status" style={{ marginTop: 12 }}>
            <span>{successNotice}</span>
          </div>
        )}

        <div className="scanner-footer-notice" style={{ marginTop: 14 }}>
          <small>🔒 Scan the QR code at the quest location or enter the verification code provided there.</small>
        </div>
      </div>
    </div>
  )
}

export default QrScannerModal
