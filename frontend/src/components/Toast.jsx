import { useEffect } from 'react';

export default function Toast({ message, onClose, duration = 4000 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  if (!message) return null;

  return (
    <div className="toast" role="alert" aria-live="assertive">
      <span className="toast-icon">⚠</span>
      <span className="toast-msg">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss">×</button>
    </div>
  );
}
