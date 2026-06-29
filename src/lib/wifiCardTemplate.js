const STRINGS = {
  en: {
    welcome: 'Welcome',
    title: 'Free Guest\nWiFi',
    freeWifi: 'Free WiFi',
    scan: 'Scan with your camera to connect',
    step1: 'Open your camera',
    step2: 'Point at the code',
    step3: 'Connect automatically',
  },
  el: {
    welcome: 'Καλώς ήρθατε',
    title: 'Δωρεάν\nWiFi',
    freeWifi: 'Δωρεάν WiFi',
    scan: 'Σαρώστε με την κάμερα σας για σύνδεση',
    step1: 'Ανοίξτε την κάμερα',
    step2: 'Στρέψτε στον κώδικα',
    step3: 'Συνδεθείτε αυτόματα',
  },
}

export const TEMPLATES = [
  { id: 'elegant', name: 'Elegant', qrBg: '#F4EDD8', bgDefault: '#1A1810' },
  { id: 'clean',   name: 'Clean',   qrBg: '#ffffff', bgDefault: '#ffffff' },
  { id: 'bold',    name: 'Bold',    qrBg: '#ffffff', bgDefault: '#1a1a2e' },
  { id: 'minimal', name: 'Minimal', qrBg: '#ffffff', bgDefault: '#ffffff' },
]

export function generateWifiCardHtml(opts) {
  const tpl = TEMPLATES.find(t => t.id === opts.template) || TEMPLATES[0]
  const merged = { bgColor: tpl.bgDefault, ...opts }
  switch (opts.template) {
    case 'clean':   return cleanTemplate(merged)
    case 'bold':    return boldTemplate(merged)
    case 'minimal': return minimalTemplate(merged)
    default:        return elegantTemplate(merged)
  }
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">`

const PAGE_BASE = `
* { margin: 0; padding: 0; box-sizing: border-box; }
@page { size: 148mm 210mm; margin: 0; }
html, body {
  width: 148mm; height: 210mm; overflow: hidden;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact;
  font-family: 'Montserrat', 'Segoe UI', sans-serif;
}`

function qrImg(qrDataUrl, size = '52mm') {
  return qrDataUrl
    ? `<img src="${qrDataUrl}" alt="QR" style="width:${size};height:${size};display:block;">`
    : `<div style="width:${size};height:${size};background:#e8e8e8;display:flex;align-items:center;justify-content:center;font-size:6mm;color:#bbb;">QR</div>`
}

function stepSvgs(stroke) {
  return [
    `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="9" height="9" rx=".8"/><rect x="13" y="2" width="9" height="9" rx=".8"/><rect x="2" y="13" width="9" height="9" rx=".8"/><rect x="14" y="14" width="2.5" height="2.5"/><rect x="19.5" y="14" width="2.5" height="2.5"/><rect x="14" y="19.5" width="2.5" height="2.5"/><rect x="19.5" y="19.5" width="2.5" height="2.5"/></svg>`,
    `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 10.07 4h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 18.07 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3"/></svg>`,
    `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="${stroke}" stroke="none"/></svg>`,
  ]
}

// ─── Template 1: Elegant (dark / gold) ───────────────────────────────────────

function elegantTemplate({ name = '', tagline = '', networkName = '', accentColor = '#C8972A', bgColor = '#1A1810', qrDataUrl = '', lang = 'en' }) {
  const t = STRINGS[lang] || STRINGS.en
  const a = accentColor || '#C8972A'
  const bg = bgColor || '#1A1810'
  const brandSize = name.length > 14 ? '10mm' : name.length > 9 ? '14mm' : '19mm'
  const icons = stepSvgs(a)

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONTS}<style>
${PAGE_BASE}
body { background: ${bg}; }
.card {
  width: 148mm; height: 210mm;
  background: linear-gradient(160deg, ${shift(bg,12)} 0%, ${bg} 50%, ${shift(bg,-8)} 100%);
  position: relative; display: flex; flex-direction: column;
  align-items: center; padding: 16mm 14mm 10mm;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.frame { position: absolute; inset: 7mm; border: 0.3mm solid ${rgba(a,0.45)}; pointer-events: none; }
.cn { position: absolute; width: 5.5mm; height: 5.5mm; border: 0.5mm solid ${a}; }
.cn-tl { top:7mm; left:7mm; border-right:none; border-bottom:none; }
.cn-tr { top:7mm; right:7mm; border-left:none; border-bottom:none; }
.cn-bl { bottom:7mm; left:7mm; border-right:none; border-top:none; }
.cn-br { bottom:7mm; right:7mm; border-left:none; border-top:none; }
.card::before { content:''; position:absolute; top:0; left:0; right:0; height:40%;
  background: radial-gradient(ellipse 100% 60% at 50% 0%, ${rgba(a,0.07)} 0%, transparent 100%); }
.inner { position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; text-align:center; width:100%; }
.brand { font-family:'Cormorant Garamond',Georgia,serif; font-size:${brandSize}; font-weight:300;
  color:${lighten(a)}; letter-spacing:3mm; line-height:1; text-shadow:0 0 15mm ${rgba(a,0.35)}; margin-bottom:2mm; }
.tagline { font-size:2.4mm; font-weight:500; color:${a}; letter-spacing:1mm; text-transform:uppercase; margin-bottom:5mm; }
.rule { width:100%; display:flex; align-items:center; gap:2.5mm; margin-bottom:5.5mm; }
.rl { flex:1; height:0.2mm; background:linear-gradient(to right, transparent, ${a} 40%, ${a} 60%, transparent); }
.rg { width:1.5mm; height:1.5mm; background:${a}; transform:rotate(45deg); flex-shrink:0; }
.wlabel { font-size:2.3mm; font-weight:600; color:${a}; letter-spacing:1.2mm; text-transform:uppercase; margin-bottom:2mm; }
.wtitle { font-family:'Cormorant Garamond',Georgia,serif; font-size:10mm; color:${lighten(a)};
  letter-spacing:0.8mm; line-height:1.25; margin-bottom:${networkName?'2mm':'5.5mm'}; }
.network-name { font-size:2.2mm; color:${rgba(a,0.65)}; letter-spacing:0.5mm; margin-bottom:3.5mm; }
.qr-box { background:#F4EDD8; border-radius:3.5mm; padding:4mm; margin-bottom:4.5mm;
  box-shadow:0 0 0 0.3mm ${rgba(a,0.6)},0 3mm 10mm rgba(0,0,0,0.5); }
.scan-row { display:flex; align-items:center; gap:2.5mm; margin-bottom:4.5mm; }
.sl { width:7mm; height:0.2mm; background:${rgba(a,0.4)}; }
.st { font-size:2mm; color:${a}; letter-spacing:0.6mm; text-transform:uppercase; white-space:nowrap; }
.steps { display:flex; align-items:flex-start; width:100%; margin-bottom:4mm; }
.step { flex:1; display:flex; flex-direction:column; align-items:center; gap:2mm; }
.icon-ring { width:9mm; height:9mm; border:0.3mm solid ${rgba(a,0.55)}; border-radius:50%;
  display:flex; align-items:center; justify-content:center; }
.step-lbl { font-size:1.9mm; color:${darken(a)}; max-width:20mm; text-align:center; line-height:1.5; }
.step-conn { flex:1; height:0.2mm; background:${rgba(a,0.2)}; margin-top:4.5mm; }
.bot-rule { width:70%; height:0.2mm; background:linear-gradient(to right, transparent, ${rgba(a,0.35)}, transparent); }
</style></head><body>
<div class="card">
  <div class="frame"></div>
  <div class="cn cn-tl"></div><div class="cn cn-tr"></div>
  <div class="cn cn-bl"></div><div class="cn cn-br"></div>
  <div class="inner">
    ${name ? `<div class="brand">${esc(name)}</div>` : ''}
    ${tagline ? `<div class="tagline">${esc(tagline)}</div>` : ''}
    <div class="rule"><div class="rl"></div><div class="rg"></div><div class="rl"></div></div>
    <div class="wlabel">${esc(t.welcome)}</div>
    <div class="wtitle">${esc(t.title).replace('\n','<br>')}</div>
    ${networkName ? `<div class="network-name">${esc(networkName)}</div>` : ''}
    <div class="qr-box">${qrImg(qrDataUrl)}</div>
    <div class="scan-row"><div class="sl"></div><div class="st">${esc(t.scan)}</div><div class="sl"></div></div>
    <div class="steps">
      <div class="step"><div class="icon-ring">${icons[0]}</div><div class="step-lbl">${esc(t.step1)}</div></div>
      <div class="step-conn"></div>
      <div class="step"><div class="icon-ring">${icons[1]}</div><div class="step-lbl">${esc(t.step2)}</div></div>
      <div class="step-conn"></div>
      <div class="step"><div class="icon-ring">${icons[2]}</div><div class="step-lbl">${esc(t.step3)}</div></div>
    </div>
    <div class="bot-rule"></div>
  </div>
</div>
</body></html>`
}

// ─── Template 2: Clean (white / professional) ────────────────────────────────

function cleanTemplate({ name = '', tagline = '', networkName = '', accentColor = '#2563eb', bgColor = '#ffffff', qrDataUrl = '', lang = 'en' }) {
  const t = STRINGS[lang] || STRINGS.en
  const a = accentColor || '#2563eb'
  const bg = bgColor || '#ffffff'
  const icons = stepSvgs(a)
  const brandSize = name.length > 14 ? '7mm' : name.length > 9 ? '9mm' : '11mm'

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONTS}<style>
${PAGE_BASE}
body { background: ${bg}; }
.card {
  width: 148mm; height: 210mm; background: ${bg};
  display: flex; flex-direction: column; align-items: stretch;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.header {
  background: ${a}; padding: 10mm 12mm 8mm;
  display: flex; flex-direction: column; align-items: center; flex-shrink: 0;
}
.brand { font-family:'Cormorant Garamond',Georgia,serif; font-size:${brandSize};
  font-weight:400; color:#fff; letter-spacing:2mm; line-height:1; margin-bottom:2mm; }
.tagline { font-size:2.2mm; font-weight:500; color:${rgba('#ffffff',0.75)}; letter-spacing:0.8mm; text-transform:uppercase; }
.body { flex:1; display:flex; flex-direction:column; align-items:center; padding:7mm 14mm 8mm; }
.wlabel { font-size:2.2mm; font-weight:600; color:${a}; letter-spacing:1.2mm; text-transform:uppercase; margin-bottom:1.5mm; }
.wtitle { font-family:'Cormorant Garamond',Georgia,serif; font-size:9mm; font-weight:300;
  color:#1a1a1a; line-height:1.2; margin-bottom:${networkName?'1.5mm':'5mm'}; text-align:center; }
.network-name { font-size:2.2mm; color:#888; letter-spacing:0.4mm; margin-bottom:4mm; }
.divider { width:100%; height:0.2mm; background:linear-gradient(to right, transparent, ${rgba(a,0.3)}, transparent); margin-bottom:5mm; }
.qr-wrap { background:#fff; border:0.4mm solid ${rgba(a,0.25)}; border-radius:3mm; padding:4mm;
  margin-bottom:4mm; box-shadow:0 2mm 10mm rgba(0,0,0,0.06); }
.scan-text { font-size:2mm; color:#999; letter-spacing:0.5mm; text-transform:uppercase; margin-bottom:5mm; }
.steps { display:flex; align-items:flex-start; width:100%; margin-bottom:auto; }
.step { flex:1; display:flex; flex-direction:column; align-items:center; gap:2mm; }
.step-icon { width:8mm; height:8mm; border-radius:50%; background:${rgba(a,0.1)};
  display:flex; align-items:center; justify-content:center; }
.step-lbl { font-size:1.9mm; color:#777; text-align:center; max-width:20mm; line-height:1.5; }
.step-conn { flex:1; height:0.2mm; background:${rgba(a,0.15)}; margin-top:4mm; }
.footer { border-top:0.2mm solid #f0f0f0; padding:3mm 14mm; display:flex; align-items:center; justify-content:space-between; }
.footer-name { font-size:2mm; color:#bbb; letter-spacing:0.3mm; }
.footer-dot { width:1.2mm; height:1.2mm; background:${rgba(a,0.4)}; border-radius:50%; }
${networkName ? '' : ''}
</style></head><body>
<div class="card">
  <div class="header">
    ${name ? `<div class="brand">${esc(name)}</div>` : ''}
    ${tagline ? `<div class="tagline">${esc(tagline)}</div>` : ''}
  </div>
  <div class="body">
    <div style="height:5mm"></div>
    <div class="wlabel">${esc(t.welcome)}</div>
    <div class="wtitle">${esc(t.title).replace('\n','<br>')}</div>
    ${networkName ? `<div class="network-name">${esc(networkName)}</div>` : ''}
    <div class="divider"></div>
    <div class="qr-wrap">${qrImg(qrDataUrl)}</div>
    <div class="scan-text">${esc(t.scan)}</div>
    <div class="steps">
      <div class="step"><div class="step-icon">${icons[0]}</div><div class="step-lbl">${esc(t.step1)}</div></div>
      <div class="step-conn"></div>
      <div class="step"><div class="step-icon">${icons[1]}</div><div class="step-lbl">${esc(t.step2)}</div></div>
      <div class="step-conn"></div>
      <div class="step"><div class="step-icon">${icons[2]}</div><div class="step-lbl">${esc(t.step3)}</div></div>
    </div>
  </div>
  <div class="footer">
    <div class="footer-name">${esc(name || '')}</div>
    <div class="footer-dot"></div>
    <div class="footer-name">${esc(t.freeWifi)}</div>
  </div>
</div>
</body></html>`
}

// ─── Template 3: Bold (solid accent background) ───────────────────────────────

function boldTemplate({ name = '', tagline = '', networkName = '', accentColor = '#1a1a2e', bgColor = '#1a1a2e', qrDataUrl = '', lang = 'en' }) {
  const t = STRINGS[lang] || STRINGS.en
  const a = accentColor || '#1a1a2e'
  const bg = bgColor || '#1a1a2e'
  const icons = stepSvgs('rgba(255,255,255,0.85)')
  const brandSize = name.length > 14 ? '11mm' : name.length > 9 ? '15mm' : '20mm'

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONTS}<style>
${PAGE_BASE}
body { background: ${bg}; }
.card {
  width: 148mm; height: 210mm;
  background: ${bg};
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 12mm 14mm;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.brand { font-family:'Cormorant Garamond',Georgia,serif; font-size:${brandSize}; font-weight:300;
  color:#fff; letter-spacing:3mm; line-height:1; text-align:center; margin-bottom:1.5mm; }
.tagline { font-size:2.3mm; font-weight:500; color:rgba(255,255,255,0.55); letter-spacing:1mm;
  text-transform:uppercase; text-align:center; margin-bottom:6mm; }
.wifi-label { font-size:2.4mm; font-weight:700; color:rgba(255,255,255,0.6); letter-spacing:1.5mm;
  text-transform:uppercase; text-align:center; margin-bottom:1.5mm; }
.wifi-title { font-family:'Cormorant Garamond',Georgia,serif; font-size:11mm; font-weight:300;
  color:#fff; letter-spacing:1mm; line-height:1.2; text-align:center; margin-bottom:${networkName?'2mm':'6mm'}; }
.network-name { font-size:2.2mm; color:rgba(255,255,255,0.45); letter-spacing:0.5mm; margin-bottom:5mm; }
.qr-wrap { background:#fff; border-radius:4mm; padding:5mm; margin-bottom:5mm;
  box-shadow:0 4mm 20mm rgba(0,0,0,0.35); }
.scan-text { font-size:2mm; color:rgba(255,255,255,0.55); letter-spacing:0.6mm;
  text-transform:uppercase; text-align:center; margin-bottom:6mm; }
.steps { display:flex; align-items:flex-start; width:100%; }
.step { flex:1; display:flex; flex-direction:column; align-items:center; gap:2mm; }
.step-icon { width:8.5mm; height:8.5mm; border-radius:50%; border:0.3mm solid rgba(255,255,255,0.3);
  display:flex; align-items:center; justify-content:center; }
.step-lbl { font-size:1.9mm; color:rgba(255,255,255,0.55); text-align:center; max-width:20mm; line-height:1.5; }
.step-conn { flex:1; height:0.2mm; background:rgba(255,255,255,0.15); margin-top:4.25mm; }
</style></head><body>
<div class="card">
  ${name ? `<div class="brand">${esc(name)}</div>` : ''}
  ${tagline ? `<div class="tagline">${esc(tagline)}</div>` : ''}
  <div class="wifi-label">${esc(t.welcome)}</div>
  <div class="wifi-title">${esc(t.title).replace('\n','<br>')}</div>
  ${networkName ? `<div class="network-name">${esc(networkName)}</div>` : ''}
  <div class="qr-wrap">${qrImg(qrDataUrl)}</div>
  <div class="scan-text">${esc(t.scan)}</div>
  <div class="steps">
    <div class="step"><div class="step-icon">${icons[0]}</div><div class="step-lbl">${esc(t.step1)}</div></div>
    <div class="step-conn"></div>
    <div class="step"><div class="step-icon">${icons[1]}</div><div class="step-lbl">${esc(t.step2)}</div></div>
    <div class="step-conn"></div>
    <div class="step"><div class="step-icon">${icons[2]}</div><div class="step-lbl">${esc(t.step3)}</div></div>
  </div>
</div>
</body></html>`
}

// ─── Template 4: Minimal (pure white, lots of air) ────────────────────────────

function minimalTemplate({ name = '', tagline = '', networkName = '', accentColor = '#111111', bgColor = '#ffffff', qrDataUrl = '', lang = 'en' }) {
  const t = STRINGS[lang] || STRINGS.en
  const a = accentColor || '#111111'
  const bg = bgColor || '#ffffff'

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONTS}<style>
${PAGE_BASE}
body { background: ${bg}; }
.card {
  width: 148mm; height: 210mm; background: ${bg};
  border: 0.3mm solid ${rgba(a, 0.12)};
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 14mm;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
  text-align: center;
}
.brand { font-family:'Cormorant Garamond',Georgia,serif;
  font-size:${name.length > 12 ? '9mm' : '13mm'}; font-weight:400;
  color:${a}; letter-spacing:2mm; margin-bottom:${tagline ? '1.5mm' : '0'}; }
.tagline { font-size:2.2mm; color:#aaa; letter-spacing:0.6mm; text-transform:uppercase; }
.rule { width:16mm; height:0.3mm; background:${a}; margin:6mm auto; opacity:0.2; }
.wifi-text { font-size:3mm; font-weight:600; color:${a}; letter-spacing:1mm;
  text-transform:uppercase; opacity:0.5; margin-bottom:7mm; }
.qr-wrap { margin-bottom:7mm; }
.scan-text { font-size:2.1mm; color:#bbb; letter-spacing:0.5mm; text-transform:uppercase; margin-bottom:3mm; }
.network-name { font-size:2.4mm; font-weight:600; color:${a}; letter-spacing:0.3mm; opacity:0.5; }
</style></head><body>
<div class="card">
  ${name ? `<div class="brand">${esc(name)}</div>` : ''}
  ${tagline ? `<div class="tagline">${esc(tagline)}</div>` : ''}
  <div class="rule"></div>
  <div class="wifi-text">${esc(t.freeWifi)}</div>
  <div class="qr-wrap">${qrImg(qrDataUrl, '60mm')}</div>
  <div class="scan-text">${esc(t.scan)}</div>
  ${networkName ? `<div class="network-name">${esc(networkName)}</div>` : ''}
</div>
</body></html>`
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function rgba(hex, alpha) {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`
  const r = parseInt(hex.slice(1,3), 16)
  const g = parseInt(hex.slice(3,5), 16)
  const b = parseInt(hex.slice(5,7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function lighten(hex) {
  if (!hex || hex.length < 7) return '#DEB858'
  const r = Math.min(255, parseInt(hex.slice(1,3), 16) + 35)
  const g = Math.min(255, parseInt(hex.slice(3,5), 16) + 22)
  const b = Math.min(255, parseInt(hex.slice(5,7), 16) + 8)
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`
}

function shift(hex, amount) {
  if (!hex || hex.length < 7) return hex
  const r = Math.min(255, Math.max(0, parseInt(hex.slice(1,3), 16) + amount))
  const g = Math.min(255, Math.max(0, parseInt(hex.slice(3,5), 16) + amount))
  const b = Math.min(255, Math.max(0, parseInt(hex.slice(5,7), 16) + amount))
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`
}

function darken(hex) {
  if (!hex || hex.length < 7) return '#AA8428'
  const r = Math.max(0, parseInt(hex.slice(1,3), 16) - 35)
  const g = Math.max(0, parseInt(hex.slice(3,5), 16) - 22)
  const b = Math.max(0, parseInt(hex.slice(5,7), 16) - 8)
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`
}
