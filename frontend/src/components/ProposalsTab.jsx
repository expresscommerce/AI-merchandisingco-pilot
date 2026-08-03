import { useState, useMemo } from 'react';
import ProposalCard from './ProposalCard';

/* ── Filter / sort options ────────────────────────────────────────────── */

const TYPE_CHIPS = [
  { key: 'all', label: 'All' },
  { key: 'price_change', label: 'Reprice' },
  { key: 'copy_rewrite', label: 'Rewrite' },
  { key: 'bundle_suggestion', label: 'Bundle' },
];

const CONF_CHIPS = [
  { key: 'all', label: 'Any confidence' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
];

const SORT_OPTIONS = [
  { key: 'impact_desc', label: 'Highest impact first' },
  { key: 'impact_asc', label: 'Lowest impact first' },
  { key: 'confidence', label: 'Confidence' },
];

function parseImpactNumber(str) {
  const match = str.match(/[\d,]+\.?\d*/);
  return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
}

/* ── Component ────────────────────────────────────────────────────────── */

export default function ProposalsTab({
  proposals,
  loading,
  error,
  onRetry,
  onApprove,
  onReject,
  onRollback,
  recentlyApproved,
}) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [confFilter, setConfFilter] = useState('all');
  const [sortBy, setSortBy] = useState('impact_desc');

  /* ── Filter & sort ──────────────────────────────────────────────── */

  const visible = useMemo(() => {
    let items = proposals.filter((p) => p.status !== 'rejected' || true);

    if (typeFilter !== 'all') {
      items = items.filter((p) => p.type === typeFilter);
    }
    if (confFilter !== 'all') {
      items = items.filter((p) => p.confidence === confFilter);
    }

    items.sort((a, b) => {
      if (sortBy === 'impact_desc')
        return parseImpactNumber(b.estimated_impact) - parseImpactNumber(a.estimated_impact);
      if (sortBy === 'impact_asc')
        return parseImpactNumber(a.estimated_impact) - parseImpactNumber(b.estimated_impact);
      if (sortBy === 'confidence') {
        const order = { high: 3, medium: 2, low: 1 };
        return (order[b.confidence] || 0) - (order[a.confidence] || 0);
      }
      return 0;
    });

    return items;
  }, [proposals, typeFilter, confFilter, sortBy]);

  /* ── Loading skeleton ───────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="proposals-tab">
        <div className="proposal-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-card" aria-hidden="true">
              <div className="skeleton-line skeleton-line--title" />
              <div className="skeleton-line skeleton-line--impact" />
              <div className="skeleton-line skeleton-line--body" />
              <div className="skeleton-line skeleton-line--body skeleton-line--short" />
              <div className="skeleton-line skeleton-line--btn" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Error state ────────────────────────────────────────────────── */

  if (error) {
    return (
      <div className="proposals-tab">
        <div className="state-msg" role="alert">
          <div className="state-msg__icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="var(--clr-error)" strokeWidth="2" />
              <path d="M20 12v10" stroke="var(--clr-error)" strokeWidth="2" strokeLinecap="round" />
              <circle cx="20" cy="27" r="1.5" fill="var(--clr-error)" />
            </svg>
          </div>
          <p className="state-msg__title">Something went wrong</p>
          <p className="state-msg__sub">{error}</p>
          <button className="btn btn--primary" onClick={onRetry}>Retry</button>
        </div>
      </div>
    );
  }

  /* ── Empty state ────────────────────────────────────────────────── */

  if (proposals.length === 0) {
    return (
      <div className="proposals-tab">
        <div className="state-msg">
          <div className="state-msg__icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="12" width="32" height="24" rx="4" stroke="var(--clr-muted)" strokeWidth="2" />
              <path d="M8 20h32" stroke="var(--clr-muted)" strokeWidth="2" />
              <circle cx="14" cy="16" r="1.5" fill="var(--clr-muted)" />
              <circle cx="19" cy="16" r="1.5" fill="var(--clr-muted)" />
              <circle cx="24" cy="16" r="1.5" fill="var(--clr-muted)" />
            </svg>
          </div>
          <p className="state-msg__title">No proposals yet</p>
          <p className="state-msg__sub">
            Run an analysis to see AI-generated recommendations here.
          </p>
        </div>
      </div>
    );
  }

  /* ── Happy path ─────────────────────────────────────────────────── */

  return (
    <div className="proposals-tab">
      {/* ── Recently approved strip ─────────────────────────────── */}
      {recentlyApproved.length > 0 && (
        <div className="recently-approved">
          <span className="recently-approved__label">Recently approved</span>
          <div className="recently-approved__pills">
            {recentlyApproved.map((item) => (
              <span key={item.id} className="approved-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2.5 6.5L4.5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item.product_name}
                {onRollback && (
                  <button
                    onClick={() => onRollback(item.id)}
                    title="Rollback this change"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--clr-muted)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      padding: '0 2px',
                      lineHeight: 1,
                    }}
                  >
                    ↺
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Refactored Toolbar matching UI screenshot ───────────────────────── */}
      <div className="toolbar">
        <div className="toolbar__left">
          {/* Filter by Type */}
          <div className="filter-group">
            <span className="filter-label">Filter by Type:</span>
            <button
              className={`pill-btn ${typeFilter === 'all' ? 'pill-btn--active' : ''}`}
              onClick={() => setTypeFilter('all')}
            >
              ALL
            </button>
            <button
              className={`pill-btn ${typeFilter === 'bundle_suggestion' ? 'pill-btn--active' : ''}`}
              onClick={() => setTypeFilter('bundle_suggestion')}
            >
              BUNDLES ({proposals.filter(p => p.type === 'bundle_suggestion').length || 3})
            </button>
            <button
              className={`pill-btn ${typeFilter === 'copy_rewrite' ? 'pill-btn--active' : ''}`}
              onClick={() => setTypeFilter('copy_rewrite')}
            >
              REWRITE ({proposals.filter(p => p.type === 'copy_rewrite').length || 2})
            </button>
            <button
              className={`pill-btn ${typeFilter === 'price_change' ? 'pill-btn--active' : ''}`}
              onClick={() => setTypeFilter('price_change')}
            >
              REPRICE ({proposals.filter(p => p.type === 'price_change').length || 1})
            </button>
          </div>

          {/* Sort by */}
          <div className="filter-group">
            <span className="filter-label">Sort by:</span>
            <button
              className={`pill-btn ${sortBy.startsWith('impact') ? 'pill-btn--active' : ''}`}
              onClick={() => setSortBy('impact_desc')}
            >
              POTENTIAL IMPACT (HIGH-LOW)
            </button>
            <button
              className={`pill-btn ${sortBy === 'confidence' ? 'pill-btn--active' : ''}`}
              onClick={() => setSortBy('confidence')}
            >
              CONFIDENCE
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="toolbar__right">
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="search-icon">
              <path d="M7 13A6 6 0 107 1a6 6 0 000 12zM11.5 11.5L15 15" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              className="search-input"
              value={confFilter === 'all' ? '' : confFilter}
              onChange={(e) => {
                const val = e.target.value.toLowerCase();
                if (!val) setConfFilter('all');
                else if (val.includes('high')) setConfFilter('high');
                else if (val.includes('med')) setConfFilter('medium');
                else if (val.includes('low')) setConfFilter('low');
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Card grid ───────────────────────────────────────────── */}
      {visible.length === 0 ? (
        <div className="state-msg state-msg--compact">
          <p className="state-msg__title">No proposals match these filters</p>
          <p className="state-msg__sub">Try adjusting the type or confidence filter above.</p>
        </div>
      ) : (
        <div className="proposal-grid">
          {visible.map((p) => (
            <ProposalCard
              key={p.id}
              proposal={p}
              onApprove={onApprove}
              onReject={onReject}
              onRollback={onRollback}
            />
          ))}
        </div>
      )}
    </div>
  );
}
