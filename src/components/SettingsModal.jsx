import './SettingsModal.css';

export default function SettingsModal({ settings, onSettingsChange, onClose }) {
  const set = (key, value) => onSettingsChange({ ...settings, [key]: value });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box settings-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Settings</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="sm-body">
          <div className="sm-section">
            <div className="sm-section-title">Appearance</div>
            <div className="sm-row">
              <span className="sm-label">Theme</span>
              <div className="sm-toggle-group">
                <button
                  className={`sm-toggle-btn${settings.theme === 'light' ? ' active' : ''}`}
                  onClick={() => set('theme', 'light')}
                >
                  Light
                </button>
                <button
                  className={`sm-toggle-btn${settings.theme === 'dark' ? ' active' : ''}`}
                  onClick={() => set('theme', 'dark')}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>

          <div className="sm-section">
            <div className="sm-section-title">On Launch</div>
            <div className="sm-row">
              <span className="sm-label">Re-open last project</span>
              <div className="sm-toggle-group">
                <button
                  className={`sm-toggle-btn${settings.openLastProject ? ' active' : ''}`}
                  onClick={() => set('openLastProject', true)}
                >
                  On
                </button>
                <button
                  className={`sm-toggle-btn${!settings.openLastProject ? ' active' : ''}`}
                  onClick={() => set('openLastProject', false)}
                >
                  Off
                </button>
              </div>
            </div>
          </div>

          <div className="sm-section">
            <div className="sm-section-title">Export</div>
            <div className="sm-row">
              <span className="sm-label">Default format</span>
              <div className="sm-toggle-group">
                {['png', 'svg', 'copy'].map(fmt => (
                  <button
                    key={fmt}
                    className={`sm-toggle-btn${settings.defaultExport === fmt ? ' active' : ''}`}
                    onClick={() => set('defaultExport', fmt)}
                  >
                    {fmt === 'copy' ? 'Copy' : fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
