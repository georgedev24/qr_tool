export function generateWifiCardHtml({ name = '', tagline = '', networkName = '', accentColor = '#C8972A', qrDataUrl = '' }) {
  const accent = accentColor || '#C8972A'

  const brandSize = name.length > 14 ? '10mm' : name.length > 9 ? '14mm' : '19mm'

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(name) || 'WiFi'} Card</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

@page {
  size: 148mm 210mm;
  margin: 0;
}

html, body {
  width: 148mm;
  height: 210mm;
  overflow: hidden;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  color-adjust: exact;
}

body {
  font-family: 'Montserrat', 'Segoe UI', sans-serif;
  background: #1E1B14;
}

.card {
  width: 148mm;
  height: 210mm;
  background: linear-gradient(160deg, #232017 0%, #1A1810 50%, #211D14 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 16mm 14mm 10mm;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.frame {
  position: absolute;
  inset: 7mm;
  border: 0.3mm solid ${rgba(accent, 0.45)};
  pointer-events: none;
}

.cn {
  position: absolute;
  width: 5.5mm;
  height: 5.5mm;
  border: 0.5mm solid ${accent};
}
.cn-tl { top: 7mm; left: 7mm; border-right: none; border-bottom: none; }
.cn-tr { top: 7mm; right: 7mm; border-left: none; border-bottom: none; }
.cn-bl { bottom: 7mm; left: 7mm; border-right: none; border-top: none; }
.cn-br { bottom: 7mm; right: 7mm; border-left: none; border-top: none; }

.card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 40%;
  background: radial-gradient(ellipse 100% 60% at 50% 0%, ${rgba(accent, 0.07)} 0%, transparent 100%);
  pointer-events: none;
}

.inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
}

.brand {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: ${brandSize};
  font-weight: 300;
  color: ${lighten(accent)};
  letter-spacing: 3mm;
  line-height: 1;
  text-shadow: 0 0 15mm ${rgba(accent, 0.35)};
  margin-bottom: 2mm;
}

.tagline {
  font-family: 'Montserrat', 'Segoe UI', sans-serif;
  font-size: 2.4mm;
  font-weight: 500;
  color: ${accent};
  letter-spacing: 1mm;
  text-transform: uppercase;
  margin-bottom: 5mm;
}

.rule {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 2.5mm;
  margin-bottom: 5.5mm;
}
.rl {
  flex: 1;
  height: 0.2mm;
  background: linear-gradient(to right, transparent, ${accent} 40%, ${accent} 60%, transparent);
}
.rg {
  width: 1.5mm;
  height: 1.5mm;
  background: ${accent};
  transform: rotate(45deg);
  flex-shrink: 0;
}

.wlabel {
  font-family: 'Montserrat', 'Segoe UI', sans-serif;
  font-size: 2.3mm;
  font-weight: 600;
  color: ${accent};
  letter-spacing: 1.2mm;
  text-transform: uppercase;
  margin-bottom: 2mm;
}

.wtitle {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 10mm;
  color: ${lighten(accent)};
  letter-spacing: 0.8mm;
  line-height: 1.25;
  margin-bottom: ${networkName ? '2mm' : '5.5mm'};
}

.network-name {
  font-family: 'Montserrat', 'Segoe UI', sans-serif;
  font-size: 2.2mm;
  font-weight: 400;
  color: ${rgba(accent, 0.65)};
  letter-spacing: 0.5mm;
  margin-bottom: 3.5mm;
}

.qr-box {
  background: #F4EDD8;
  border-radius: 3.5mm;
  padding: 4mm;
  margin-bottom: 4.5mm;
  box-shadow: 0 0 0 0.3mm ${rgba(accent, 0.6)}, 0 3mm 10mm rgba(0,0,0,0.5);
}
.qr-box img {
  width: 52mm;
  height: 52mm;
  display: block;
}
.qr-placeholder {
  width: 52mm;
  height: 52mm;
  background: #e8e0cc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 6mm;
  color: #bbb;
}

.scan-row {
  display: flex;
  align-items: center;
  gap: 2.5mm;
  margin-bottom: 4.5mm;
}
.sl { width: 7mm; height: 0.2mm; background: ${rgba(accent, 0.4)}; }
.st {
  font-family: 'Montserrat', 'Segoe UI', sans-serif;
  font-size: 2mm;
  font-weight: 400;
  color: ${accent};
  letter-spacing: 0.6mm;
  text-transform: uppercase;
  white-space: nowrap;
}

.steps {
  display: flex;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 4mm;
  gap: 0;
}
.step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2mm;
}
.icon-ring {
  width: 9mm;
  height: 9mm;
  border: 0.3mm solid ${rgba(accent, 0.55)};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-ring svg { display: block; }
.step-lbl {
  font-family: 'Montserrat', 'Segoe UI', sans-serif;
  font-size: 1.9mm;
  color: ${darken(accent)};
  max-width: 20mm;
  text-align: center;
  line-height: 1.5;
  letter-spacing: 0.1mm;
}
.step-conn {
  flex: 1;
  height: 0.2mm;
  background: ${rgba(accent, 0.2)};
  margin-top: 4.5mm;
}

.bot-rule {
  width: 70%;
  height: 0.2mm;
  background: linear-gradient(to right, transparent, ${rgba(accent, 0.35)}, transparent);
}
</style>
</head>
<body>
<div class="card">
  <div class="frame"></div>
  <div class="cn cn-tl"></div><div class="cn cn-tr"></div>
  <div class="cn cn-bl"></div><div class="cn cn-br"></div>

  <div class="inner">
    ${name ? `<div class="brand">${esc(name)}</div>` : ''}
    ${tagline ? `<div class="tagline">${esc(tagline)}</div>` : ''}

    <div class="rule"><div class="rl"></div><div class="rg"></div><div class="rl"></div></div>

    <div class="wlabel">Welcome</div>
    <div class="wtitle">Free Guest<br>WiFi</div>

    ${networkName ? `<div class="network-name">${esc(networkName)}</div>` : ''}

    <div class="qr-box">
      ${qrDataUrl
        ? `<img src="${qrDataUrl}" alt="QR Code">`
        : `<div class="qr-placeholder">QR</div>`}
    </div>

    <div class="scan-row">
      <div class="sl"></div>
      <div class="st">Scan with your camera to connect</div>
      <div class="sl"></div>
    </div>

    <div class="steps">
      <div class="step">
        <div class="icon-ring">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="9" height="9" rx=".8"/><rect x="13" y="2" width="9" height="9" rx=".8"/>
            <rect x="2" y="13" width="9" height="9" rx=".8"/>
            <rect x="14" y="14" width="2.5" height="2.5"/><rect x="19.5" y="14" width="2.5" height="2.5"/>
            <rect x="14" y="19.5" width="2.5" height="2.5"/><rect x="19.5" y="19.5" width="2.5" height="2.5"/>
          </svg>
        </div>
        <div class="step-lbl">Open your camera</div>
      </div>
      <div class="step-conn"></div>
      <div class="step">
        <div class="icon-ring">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 10.07 4h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 18.07 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <circle cx="12" cy="13" r="3"/>
          </svg>
        </div>
        <div class="step-lbl">Point at the code</div>
      </div>
      <div class="step-conn"></div>
      <div class="step">
        <div class="icon-ring">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
            <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
            <circle cx="12" cy="20" r="1" fill="${accent}" stroke="none"/>
          </svg>
        </div>
        <div class="step-lbl">Connect automatically</div>
      </div>
    </div>

    <div class="bot-rule"></div>
  </div>
</div>
</body>
</html>`
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function rgba(hex, alpha) {
  if (!hex || hex.length < 7) return `rgba(200,151,42,${alpha})`
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function lighten(hex) {
  if (!hex || hex.length < 7) return '#DEB858'
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + 35)
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + 22)
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + 8)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function darken(hex) {
  if (!hex || hex.length < 7) return '#AA8428'
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 35)
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 22)
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 8)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
