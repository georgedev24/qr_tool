import { useState, useEffect, useRef, useCallback } from 'react'
import QRCodeStyling from 'qr-code-styling'
import TypePanel from './components/TypePanel'
import StylePanel from './components/StylePanel'
import ExportBar from './components/ExportBar'
import { buildQrData } from './lib/qrData'
import './styles/app.css'

const DEFAULT_STYLE = {
  width: 1024,
  height: 1024,
  dotsOptions: {
    type: 'square',
    color: '#1a1a1a',
    gradient: null,
  },
  backgroundOptions: {
    color: '#ffffff',
  },
  cornersSquareOptions: {
    type: 'square',
    color: '#1a1a1a',
  },
  cornersDotOptions: {
    type: 'square',
    color: '#1a1a1a',
  },
  imageOptions: {
    crossOrigin: 'anonymous',
    margin: 6,
    imageSize: 0.25,
  },
  qrOptions: {
    errorCorrectionLevel: 'H',
  },
}

const QR_TYPES = [
  { id: 'wifi',     label: 'WiFi',           icon: '📶' },
  { id: 'url',      label: 'URL / Link',      icon: '🔗' },
  { id: 'contact',  label: 'Contact (vCard)', icon: '👤' },
  { id: 'email',    label: 'Email',           icon: '✉️' },
  { id: 'sms',      label: 'SMS',             icon: '💬' },
  { id: 'phone',    label: 'Phone',           icon: '📞' },
  { id: 'location', label: 'Location',        icon: '📍' },
  { id: 'event',    label: 'Calendar event',  icon: '📅' },
  { id: 'text',     label: 'Plain text',      icon: '📝' },
  { id: 'crypto',   label: 'Crypto',          icon: '₿' },
]

const DEFAULT_DATA = {
  wifi:     { ssid: '', password: '', security: 'WPA', hidden: false },
  url:      { url: 'https://' },
  contact:  { firstName: '', lastName: '', phone: '', email: '', org: '', url: '' },
  email:    { to: '', subject: '', body: '' },
  sms:      { phone: '', message: '' },
  phone:    { phone: '' },
  location: { lat: '', lng: '', label: '' },
  event:    { title: '', start: '', end: '', location: '', description: '' },
  text:     { text: '' },
  crypto:   { coin: 'bitcoin', address: '', amount: '' },
}

export default function App() {
  const [activeType, setActiveType] = useState('wifi')
  const [formData, setFormData] = useState(DEFAULT_DATA)
  const [style, setStyle] = useState(DEFAULT_STYLE)
  const [logoDataUrl, setLogoDataUrl] = useState(null)
  const [previewSize, setPreviewSize] = useState(220)

  const qrRef = useRef(null)
  const qrInstance = useRef(null)
  const containerRef = useRef(null)

  const qrData = buildQrData(activeType, formData[activeType])

  useEffect(() => {
    qrInstance.current = new QRCodeStyling({
      ...style,
      width: previewSize,
      height: previewSize,
      data: qrData || ' ',
    })
    if (qrRef.current) {
      qrRef.current.innerHTML = ''
      qrInstance.current.append(qrRef.current)
    }
  }, [])

  const updateQr = useCallback(() => {
    if (!qrInstance.current) return
    qrInstance.current.update({
      ...style,
      width: previewSize,
      height: previewSize,
      data: qrData || ' ',
      image: logoDataUrl || undefined,
    })
  }, [style, qrData, logoDataUrl, previewSize])

  useEffect(() => {
    updateQr()
  }, [updateQr])

  const handleDataChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [activeType]: { ...prev[activeType], [field]: value },
    }))
  }

  const handleStyleChange = (path, value) => {
    setStyle(prev => {
      const next = structuredClone(prev)
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]
      obj[keys[keys.length - 1]] = value
      return next
    })
  }

  const handleExport = async (format) => {
    if (!qrInstance.current) return
    const exportQr = new QRCodeStyling({
      ...style,
      data: qrData || ' ',
      image: logoDataUrl || undefined,
    })

    if (format === 'svg') {
      const blob = await exportQr.getRawData('svg')
      const buf = await blob.arrayBuffer()
      if (window.electronAPI) {
        await window.electronAPI.saveFile({
          buffer: Array.from(new Uint8Array(buf)),
          defaultName: 'qr-code.svg',
          filters: [{ name: 'SVG', extensions: ['svg'] }],
        })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = 'qr-code.svg'; a.click()
      }
    } else if (format === 'png') {
      const blob = await exportQr.getRawData('png')
      const buf = await blob.arrayBuffer()
      if (window.electronAPI) {
        await window.electronAPI.saveFile({
          buffer: Array.from(new Uint8Array(buf)),
          defaultName: 'qr-code.png',
          filters: [{ name: 'PNG', extensions: ['png'] }],
        })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = 'qr-code.png'; a.click()
      }
    } else if (format === 'copy') {
      const blob = await exportQr.getRawData('png')
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    }
  }

  return (
    <div className="app-shell">
      <div className="app-body">
        <TypePanel
          types={QR_TYPES}
          activeType={activeType}
          onTypeChange={setActiveType}
          formData={formData[activeType]}
          onDataChange={handleDataChange}
        />
        <div className="preview-area" ref={containerRef}>
          <div className="qr-preview-wrap">
            <div className="qr-canvas-bg">
              <div ref={qrRef} />
            </div>
            <div className="qr-meta">
              <span className="qr-type-badge">{QR_TYPES.find(t => t.id === activeType)?.label}</span>
              <span className="qr-size-info">{style.width} × {style.height} px</span>
            </div>
          </div>
        </div>
        <StylePanel
          style={style}
          onStyleChange={handleStyleChange}
          logoDataUrl={logoDataUrl}
          onLogoChange={setLogoDataUrl}
        />
      </div>
      <ExportBar onExport={handleExport} />
    </div>
  )
}
