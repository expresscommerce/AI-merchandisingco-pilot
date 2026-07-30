/**
 * ResultsTab — approved proposals with tracked outcomes.
 */

const TYPE_LABEL = {
  price_change: 'Price change',
  copy_rewrite: 'Copy rewrite',
  bundle_suggestion: 'Bundle',
};

const TYPE_CLS = {
  price_change: 'result-type--reprice',
  copy_rewrite: 'result-type--rewrite',
  bundle_suggestion: 'result-type--bundle',
};

export default function ResultsTab({ results, loading, error, onRetry }) {
  /* ── Loading ────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="results-tab">
        <div className="results-table-wrap">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-row" aria-hidden="true">
              <div className="skeleton-line skeleton-line--title" />
              <div className="skeleton-line skeleton-line--body" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Error ──────────────────────────────────────────────────────── */
  if (error) {
    return (
      <div className="results-tab">
        <div className="state-msg" role="alert">
          <div className="state-msg__icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="var(--clr-error)" strokeWidth="2" />
              <path d="M20 12v10" stroke="var(--clr-error)" strokeWidth="2" strokeLinecap="round" />
              <circle cx="20" cy="27" r="1.5" fill="var(--clr-error)" />
            </svg>
          </div>
          <p className="state-msg__title">Couldn't load results</p>
          <p className="state-msg__sub">{error}</p>
          <button className="btn btn--primary" onClick={onRetry}>Retry</button>
        </div>
      </div>
    );
  }

  /* ── Empty ──────────────────────────────────────────────────────── */
  if (results.length === 0) {
    return (
      <div className="results-tab">
        <div className="state-msg">
          <div className="state-msg__icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M16 24h16M24 16v16" stroke="var(--clr-muted)" strokeWidth="2" strokeLinecap="round" />
              <circle cx="24" cy="24" r="18" stroke="var(--clr-muted)" strokeWidth="2" />
            </svg>
          </div>
          <p className="state-msg__title">No results yet</p>
          <p className="state-msg__sub">
            Approve some proposals first — results will appear here once we start tracking outcomes.
          </p>
        </div>
      </div>
    );
  }

  /* ── Results list ───────────────────────────────────────────────── */
  const sorted = [...results].sort((a, b) => {
    if (a.days_since_approval === 0 && b.days_since_approval !== 0) return -1;
    if (b.days_since_approval === 0 && a.days_since_approval !== 0) return 1;
    return a.days_since_approval - b.days_since_approval;
  });

  return (
    <div className="results-tab">
      <div className="results-table-wrap">
        <table className="results-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Change</th>
              <th>Outcome</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id} className="result-row">
                <td>
                  <div className="result-product">
                    <span className="result-product__name">{r.product_name}</span>
                    <span className={`result-type ${TYPE_CLS[r.type] || ''}`}>
                      {TYPE_LABEL[r.type] || r.type}
                    </span>
                  </div>
                </td>
                <td className="result-change">{r.change_summary}</td>
                <td>
                  {r.tracking_status === 'measured' ? (
                    <span className="result-outcome result-outcome--measured">
                      {r.outcome}
                    </span>
                  ) : (
                    <span className="result-outcome result-outcome--tracking">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="tracking-icon" aria-hidden="true">
                        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
                      </svg>
                      Tracking — check back in a few days
                    </span>
                  )}
                </td>
                <td className="result-when">
                  {r.days_since_approval === 0
                    ? 'Today'
                    : r.days_since_approval === 1
                      ? 'Yesterday'
                      : `${r.days_since_approval}d ago`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
