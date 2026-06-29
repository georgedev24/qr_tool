export const PATCH_NOTES = [
  {
    version: '1.3.0',
    date: '2026-06-29',
    changes: [
      'Custom in-app navbar  -  File and Edit menus replacing the native system menu bar',
      'Manual Generate QR button  -  QR never regenerates automatically on form/style edits',
      'Undo / Redo support (Ctrl+Z / Ctrl+Y) for form data and style changes',
      'Print Card settings (template, name, tagline, colors, language) saved in project files',
      '.qrproj file association  -  double-click a project file to open it directly in QR Tool',
      'Patch Notes viewer',
    ],
  },
  {
    version: '1.2.0',
    date: '2026-06-29',
    changes: [
      'Save / Open Project  -  persist all QR config to .qrproj files',
      'File > New / Open / Save / Save As with keyboard shortcuts (Ctrl+N/O/S/Shift+S)',
      'Window title shows filename with unsaved-changes indicator (●)',
      'Native dialog when closing or switching projects with unsaved changes',
    ],
  },
  {
    version: '1.1.2',
    date: '2026-06-28',
    changes: [
      'Check for Updates added to File menu',
      'Fixed auto-updater not detecting published releases (releaseType: release)',
      'Fixed GitHub repo name in publish config',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-06-27',
    changes: [
      'WiFi Print Card  -  export styled A5 PDF cards for your WiFi network',
      '4 card templates: Elegant, Clean, Bold, Minimal',
      'Background colour control per template',
      'Language toggle (EN / ΕΛ) on WiFi cards',
      'Auto-updater via GitHub Releases using electron-updater',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-06-26',
    changes: [
      'Initial release',
      'QR code generation: WiFi, URL, Contact, Email, SMS, Phone, Location, Calendar, Text, Crypto',
      'Full visual customisation  -  dot styles, colours, gradients, corner shapes, logo embed',
      'Export as PNG, SVG, or copy to clipboard',
    ],
  },
]
