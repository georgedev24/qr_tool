# QR Tool

A desktop QR code generator built with Electron and React. Supports 10 QR types with full visual customization and native file export.

---

## Features

### QR Types
| Type | Encodes |
|------|---------|
| WiFi | SSID, password, security type, hidden flag |
| URL | Any web or app URL |
| Contact | vCard 3.0 - name, phone, email, org, website |
| Email | Recipient, subject, body (mailto: URI) |
| SMS | Phone number + message (smsto: URI) |
| Phone | Phone number (tel: URI) |
| Location | GPS coordinates + optional label (geo: URI) |
| Calendar Event | Title, start/end datetime, location, description (iCal) |
| Plain Text | Freeform text |
| Crypto | Bitcoin, Ethereum, Litecoin, Monero - address + optional amount |

### Visual Customization
- **Colors** - dots, background, eye frame, eye inner dot (full RGB pickers)
- **Dot style** - square, dots, rounded, extra-rounded, classy, classy-rounded
- **Eye style** - 3 frame shapes × 2 inner dot shapes
- **Center logo** - upload any image, resize (10–40%), adjust padding (0–20 px)
- **Error correction** - L (7%), M (15%), Q (25%), H (30%) - auto-sets to H when a logo is used
- **Output resolution** - 256, 512, 1024, 2048, or 4096 px

### Export
- **Copy PNG** - renders at full output resolution and copies to clipboard
- **Save PNG** - native save dialog, opens the folder on completion
- **Save SVG** - vector export, same native dialog flow

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI framework | React 19 |
| Build tool | Vite 6 |
| Desktop shell | Electron 33 |
| QR rendering | qr-code-styling 1.9.2 |
| Packaging | electron-builder 25 (NSIS for Windows) |
| Dev tooling | concurrently, wait-on, vite-plugin-electron |

---

## Project Structure

```
qr_tool/
├── electron/
│   ├── main.js          # Electron main process - window creation, IPC handlers
│   └── preload.js       # Context-isolated bridge - exposes window.electronAPI
├── public/
│   └── icon.ico         # App window icon
├── src/
│   ├── main.jsx         # React entry point
│   ├── App.jsx          # Root component - state, QR lifecycle, export logic
│   ├── lib/
│   │   └── qrData.js    # Pure function: buildQrData(type, data) → encodable string
│   ├── components/
│   │   ├── TypePanel.jsx      # Left sidebar - type selector + dynamic form
│   │   ├── StylePanel.jsx     # Right sidebar - all visual controls
│   │   ├── ExportBar.jsx      # Bottom bar - Copy PNG / Save PNG / Save SVG
│   │   ├── Titlebar.jsx       # Custom title bar (kept but not currently mounted)
│   │   └── forms/
│   │       ├── Field.jsx      # Shared field primitives (Input, Select, Textarea, Checkbox)
│   │       ├── WifiForm.jsx
│   │       ├── UrlForm.jsx
│   │       ├── ContactForm.jsx
│   │       ├── EmailForm.jsx
│   │       ├── SmsForm.jsx
│   │       ├── PhoneForm.jsx
│   │       ├── LocationForm.jsx
│   │       ├── EventForm.jsx
│   │       ├── TextForm.jsx
│   │       └── CryptoForm.jsx
│   └── styles/
│       ├── global.css   # CSS variables, reset, fonts, scrollbars
│       └── app.css      # Three-column grid layout, preview area
├── index.html
├── vite.config.js
└── package.json
```

---

## UI Layout

```
┌─────────────────────────────────────────────────────┐
├─────────────┬───────────────────────┬───────────────┤
│  TypePanel  │     Preview Area      │  StylePanel   │
│   210 px    │       (flex)          │    240 px     │
│             │                       │               │
│  QR type    │  Dotted grid bg       │  Colors       │
│  selector   │  White QR preview     │  Dot style    │
│  (10 types) │  Type + size badges   │  Eye style    │
│             │                       │  Logo upload  │
│  Content    │                       │  Error corr.  │
│  form       │                       │  Output size  │
├─────────────┴───────────────────────┴───────────────┤
│         ExportBar - Copy PNG · Save PNG · Save SVG  │
└─────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run in development

```bash
npm run electron:dev
```

Starts the Vite dev server on `http://localhost:5173`, waits for it, then launches Electron pointing at it. Hot-reload works for the React side.

### Build for production

```bash
npm run electron:build
```

Vite builds the frontend to `dist/`, then electron-builder packages everything into `release/` as a Windows NSIS installer.

### Preview frontend only (no Electron)

```bash
npm run preview
```

---

## Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Vite dev server only (browser) |
| `npm run electron:dev` | Full dev - Vite + Electron |
| `npm run build` | Vite build + electron-builder package |
| `npm run electron:build` | Same as above |
| `npm run preview` | Serve `dist/` in browser |

---

## How It Works

1. **Form → Data**: Each QR type has its own form component. On every change, `buildQrData(type, data)` in `src/lib/qrData.js` converts the structured form values into the correct encoded string (WiFi protocol, vCard, iCal, mailto, geo URI, etc.).

2. **Rendering**: The encoded string is passed to a `QRCodeStyling` instance along with the current style settings (colors, dot/eye shapes, logo, error correction level, output size). The instance renders a canvas into the preview area in real time.

3. **Export**: PNG export calls `.getRawData('png')` on the QR instance at the configured output resolution, then either copies the blob to the clipboard or writes it to disk via the Electron `save-file` IPC handler. SVG uses `.getRawData('svg')` the same way.

4. **IPC Bridge**: The preload script exposes `window.electronAPI.saveFile()` to the renderer. The main process handles the `save-file` event - opens a native save dialog, writes the file, and calls `shell.showItemInFolder` to reveal it.

---

## Electron Window

- **Default size**: 1100 × 720
- **Minimum size**: 900 × 600
- **Context isolation**: enabled, Node integration disabled
- **Icon**: `public/icon.ico`
- **App ID**: `com.georgedev24.qr-tool`
- Dev mode loads `http://localhost:5173`; production loads the bundled `dist/index.html`
