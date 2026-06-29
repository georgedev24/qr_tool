import { version } from '../../package.json';
import './AboutModal.css';

export default function AboutModal({ onClose, onPatchNotes, onCheckUpdates }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box about-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">About QR Tool</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="about-body">
          <div className="about-icon">⬛</div>
          <h2 className="about-name">QR Tool</h2>
          <p className="about-version">Version {version}</p>
          <p className="about-tagline">Professional QR code generator for desktop</p>
          <div className="about-sep" />
          <p className="about-copyright">© 2026 georgedev24</p>
          <div className="about-actions">
            <button className="about-btn" onClick={onPatchNotes}>Patch Notes</button>
            <button className="about-btn about-btn--primary" onClick={onCheckUpdates}>Check for Updates</button>
          </div>
        </div>
      </div>
    </div>
  );
}
