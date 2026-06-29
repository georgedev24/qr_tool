import './ToastContainer.css';

const ICONS = {
  success: '✓',
  error: '✕',
  info: 'i',
};

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast toast--${t.type}${t.removing ? ' toast--removing' : ''}`}
        >
          <span className="toast-icon">{ICONS[t.type]}</span>
          <span className="toast-msg">{t.message}</span>
          <button className="toast-close" onClick={() => onRemove(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}
