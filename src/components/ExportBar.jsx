import './ExportBar.css'

export default function ExportBar({ onExport, activeType }) {
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
      {activeType === 'wifi' && (
        <button className="export-btn export-btn-card" onClick={() => onExport('print-card')}>
          Print Card
        </button>
      )}
    </div>
  )
}
