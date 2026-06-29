import { useState, useEffect, useRef } from 'react'
import './NavBar.css'

function NavMenu({ label, items, isOpen, onToggle, onClose }) {
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, onClose])

  return (
    <div className="nm-wrap" ref={wrapRef}>
      <button className={`nm-trigger ${isOpen ? 'active' : ''}`} onClick={onToggle}>
        {label}
      </button>
      {isOpen && (
        <div className="nm-dropdown">
          {items.map((item, i) =>
            item.separator ? (
              <div key={i} className="nm-sep" />
            ) : (
              <button
                key={i}
                className="nm-item"
                disabled={item.disabled}
                onClick={() => { if (!item.disabled) { onClose(); item.action?.() } }}
              >
                <span className="nm-item-label">{item.label}</span>
                {item.shortcut && <span className="nm-shortcut">{item.shortcut}</span>}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

export default function NavBar({
  projectName, isDirty,
  canUndo, canRedo,
  activeType,
  onNew, onOpen, onSave, onSaveAs,
  onUndo, onRedo,
  onGenerate,
  onExport,
  onPatchNotes,
  onCheckUpdates,
  onExit,
}) {
  const [openMenu, setOpenMenu] = useState(null)
  const toggle = (name) => setOpenMenu(prev => prev === name ? null : name)
  const close = () => setOpenMenu(null)

  const FILE_ITEMS = [
    { label: 'New Project',       shortcut: 'Ctrl+N',       action: onNew },
    { separator: true },
    { label: 'Open Project…',     shortcut: 'Ctrl+O',       action: onOpen },
    { label: 'Save Project',      shortcut: 'Ctrl+S',       action: onSave },
    { label: 'Save Project As…',  shortcut: 'Ctrl+Shift+S', action: onSaveAs },
    { separator: true },
    { label: 'Patch Notes',                                  action: onPatchNotes },
    { label: 'Check for Updates…',                           action: onCheckUpdates },
    { separator: true },
    { label: 'Exit',                                         action: onExit },
  ]

  const EDIT_ITEMS = [
    { label: 'Undo',        shortcut: 'Ctrl+Z', action: onUndo, disabled: !canUndo },
    { label: 'Redo',        shortcut: 'Ctrl+Y', action: onRedo, disabled: !canRedo },
    { separator: true },
    { label: 'Generate QR', shortcut: 'Enter',  action: onGenerate },
  ]

  const MENUS = [
    { name: 'file', label: 'File', items: FILE_ITEMS },
    { name: 'edit', label: 'Edit', items: EDIT_ITEMS },
  ]

  return (
    <nav className="app-navbar">
      <div className="navbar-left">
        {MENUS.map(m => (
          <NavMenu
            key={m.name}
            label={m.label}
            items={m.items}
            isOpen={openMenu === m.name}
            onToggle={() => toggle(m.name)}
            onClose={close}
          />
        ))}
      </div>

      <div className="navbar-center">
        <span className="navbar-project-name">
          {projectName || 'Untitled'}{isDirty ? ' ●' : ''}
        </span>
      </div>

      <div className="navbar-right">
        <button className="navbar-action-btn" onClick={() => onExport('copy')}>Copy PNG</button>
        <button className="navbar-action-btn" onClick={() => onExport('png')}>Save PNG</button>
        <button className="navbar-action-btn" onClick={() => onExport('svg')}>Save SVG</button>
        {activeType === 'wifi' && (
          <button className="navbar-action-btn navbar-action-btn--gold" onClick={() => onExport('print-card')}>
            Print Card
          </button>
        )}
      </div>
    </nav>
  )
}
