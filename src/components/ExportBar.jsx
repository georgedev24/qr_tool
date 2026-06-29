import './ExportBar.css'

export default function ExportBar({ onExport }) {
  return (
    <div className="export-bar">
      <button className="export-btn" onClick={() => onExport('copy')}>
        Copy PNG
      </button>
      <button className="export-btn" onClick={() => onExport('png')}>
        Save PNG
      </button>
      <button className="export-btn" onClick={() => onExport('svg')}>
        Save SVG
      </button>
    </div>
  )
}
