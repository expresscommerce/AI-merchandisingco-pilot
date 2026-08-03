/**
 * SummaryBar — 3 top-level KPI cards matching reference image layout.
 */

export default function SummaryBar({ totalImpact, pendingCount, highConfCount, currencySymbol = '$' }) {
  const formattedImpact = totalImpact >= 1000
    ? `${currencySymbol}${(totalImpact / 1000).toFixed(1)}k`
    : `${currencySymbol}${totalImpact.toLocaleString()}`;

  return (
    <div className="summary-cards-grid">
      {/* Dark Revenue Lift Card */}
      <div className="summary-card summary-card--revenue">
        <span className="summary-card__label">ESTIMATED POTENTIAL REVENUE LIFT:</span>
        <div className="summary-card__metric summary-card__metric--light">
          {formattedImpact} <span className="summary-card__unit">/ MONTH</span>
        </div>
      </div>

      {/* Pending Proposals Card */}
      <div className="summary-card summary-card--pending">
        <span className="summary-card__label">PENDING PROPOSALS:</span>
        <div className="summary-card__metric">
          {pendingCount}
        </div>
      </div>

      {/* High-Confidence Actions Card */}
      <div className="summary-card summary-card--confidence">
        <span className="summary-card__label">HIGH-CONFIDENCE ACTIONS:</span>
        <div className="summary-card__metric-row">
          <span className="summary-card__metric summary-card__metric--green">{highConfCount}</span>
          <span className="summary-card__check-badge" aria-label="Verified">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" fill="#16a34a" />
              <path d="M6 10l3 3 5-5" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

