import './StatusBar.css';

export default function StatusBar({ projectPath, isDirty, activeType, lastAction, qrTypeLabel }) {
  const filename = projectPath
    ? projectPath.split(/[\\/]/).pop()
    : 'Untitled';

  return (
    <div className="status-bar">
      <div className="status-left">
        <span>📁</span>
        <span className="status-path">{filename}</span>
        {isDirty && <span className="status-dot">●</span>}
      </div>
      <div className="status-center">
        {qrTypeLabel && (
          <span className="status-type-badge">{qrTypeLabel}</span>
        )}
      </div>
      <div className="status-right">
        {lastAction}
      </div>
    </div>
  );
}
