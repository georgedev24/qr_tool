import { useState, useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'
import TypePanel from './components/TypePanel'
import StylePanel from './components/StylePanel'
import ExportBar from './components/ExportBar'
import WifiCardModal, { DEFAULT_CARD_SETTINGS } from './components/WifiCardModal'
import { buildQrData } from './lib/qrData'
import './styles/app.css'

const DEFAULT_STYLE = {
  width: 1024,
  height: 1024,
  dotsOptions:        { type: 'square', color: '#1a1a1a', gradient: null },
  backgroundOptions:  { color: '#ffffff' },
  cornersSquareOptions: { type: 'square', color: '#1a1a1a' },
  cornersDotOptions:  { type: 'square', color: '#1a1a1a' },
  imageOptions:       { crossOrigin: 'anonymous', margin: 6, imageSize: 0.25 },
  qrOptions:          { errorCorrectionLevel: 'H' },
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

const baseName = (p) => p.replace(/\\/g, '/').split('/').pop()

export default function App() {
  const [activeType, setActiveType]   = useState('wifi')
  const [formData, setFormData]       = useState(DEFAULT_DATA)
  const [style, setStyle]             = useState(DEFAULT_STYLE)
  const [logoDataUrl, setLogoDataUrl] = useState(null)
  const [cardSettings, setCardSettings] = useState(DEFAULT_CARD_SETTINGS)
  const [showCardModal, setShowCardModal] = useState(false)
  const [updateState, setUpdateState] = useState(null)
  const [projectPath, setProjectPath] = useState(null)
  const [isDirty, setIsDirty]         = useState(false)

  // renderedQrData: what's actually encoded in the preview QR (only updated on Generate)
  const [renderedQrData, setRenderedQrData] = useState(' ')

  const previewSize = 220
  const qrRef       = useRef(null)
  const qrInstance  = useRef(null)

  // Refs for stable access in event handlers
  const activeTypeRef   = useRef(activeType)
  const formDataRef     = useRef(formData)
  const styleRef        = useRef(style)
  const logoDataUrlRef  = useRef(logoDataUrl)
  const cardSettingsRef = useRef(cardSettings)
  const projectPathRef  = useRef(null)
  const isDirtyRef      = useRef(false)
  const loadingRef      = useRef(false)
  const mountedRef      = useRef(false)

  useEffect(() => { activeTypeRef.current = activeType },     [activeType])
  useEffect(() => { formDataRef.current = formData },         [formData])
  useEffect(() => { styleRef.current = style },               [style])
  useEffect(() => { logoDataUrlRef.current = logoDataUrl },   [logoDataUrl])
  useEffect(() => { cardSettingsRef.current = cardSettings }, [cardSettings])
  useEffect(() => { projectPathRef.current = projectPath },   [projectPath])
  useEffect(() => { isDirtyRef.current = isDirty },           [isDirty])

  // Mark dirty on any project-state change (skip initial render and loads)
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return }
    if (loadingRef.current) return
    setIsDirty(true)
  }, [activeType, formData, style, logoDataUrl, cardSettings])

  // Window title
  useEffect(() => {
    if (!window.electronAPI) return
    const name = projectPath ? baseName(projectPath) : 'Untitled'
    window.electronAPI.setTitle(`${name}${isDirty ? ' ●' : ''}  -  QR Tool`)
  }, [projectPath, isDirty])

  // --- QR preview init ---
  useEffect(() => {
    qrInstance.current = new QRCodeStyling({
      ...DEFAULT_STYLE,
      width: previewSize,
      height: previewSize,
      data: ' ',
    })
    if (qrRef.current) {
      qrRef.current.innerHTML = ''
      qrInstance.current.append(qrRef.current)
    }
  }, [])

  const handleGenerate = () => {
    if (!qrInstance.current) return
    const data = buildQrData(activeType, formData[activeType]) || ' '
    setRenderedQrData(data)
    qrInstance.current.update({
      ...styleRef.current,
      width: previewSize,
      height: previewSize,
      data,
      image: logoDataUrlRef.current || undefined,
    })
  }

  // Auto-updater
  useEffect(() => {
    if (!window.electronAPI) return
    const offAvailable = window.electronAPI.onUpdateAvailable(() => setUpdateState('available'))
    const offDownloaded = window.electronAPI.onUpdateDownloaded(() => setUpdateState('downloaded'))
    return () => { offAvailable?.(); offDownloaded?.() }
  }, [])

  // --- Project helpers ---
  const getProjectData = () => ({
    version:      '1',
    activeType:   activeTypeRef.current,
    formData:     formDataRef.current,
    style:        styleRef.current,
    logoDataUrl:  logoDataUrlRef.current,
    cardSettings: cardSettingsRef.current,
  })

  const doSave = async (saveAs = false) => {
    if (!window.electronAPI) return false
    const filePath = saveAs ? null : projectPathRef.current
    const result = await window.electronAPI.saveProject({ data: getProjectData(), filePath })
    if (result?.success) {
      setProjectPath(result.filePath)
      projectPathRef.current = result.filePath
      setIsDirty(false)
      isDirtyRef.current = false
      return true
    }
    return false
  }

  const doLoad = (data, filePath) => {
    loadingRef.current = true
    setActiveType(data.activeType || 'wifi')
    setFormData(data.formData || DEFAULT_DATA)
    setStyle(data.style || DEFAULT_STYLE)
    setLogoDataUrl(data.logoDataUrl || null)
    setCardSettings(data.cardSettings || DEFAULT_CARD_SETTINGS)
    setProjectPath(filePath)
    setIsDirty(false)
    projectPathRef.current = filePath
    isDirtyRef.current = false
    // Render QR immediately with loaded data + style
    const builtStyle = data.style || DEFAULT_STYLE
    const built = buildQrData(data.activeType || 'wifi', (data.formData || DEFAULT_DATA)[data.activeType || 'wifi']) || ' '
    setRenderedQrData(built)
    requestAnimationFrame(() => {
      if (qrInstance.current) {
        qrInstance.current.update({
          ...builtStyle,
          width: previewSize,
          height: previewSize,
          data: built,
          image: data.logoDataUrl || undefined,
        })
      }
      loadingRef.current = false
    })
  }

  const confirmAndProceed = async () => {
    if (!isDirtyRef.current) return true
    const response = await window.electronAPI.confirmUnsaved()
    if (response === 0) { const saved = await doSave(); return saved }
    if (response === 1) return true
    return false
  }

  // Ref-stable menu/close handlers
  const handleNewRef    = useRef(null)
  const handleOpenRef   = useRef(null)
  const handleSaveRef   = useRef(null)
  const handleSaveAsRef = useRef(null)

  handleNewRef.current = async () => {
    const proceed = await confirmAndProceed()
    if (!proceed) return
    loadingRef.current = true
    setActiveType('wifi')
    setFormData(DEFAULT_DATA)
    setStyle(DEFAULT_STYLE)
    setLogoDataUrl(null)
    setCardSettings(DEFAULT_CARD_SETTINGS)
    setProjectPath(null)
    setIsDirty(false)
    setRenderedQrData(' ')
    projectPathRef.current = null
    isDirtyRef.current = false
    requestAnimationFrame(() => { loadingRef.current = false })
  }

  handleOpenRef.current = async () => {
    const proceed = await confirmAndProceed()
    if (!proceed) return
    const result = await window.electronAPI.openProject()
    if (result) doLoad(result.data, result.filePath)
  }

  handleSaveRef.current   = () => doSave(false)
  handleSaveAsRef.current = () => doSave(true)

  // Menu event listeners
  useEffect(() => {
    if (!window.electronAPI) return
    const offs = [
      window.electronAPI.onMenuNew(    () => handleNewRef.current?.()),
      window.electronAPI.onMenuOpen(   () => handleOpenRef.current?.()),
      window.electronAPI.onMenuSave(   () => handleSaveRef.current?.()),
      window.electronAPI.onMenuSaveAs( () => handleSaveAsRef.current?.()),
    ]
    return () => offs.forEach(off => off?.())
  }, [])

  // Window close guard
  useEffect(() => {
    if (!window.electronAPI) return
    const off = window.electronAPI.onCloseRequested(async () => {
      if (!isDirtyRef.current) { window.electronAPI.forceQuit(); return }
      const response = await window.electronAPI.confirmUnsaved()
      if (response === 0) { const saved = await doSave(); if (saved) window.electronAPI.forceQuit() }
      else if (response === 1) { window.electronAPI.forceQuit() }
    })
    return () => off?.()
  }, [])

  // Open file via file association
  useEffect(() => {
    if (!window.electronAPI) return
    const off = window.electronAPI.onFileOpen(async ({ data, filePath }) => {
      if (isDirtyRef.current) {
        const proceed = await confirmAndProceed()
        if (!proceed) return
      }
      doLoad(data, filePath)
    })
    return () => off?.()
  }, [])

  const handleDataChange = (field, value) => {
    setFormData(prev => ({ ...prev, [activeType]: { ...prev[activeType], [field]: value } }))
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
    if (format === 'print-card') { setShowCardModal(true); return }

    if (!qrInstance.current) return
    const exportQr = new QRCodeStyling({
      ...style,
      data: renderedQrData || ' ',
      image: logoDataUrl || undefined,
    })

    if (format === 'svg') {
      const blob = await exportQr.getRawData('svg')
      const buf = await blob.arrayBuffer()
      if (window.electronAPI) {
        await window.electronAPI.saveFile({ buffer: Array.from(new Uint8Array(buf)), defaultName: 'qr-code.svg', filters: [{ name: 'SVG', extensions: ['svg'] }] })
      } else {
        const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'qr-code.svg'; a.click()
      }
    } else if (format === 'png') {
      const blob = await exportQr.getRawData('png')
      const buf = await blob.arrayBuffer()
      if (window.electronAPI) {
        await window.electronAPI.saveFile({ buffer: Array.from(new Uint8Array(buf)), defaultName: 'qr-code.png', filters: [{ name: 'PNG', extensions: ['png'] }] })
      } else {
        const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'qr-code.png'; a.click()
      }
    } else if (format === 'copy') {
      const blob = await exportQr.getRawData('png')
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    }
  }

  return (
    <div className="app-shell">
      {updateState === 'downloaded' && (
        <div className="update-banner update-banner-ready">
          Update ready to install -
          <button onClick={() => window.electronAPI?.restartAndInstall()}>Restart &amp; Install</button>
        </div>
      )}
      {updateState === 'available' && (
        <div className="update-banner update-banner-dl">Downloading update…</div>
      )}

      <div className="app-body">
        <TypePanel
          types={QR_TYPES}
          activeType={activeType}
          onTypeChange={setActiveType}
          formData={formData[activeType]}
          onDataChange={handleDataChange}
        />
        <div className="preview-area">
          <div className="qr-preview-wrap">
            <div className="qr-canvas-bg">
              <div ref={qrRef} />
            </div>
            <div className="qr-meta">
              <span className="qr-type-badge">{QR_TYPES.find(t => t.id === activeType)?.label}</span>
              <span className="qr-size-info">{style.width} × {style.height} px</span>
            </div>
            <button className="qr-generate-btn" onClick={handleGenerate}>
              Generate QR
            </button>
          </div>
        </div>
        <StylePanel
          style={style}
          onStyleChange={handleStyleChange}
          logoDataUrl={logoDataUrl}
          onLogoChange={setLogoDataUrl}
        />
      </div>

      <ExportBar onExport={handleExport} activeType={activeType} />

      {showCardModal && (
        <WifiCardModal
          onClose={() => setShowCardModal(false)}
          wifiData={formData.wifi}
          qrStyle={style}
          logoDataUrl={logoDataUrl}
          qrData={buildQrData('wifi', formData.wifi)}
          settings={cardSettings}
          onSettingsChange={setCardSettings}
        />
      )}
    </div>
  )
}
