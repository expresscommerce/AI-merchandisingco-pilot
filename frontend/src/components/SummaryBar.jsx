/**
 * SummaryBar — top-level stats always visible above tabs.
 *
 * Shows: total potential impact, pending count, high-confidence count.
 */

export default function SummaryBar({ totalImpact, pendingCount, highConfCount }) {
  const formatted = totalImpact >= 1000
    ? `$${(totalImpact / 1000).toFixed(1)}k`
    : `$${totalImpact.toLocaleString()}`;

  return (
    <div className="summary-bar">
      <div className="summary-stat">
        <span className="summary-stat__value summary-stat__value--accent">
          {formatted}/mo
        </span>
        <span className="summary-stat__label">potential impact</span>
      </div>

      <div className="summary-divider" aria-hidden="true" />

      <div className="summary-stat">
        <span className="summary-stat__value">{pendingCount}</span>
        <span className="summary-stat__label">pending proposals</span>
      </div>

      <div className="summary-divider" aria-hidden="true" />

      <div className="summary-stat">
        <span className="summary-stat__value">{highConfCount}</span>
        <span className="summary-stat__label">high-confidence</span>
      </div>
    </div>
  );
}
