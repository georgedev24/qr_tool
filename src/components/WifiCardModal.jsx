import { useState, useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { generateWifiCardHtml, TEMPLATES } from '../lib/wifiCardTemplate'
import './WifiCardModal.css'

const DEFAULT_ACCENTS = {
  elegant: '#C8972A',
  clean:   '#2563eb',
  bold:    '#1a1a2e',
  minimal: '#111111',
}

const DEFAULT_BGS = {
  elegant: '#1A1810',
  clean:   '#ffffff',
  bold:    '#1a1a2e',
  minimal: '#ffffff',
}

export default function WifiCardModal({ onClose, wifiData, qrStyle, logoDataUrl, qrData }) {
  const [template, setTemplate]     = useState('elegant')
  const [name, setName]             = useState('')
  const [tagline, setTagline]       = useState('')
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENTS.elegant)
  const [bgColor, setBgColor]       = useState(DEFAULT_BGS.elegant)
  const [lang, setLang]             = useState('en')
  const [qrDataUrl, setQrDataUrl]   = useState('')
  const [saving, setSaving]         = useState(false)
  const iframeRef = useRef(null)

  const currentTpl = TEMPLATES.find(t => t.id === template) || TEMPLATES[0]

  // Regenerate QR whenever template changes (different bg colour) or qrData changes
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
        backgroundOptions: { color: currentTpl.qrBg },
      })
      const blob = await qr.getRawData('svg')
      if (cancelled) return
      const reader = new FileReader()
      reader.onload = e => { if (!cancelled) setQrDataUrl(e.target.result) }
      reader.readAsDataURL(blob)
    }
    genQr()
    return () => { cancelled = true }
  }, [qrData, qrStyle, logoDataUrl, template])

  // Reset accent colour to a sensible default when switching templates
  const handleTemplateChange = (id) => {
    setTemplate(id)
    setAccentColor(DEFAULT_ACCENTS[id] || '#333333')
    setBgColor(DEFAULT_BGS[id] || '#ffffff')
  }

  const html = generateWifiCardHtml({
    template,
    name,
    tagline,
    networkName: wifiData?.ssid || '',
    accentColor,
    bgColor,
    qrDataUrl,
    lang,
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
            <div className="wcm-iframe-clip">
              <iframe
                ref={iframeRef}
                className="wcm-iframe"
                title="Card Preview"
                sandbox="allow-same-origin"
              />
            </div>
          </div>

          <div className="wcm-fields">

            {/* Template picker */}
            <div className="wcm-field-group">
              <label className="wcm-label">Template</label>
              <div className="wcm-template-grid">
                {TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    className={`wcm-tpl-btn ${template === tpl.id ? 'active' : ''}`}
                    onClick={() => handleTemplateChange(tpl.id)}
                  >
                    <span className={`wcm-tpl-swatch wcm-tpl-swatch-${tpl.id}`} />
                    {tpl.name}
                  </button>
                ))}
              </div>
            </div>

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
                  onClick={() => setAccentColor(DEFAULT_ACCENTS[template] || '#333333')}
                  title="Reset colour"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="wcm-field-group">
              <label className="wcm-label">Background colour</label>
              <div className="wcm-color-row">
                <input
                  type="color"
                  className="wcm-color-picker"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                />
                <span className="wcm-color-hex">{bgColor.toUpperCase()}</span>
                <button
                  className="wcm-color-reset"
                  onClick={() => setBgColor(DEFAULT_BGS[template] || '#ffffff')}
                  title="Reset background"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="wcm-field-group">
              <label className="wcm-label">Language</label>
              <div className="wcm-lang-toggle">
                <button className={`wcm-lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
                <button className={`wcm-lang-btn ${lang === 'el' ? 'active' : ''}`} onClick={() => setLang('el')}>ΕΛ</button>
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
