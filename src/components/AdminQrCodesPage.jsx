import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import quests from '../data/quests.js'

function AdminQrCodesPage() {
  function handlePrintAll() {
    window.print()
  }

  function handlePrintSingle(quest) {
    const printWindow = window.open('', '_blank', 'width=600,height=700')
    if (!printWindow) return

    const qrSvgElement = document.getElementById(`qr-svg-${quest.id}`)
    const svgHtml = qrSvgElement ? qrSvgElement.outerHTML : ''

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CAMPUSQUEST - ${quest.title} QR</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              text-align: center;
              padding: 40px 20px;
              color: #0f172a;
            }
            .print-card {
              border: 3px solid #0f172a;
              border-radius: 16px;
              padding: 36px 24px;
              max-width: 420px;
              margin: 0 auto;
            }
            h1 { font-size: 26px; margin: 0 0 4px; letter-spacing: 0.04em; }
            h2 { font-size: 22px; margin: 0 0 20px; color: #2563eb; }
            .qr-wrap { margin: 20px 0; }
            .sub-tag { font-size: 15px; font-weight: 700; color: #334155; margin: 12px 0 0; }
            .hint { font-size: 13px; color: #64748b; margin-top: 4px; }
            @media print {
              body { padding: 0; }
              .print-card { border-width: 2px; }
            }
          </style>
        </head>
        <body>
          <div class="print-card">
            <h1>CAMPUSQUEST</h1>
            <h2>${quest.title.toUpperCase()}</h2>
            <div class="qr-wrap">${svgHtml}</div>
            <div class="sub-tag">Scan to verify this quest</div>
            <div class="hint">SRKR Engineering College Campus Quest</div>
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  function handleDownloadPng(quest) {
    const svg = document.getElementById(`qr-svg-${quest.id}`)
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    canvas.width = 400
    canvas.height = 400

    img.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 20, 20, 360, 360)
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `CampusQuest-${quest.title.replace(/\s+/g, '')}-QR.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <main className="admin-qr-page" aria-label="Admin QR Codes Management">
      <header className="admin-qr-header no-print">
        <div>
          <span className="clean-kicker">HACKATHON ADMIN PORTAL</span>
          <h1>CAMPUSQUEST — Quest QR Codes</h1>
          <p className="admin-header-desc">
            Generate, download, and print physical location QR codes for all 10+ SRKR campus quests.
          </p>
        </div>

        <button
          className="clean-primary-btn print-all-btn"
          type="button"
          onClick={handlePrintAll}
        >
          🖨️ Print All QR Codes
        </button>
      </header>

      {/* SCREEN GRID OF QR CARDS (Hidden on print) */}
      <section className="admin-qr-grid no-print">
        {quests.map((quest) => (
          <article key={quest.id} className="clean-card admin-qr-card">
            <div className="admin-card-top">
              <span className="admin-quest-badge">{quest.title}</span>
              <span className="admin-place-label">{quest.correctPlace}</span>
            </div>

            <div className="admin-qr-frame">
              <QRCodeSVG
                id={`qr-svg-${quest.id}`}
                value={quest.qrVerificationCode || quest.qrCode}
                size={190}
                level="Q"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#0f172a"
              />
            </div>

            <div className="admin-qr-captions">
              <strong>{quest.title}</strong>
              <small>Scan to verify this quest</small>
            </div>

            <div className="admin-card-actions">
              <button
                className="clean-secondary-btn qr-action-btn"
                type="button"
                onClick={() => handlePrintSingle(quest)}
              >
                🖨️ Print QR
              </button>
              <button
                className="clean-secondary-btn qr-action-btn"
                type="button"
                onClick={() => handleDownloadPng(quest)}
              >
                ⬇️ Download PNG
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* PRINT-ONLY SHEET (Rendered only when printing) */}
      <section className="printable-qr-sheet print-only" aria-hidden="true">
        {quests.map((quest) => (
          <div key={quest.id} className="printable-qr-card-item">
            <div className="print-card-border">
              <div className="print-brand-tag">CAMPUSQUEST</div>
              <h2 className="print-quest-title">{quest.title.toUpperCase()}</h2>

              <div className="print-qr-svg-holder">
                <QRCodeSVG
                  value={quest.qrVerificationCode || quest.qrCode}
                  size={240}
                  level="Q"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>

              <div className="print-scan-instruction">
                Scan this QR at the {quest.title} location.
              </div>
              <div className="print-sub-notice">
                SRKR Engineering College • Campus Adventure Quest
              </div>
            </div>
            <div className="print-divider-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
          </div>
        ))}
      </section>
    </main>
  )
}

export default AdminQrCodesPage
