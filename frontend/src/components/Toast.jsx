import { useEffect } from 'react';

/**
 * Minimal error-toast that auto-dismisses.
 *
 * Props:
 *   message  — text to show
 *   onClose  — called when toast should disappear
 *   duration — ms before auto-dismiss (default 4000)
 */
export default function Toast({ message, onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  if (!message) return null;

  return (
    <div className="toast" role="alert" aria-live="assertive">
      <span className="toast-icon">⚠</span>
      <span className="toast-msg">{message}</span>
      <button
        className="toast-close"
        onClick={onClose}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}
