import { PATCH_NOTES } from '../lib/patchNotes'
import './PatchNotesModal.css'

export default function PatchNotesModal({ onClose }) {
  return (
    <div className="pnm-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="pnm-box">
        <div className="pnm-header">
          <span>Patch Notes</span>
          <button className="pnm-close" onClick={onClose}>✕</button>
        </div>
        <div className="pnm-body">
          {PATCH_NOTES.map((entry, i) => (
            <div key={entry.version} className={`pnm-entry ${i === 0 ? 'pnm-entry--latest' : ''}`}>
              <div className="pnm-entry-header">
                <span className="pnm-version">v{entry.version}</span>
                {i === 0 && <span className="pnm-badge">Latest</span>}
                <span className="pnm-date">{entry.date}</span>
              </div>
              <ul className="pnm-changes">
                {entry.changes.map((c, j) => <li key={j}>{c}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
