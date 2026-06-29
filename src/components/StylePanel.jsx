import { useRef } from 'react'
import './StylePanel.css'

const DOT_TYPES = [
  { value: 'square', label: 'Square' },
  { value: 'dots', label: 'Dots' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'extra-rounded', label: 'Extra round' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy round' },
]

const CORNER_SQUARE_TYPES = [
  { value: 'square', label: 'Square' },
  { value: 'extra-rounded', label: 'Rounded' },
  { value: 'dot', label: 'Dot' },
]

const CORNER_DOT_TYPES = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
]

const EC_LEVELS = [
  { value: 'L', label: 'L', sub: '7%' },
  { value: 'M', label: 'M', sub: '15%' },
  { value: 'Q', label: 'Q', sub: '25%' },
  { value: 'H', label: 'H', sub: '30%' },
]

const OUTPUT_SIZES = [256, 512, 1024, 2048, 4096]

function Section({ title, children, defaultOpen = true }) {
  return (
    <details className="style-section" open={defaultOpen}>
      <summary className="style-section-head">{title}</summary>
      <div className="style-section-body">{children}</div>
    </details>
  )
}

function ColorRow({ label, value, onChange }) {
  return (
    <div className="color-row">
      <span className="color-label">{label}</span>
      <div className="color-input-wrap">
        <input
          type="color"
          className="color-picker"
          value={value || '#000000'}
          onChange={e => onChange(e.target.value)}
        />
        <span className="color-hex">{(value || '#000000').toUpperCase()}</span>
      </div>
    </div>
  )
}

function DotStyleGrid({ types, value, onChange }) {
  return (
    <div className="dot-grid">
      {types.map(t => (
        <button
          key={t.value}
          className={`dot-btn ${value === t.value ? 'active' : ''}`}
          onClick={() => onChange(t.value)}
          title={t.label}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export default function StylePanel({ style, onStyleChange, logoDataUrl, onLogoChange }) {
  const fileRef = useRef(null)

  const dotType = style.dotsOptions?.type || 'square'
  const dotColor = style.dotsOptions?.color || '#1a1a1a'
  const bgColor = style.backgroundOptions?.color || '#ffffff'
  const eyeSquareColor = style.cornersSquareOptions?.color || '#1a1a1a'
  const eyeDotColor = style.cornersDotOptions?.color || '#1a1a1a'
  const eyeSquareType = style.cornersSquareOptions?.type || 'square'
  const eyeDotType = style.cornersDotOptions?.type || 'square'
  const ecLevel = style.qrOptions?.errorCorrectionLevel || 'H'
  const outputSize = style.width || 1024
  const logoSize = style.imageOptions?.imageSize || 0.25
  const logoMargin = style.imageOptions?.margin || 6

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onLogoChange(ev.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="style-panel">
      <div className="panel-heading" style={{ padding: '10px 12px 6px' }}>Style</div>

      <Section title="Colors">
        <ColorRow label="Dots" value={dotColor} onChange={v => onStyleChange('dotsOptions.color', v)} />
        <ColorRow label="Background" value={bgColor} onChange={v => onStyleChange('backgroundOptions.color', v)} />
        <ColorRow label="Eye frame" value={eyeSquareColor} onChange={v => onStyleChange('cornersSquareOptions.color', v)} />
        <ColorRow label="Eye dot" value={eyeDotColor} onChange={v => onStyleChange('cornersDotOptions.color', v)} />
      </Section>

      <Section title="Dot style">
        <DotStyleGrid types={DOT_TYPES} value={dotType} onChange={v => onStyleChange('dotsOptions.type', v)} />
      </Section>

      <Section title="Eye style">
        <div className="sub-label">Frame</div>
        <DotStyleGrid types={CORNER_SQUARE_TYPES} value={eyeSquareType} onChange={v => onStyleChange('cornersSquareOptions.type', v)} />
        <div className="sub-label" style={{ marginTop: 8 }}>Inner dot</div>
        <DotStyleGrid types={CORNER_DOT_TYPES} value={eyeDotType} onChange={v => onStyleChange('cornersDotOptions.type', v)} />
      </Section>

      <Section title="Center logo">
        <div className="logo-row">
          {logoDataUrl
            ? <img src={logoDataUrl} className="logo-preview" alt="logo" />
            : <div className="logo-empty" onClick={() => fileRef.current?.click()}>+ Upload</div>
          }
          <div className="logo-actions">
            <button className="logo-btn" onClick={() => fileRef.current?.click()}>
              {logoDataUrl ? 'Change' : 'Upload image'}
            </button>
            {logoDataUrl && (
              <button className="logo-btn logo-btn-remove" onClick={() => onLogoChange(null)}>Remove</button>
            )}
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />

        <div className="slider-row">
          <span className="slider-label">Size</span>
          <input
            type="range" min="0.1" max="0.4" step="0.01"
            value={logoSize}
            onChange={e => onStyleChange('imageOptions.imageSize', parseFloat(e.target.value))}
          />
          <span className="slider-val">{Math.round(logoSize * 100)}%</span>
        </div>
        <div className="slider-row">
          <span className="slider-label">Padding</span>
          <input
            type="range" min="0" max="20" step="1"
            value={logoMargin}
            onChange={e => onStyleChange('imageOptions.margin', parseInt(e.target.value))}
          />
          <span className="slider-val">{logoMargin}px</span>
        </div>
        {logoDataUrl && (
          <p className="hint">Error correction auto-set to H when using a logo</p>
        )}
      </Section>

      <Section title="Error correction">
        <div className="ec-row">
          {EC_LEVELS.map(l => (
            <button
              key={l.value}
              className={`ec-btn ${ecLevel === l.value ? 'active' : ''}`}
              onClick={() => onStyleChange('qrOptions.errorCorrectionLevel', l.value)}
            >
              <span className="ec-letter">{l.label}</span>
              <span className="ec-sub">{l.sub}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Output size" defaultOpen={false}>
        <div className="size-row">
          {OUTPUT_SIZES.map(s => (
            <button
              key={s}
              className={`size-btn ${outputSize === s ? 'active' : ''}`}
              onClick={() => {
                onStyleChange('width', s)
                onStyleChange('height', s)
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="hint">px · exported at full resolution</p>
      </Section>
    </div>
  )
}
