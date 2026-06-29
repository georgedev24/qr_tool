import { useState, useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'
import TypePanel from './components/TypePanel'
import StylePanel from './components/StylePanel'
import NavBar from './components/NavBar'
import WifiCardModal, { DEFAULT_CARD_SETTINGS } from './components/WifiCardModal'
import PatchNotesModal from './components/PatchNotesModal'
import { buildQrData } from './lib/qrData'
import './styles/app.css'

const DEFAULT_STYLE = {
  width: 1024,
  height: 1024,
  dotsOptions:          { type: 'square', color: '#1a1a1a', gradient: null },
  backgroundOptions:    { color: '#ffffff' },
  cornersSquareOptions: { type: 'square', color: '#1a1a1a' },
  cornersDotOptions:    { type: 'square', color: '#1a1a1a' },
  imageOptions:         { crossOrigin: 'anonymous', margin: 6, imageSize: 0.25 },
  qrOptions:            { errorCorrectionLevel: 'H' },
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

const MAX_HISTORY = 60
const baseName = (p) => p.replace(/\\/g, '/').split('/').pop()

export default function App() {
  const [activeType, setActiveType]     = useState('wifi')
  const [formData, setFormData]         = useState(DEFAULT_DATA)
  const [style, setStyle]               = useState(DEFAULT_STYLE)
  const [logoDataUrl, setLogoDataUrl]   = useState(null)
  const [cardSettings, setCardSettings] = useState(DEFAULT_CARD_SETTINGS)
  const [showCardModal, setShowCardModal]   = useState(false)
  const [showPatchNotes, setShowPatchNotes] = useState(false)
  const [updateState, setUpdateState]   = useState(null)
  const [projectPath, setProjectPath]   = useState(null)
  const [isDirty, setIsDirty]           = useState(false)
  const [canUndo, setCanUndo]           = useState(false)
  const [canRedo, setCanRedo]           = useState(false)

  const previewSize = 220
  const qrRef      = useRef(null)
  const qrInstance = useRef(null)

  // Refs for stable access inside async/event handlers
  const activeTypeRef   = useRef(activeType)
  const formDataRef     = useRef(formData)
  const styleRef        = useRef(style)
  const logoDataUrlRef  = useRef(logoDataUrl)
  const cardSettingsRef = useRef(cardSettings)
  const projectPathRef  = useRef(null)
  const isDirtyRef      = useRef(false)
  const loadingRef      = useRef(false)
  const mountedRef      = useRef(false)
  const isUndoingRef    = useRef(false)

  // History stack
  const historyRef    = useRef([{ activeType: 'wifi', formData: DEFAULT_DATA, style: DEFAULT_STYLE, logoDataUrl: null }])
  const historyIdxRef = useRef(0)

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

  // History push  -  debounced, skipped during undo/redo and loads
  useEffect(() => {
    if (!mountedRef.current) return
    if (loadingRef.current || isUndoingRef.current) return
    const timer = setTimeout(() => {
      const snap = { activeType, formData, style, logoDataUrl }
      const hist = historyRef.current.slice(0, historyIdxRef.current + 1)
      hist.push(snap)
      if (hist.length > MAX_HISTORY) hist.splice(0, hist.length - MAX_HISTORY)
      historyRef.current = hist
      historyIdxRef.current = hist.length - 1
      setCanUndo(historyIdxRef.current > 0)
      setCanRedo(false)
    }, 350)
    return () => clearTimeout(timer)
  }, [activeType, formData, style, logoDataUrl])

  // Window title
  useEffect(() => {
    if (!window.electronAPI) return
    const name = projectPath ? baseName(projectPath) : 'Untitled'
    window.electronAPI.setTitle(`${name}${isDirty ? ' ●' : ''}  -  QR Tool`)
  }, [projectPath, isDirty])

  // QR preview init (runs once)
  useEffect(() => {
    qrInstance.current = new QRCodeStyling({
      ...DEFAULT_STYLE, width: previewSize, height: previewSize, data: ' ',
    })
    if (qrRef.current) {
      qrRef.current.innerHTML = ''
      qrInstance.current.append(qrRef.current)
    }
  }, [])

  // Undo / Redo
  const applyHistoryEntry = (idx) => {
    const s = historyRef.current[idx]
    if (!s) return
    isUndoingRef.current = true
    setActiveType(s.activeType)
    setFormData(s.formData)
    setStyle(s.style)
    setLogoDataUrl(s.logoDataUrl)
    requestAnimationFrame(() => { isUndoingRef.current = false })
  }

  const handleUndo = () => {
    if (historyIdxRef.current <= 0) return
    historyIdxRef.current--
    applyHistoryEntry(historyIdxRef.current)
    setCanUndo(historyIdxRef.current > 0)
    setCanRedo(true)
  }

  const handleRedo = () => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return
    historyIdxRef.current++
    applyHistoryEntry(historyIdxRef.current)
    setCanUndo(true)
    setCanRedo(historyIdxRef.current < historyRef.current.length - 1)
  }

  // Generate QR (manual)
  const handleGenerate = () => {
    if (!qrInstance.current) return
    const data = buildQrData(activeTypeRef.current, formDataRef.current[activeTypeRef.current]) || ' '
    qrInstance.current.update({
      ...styleRef.current,
      width: previewSize,
      height: previewSize,
      data,
      image: logoDataUrlRef.current || undefined,
    })
  }

  // Auto-updater events
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
    const result = await window.electronAPI.saveProject({
      data: getProjectData(),
      filePath: saveAs ? null : projectPathRef.current,
    })
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
    // Reset history to this loaded state
    const snap = {
      activeType: data.activeType || 'wifi',
      formData:   data.formData   || DEFAULT_DATA,
      style:      data.style      || DEFAULT_STYLE,
      logoDataUrl: data.logoDataUrl || null,
    }
    historyRef.current    = [snap]
    historyIdxRef.current = 0
    setCanUndo(false)
    setCanRedo(false)
    // Render QR for the loaded data
    const built = buildQrData(snap.activeType, snap.formData[snap.activeType]) || ' '
    requestAnimationFrame(() => {
      if (qrInstance.current) {
        qrInstance.current.update({
          ...snap.style, width: previewSize, height: previewSize,
          data: built, image: snap.logoDataUrl || undefined,
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

  // Ref-stable handlers for menu & close events
  const handleNewRef    = useRef(null)
  const handleOpenRef   = useRef(null)
  const handleSaveRef   = useRef(null)
  const handleSaveAsRef = useRef(null)

  handleNewRef.current = async () => {
    if (!(await confirmAndProceed())) return
    loadingRef.current = true
    setActiveType('wifi')
    setFormData(DEFAULT_DATA)
    setStyle(DEFAULT_STYLE)
    setLogoDataUrl(null)
    setCardSettings(DEFAULT_CARD_SETTINGS)
    setProjectPath(null)
    setIsDirty(false)
    projectPathRef.current = null
    isDirtyRef.current = false
    historyRef.current    = [{ activeType: 'wifi', formData: DEFAULT_DATA, style: DEFAULT_STYLE, logoDataUrl: null }]
    historyIdxRef.current = 0
    setCanUndo(false); setCanRedo(false)
    requestAnimationFrame(() => { loadingRef.current = false })
  }

  handleOpenRef.current = async () => {
    if (!(await confirmAndProceed())) return
    const result = await window.electronAPI?.openProject()
    if (result) doLoad(result.data, result.filePath)
  }

  handleSaveRef.current   = () => doSave(false)
  handleSaveAsRef.current = () => doSave(true)

  // Keyboard shortcuts (Ctrl+Z/Y/N/O/S)
  useEffect(() => {
    const handler = (e) => {
      const ctrl = e.ctrlKey || e.metaKey
      if (!ctrl) return
      if (e.key === 'z') { e.preventDefault(); handleUndo() }
      else if (e.key === 'y') { e.preventDefault(); handleRedo() }
      else if (e.key === 'n') { e.preventDefault(); handleNewRef.current?.() }
      else if (e.key === 'o') { e.preventDefault(); handleOpenRef.current?.() }
      else if (e.key === 's' && e.shiftKey) { e.preventDefault(); handleSaveAsRef.current?.() }
      else if (e.key === 's') { e.preventDefault(); handleSaveRef.current?.() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
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
      if (isDirtyRef.current) { if (!(await confirmAndProceed())) return }
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
      ...styleRef.current,
      data:  buildQrData(activeTypeRef.current, formDataRef.current[activeTypeRef.current]) || ' ',
      image: logoDataUrlRef.current || undefined,
    })

    if (format === 'copy') {
      const blob = await exportQr.getRawData('png')
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      return
    }

    const isSvg = format === 'svg'
    const blob  = await exportQr.getRawData(isSvg ? 'svg' : 'png')
    const buf   = await blob.arrayBuffer()
    if (window.electronAPI) {
      await window.electronAPI.saveFile({
        buffer: Array.from(new Uint8Array(buf)),
        defaultName: isSvg ? 'qr-code.svg' : 'qr-code.png',
        filters: [{ name: isSvg ? 'SVG' : 'PNG', extensions: [isSvg ? 'svg' : 'png'] }],
      })
    } else {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `qr-code.${isSvg ? 'svg' : 'png'}`; a.click()
    }
  }

  const projectName = projectPath ? baseName(projectPath) : null

  return (
    <div className="app-shell">
      <NavBar
        projectName={projectName}
        isDirty={isDirty}
        canUndo={canUndo}
        canRedo={canRedo}
        activeType={activeType}
        onNew={() => handleNewRef.current?.()}
        onOpen={() => handleOpenRef.current?.()}
        onSave={() => handleSaveRef.current?.()}
        onSaveAs={() => handleSaveAsRef.current?.()}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onGenerate={handleGenerate}
        onExport={handleExport}
        onPatchNotes={() => setShowPatchNotes(true)}
        onCheckUpdates={() => window.electronAPI?.checkForUpdates()}
        onExit={() => window.electronAPI?.close()}
      />

      {updateState === 'downloaded' && (
        <div className="update-banner update-banner-ready">
          Update ready to install  - 
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

      {showPatchNotes && <PatchNotesModal onClose={() => setShowPatchNotes(false)} />}
    </div>
  )
}
