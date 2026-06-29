import { useState, useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { generateWifiCardHtml } from '../lib/wifiCardTemplate'
import './WifiCardModal.css'

export default function WifiCardModal({ onClose, wifiData, qrStyle, logoDataUrl, qrData }) {
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [accentColor, setAccentColor] = useState('#C8972A')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const iframeRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    async function genQr() {
      if (!qrData) return
      const qr = new QRCodeStyling({
        ...qrStyle,
        width: 416,
        height: 416,
        data: qrData,
        image: logoDataUrl || undefined,
        backgroundOptions: { color: '#F4EDD8' },
      })
      const blob = await qr.getRawData('svg')
      if (cancelled) return
      const reader = new FileReader()
      reader.onload = e => { if (!cancelled) setQrDataUrl(e.target.result) }
      reader.readAsDataURL(blob)
    }
    genQr()
    return () => { cancelled = true }
  }, [qrData, qrStyle, logoDataUrl])

  const html = generateWifiCardHtml({
    name,
    tagline,
    networkName: wifiData?.ssid || '',
    accentColor,
    qrDataUrl,
  })

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = html
    }
  }, [html])

  const handleSave = async () => {
    if (!window.electronAPI) return
    setSaving(true)
    try {
      const pdfBuffer = await window.electronAPI.printToPdf({ html })
      if (pdfBuffer) {
        await window.electronAPI.saveFile({
          buffer: pdfBuffer,
          defaultName: `wifi-card${name ? '-' + name.toLowerCase().replace(/\s+/g, '-') : ''}.pdf`,
          filters: [{ name: 'PDF Document', extensions: ['pdf'] }],
        })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="wcm-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="wcm-box">
        <div className="wcm-header">
          <span>WiFi Print Card</span>
          <button className="wcm-close" onClick={onClose}>✕</button>
        </div>

        <div className="wcm-body">
          <div className="wcm-preview-wrap">
            <iframe
              ref={iframeRef}
              className="wcm-iframe"
              title="Card Preview"
              sandbox="allow-same-origin"
            />
          </div>

          <div className="wcm-fields">
            <div className="wcm-field-group">
              <label className="wcm-label">Business name</label>
              <input
                className="wcm-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. ελιά"
              />
            </div>

            <div className="wcm-field-group">
              <label className="wcm-label">Tagline</label>
              <input
                className="wcm-input"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder="Coffee · Brunch · Mini Market"
              />
            </div>

            <div className="wcm-field-group">
              <label className="wcm-label">Accent colour</label>
              <div className="wcm-color-row">
                <input
                  type="color"
                  className="wcm-color-picker"
                  value={accentColor}
                  onChange={e => setAccentColor(e.target.value)}
                />
                <span className="wcm-color-hex">{accentColor.toUpperCase()}</span>
                <button
                  className="wcm-color-reset"
                  onClick={() => setAccentColor('#C8972A')}
                  title="Reset to gold"
                >
                  Reset
                </button>
              </div>
            </div>

            {wifiData?.ssid && (
              <div className="wcm-network-info">
                <span className="wcm-network-label">Network</span>
                <span className="wcm-network-name">{wifiData.ssid}</span>
              </div>
            )}

            <div className="wcm-actions">
              <button className="wcm-save-btn" onClick={handleSave} disabled={saving || !qrDataUrl}>
                {saving ? 'Saving…' : 'Save PDF'}
              </button>
              <p className="wcm-hint">A5 (148 × 210 mm)  -  print-ready</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
