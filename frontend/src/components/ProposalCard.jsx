import { useState, useCallback } from 'react';

/* ── Constants ────────────────────────────────────────────────────────── */

const BADGE = {
  price_change:      { label: 'Reprice',      cls: 'badge--reprice' },
  copy_rewrite:      { label: 'Rewrite copy', cls: 'badge--rewrite' },
  bundle_suggestion: { label: 'Bundle offer', cls: 'badge--bundle'  },
};

const CONF_DOT = {
  high:   'var(--clr-conf-high)',
  medium: 'var(--clr-conf-med)',
  low:    'var(--clr-conf-low)',
};

const REASON_LIMIT = 130;

/* ── Mini components ──────────────────────────────────────────────────── */

function Spinner() {
  return (
    <svg className="btn-spinner" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="22" strokeDashoffset="8" />
    </svg>
  );
}

/** Tiny sparkline — 30-point SVG line chart, no axes. */
function Sparkline({ data }) {
  if (!data || data.length < 2) return null;

  const w = 120, h = 32, pad = 2;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - 2 * pad);
      const y = pad + (1 - (v - min) / range) * (h - 2 * pad);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="sparkline-wrap" aria-label="30-day unit sales trend">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="sparkline-svg">
        <polyline
          points={points}
          fill="none"
          stroke="var(--clr-muted)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Trend area fill */}
        <polyline
          points={`${pad},${h - pad} ${points} ${w - pad},${h - pad}`}
          fill="var(--clr-sparkline-fill)"
          stroke="none"
        />
      </svg>
      <span className="sparkline-label">30d sales</span>
    </div>
  );
}

/** Co-purchase overlap — overlapping circles visual. */
function CoPurchaseVisual({ pct, productCount }) {
  const count = Math.min(productCount || 3, 3);
  const colors = ['var(--clr-badge-bundle-fg)', 'var(--clr-accent)', 'var(--clr-conf-med)'];

  return (
    <div className="copurchase-wrap">
      <div className="copurchase-circles" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className="copurchase-circle"
            style={{
              backgroundColor: colors[i],
              left: `${i * 16}px`,
              opacity: 0.25 + (i === 0 ? 0.2 : 0),
            }}
          />
        ))}
      </div>
      <span className="copurchase-pct">{pct}% co-purchase overlap</span>
    </div>
  );
}

/** Data trail — collapsible "How we found this". */
function DataTrail({ steps }) {
  const [open, setOpen] = useState(false);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="data-trail">
      <button
        className="data-trail__toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <svg
          className={`data-trail__chevron ${open ? 'data-trail__chevron--open' : ''}`}
          width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"
        >
          <path d="M4 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        How we found this
      </button>
      {open && (
        <ol className="data-trail__steps">
          {steps.map((step, i) => (
            <li key={i} className="data-trail__step">
              <span className="data-trail__check" aria-hidden="true">✓</span>
              {step}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/* ── Main Card ────────────────────────────────────────────────────────── */

export default function ProposalCard({ proposal, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false);
  const [acting, setActing] = useState(null);

  const {
    id, type, product_name, reasoning, confidence,
    estimated_impact, status, data_trail,
    current_price, proposed_price, sparkline_data,
    current_copy, proposed_copy,
    products, discount_percent, co_purchase_pct,
  } = proposal;

  const badge = BADGE[type] || { label: type, cls: '' };
  const truncate = reasoning.length > REASON_LIMIT;
  const displayText = (!truncate || expanded)
    ? reasoning
    : reasoning.slice(0, REASON_LIMIT) + '…';

  const handleApprove = useCallback(async () => {
    setActing('approve');
    try { await onApprove(id); } finally { setActing(null); }
  }, [id, onApprove]);

  const handleReject = useCallback(async () => {
    setActing('reject');
    try { await onReject(id); } finally { setActing(null); }
  }, [id, onReject]);

  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';
  const isPending = status === 'pending';

  const cls = [
    'card',
    isApproved && 'card--approved',
    isRejected && 'card--rejected',
  ].filter(Boolean).join(' ');

  return (
    <article className={cls} tabIndex={0} aria-label={`${badge.label} for ${product_name}`}>
      {/* Header */}
      <div className="card__header">
        <h3 className="card__product">{product_name}</h3>
        <span className={`card__badge ${badge.cls}`}>{badge.label}</span>
      </div>

      {/* Impact — hero number */}
      <p className="card__impact">{estimated_impact}</p>

      {/* Confidence */}
      <p className="card__confidence">
        <span className="conf-dot" style={{ backgroundColor: CONF_DOT[confidence] }} aria-hidden="true" />
        {confidence.charAt(0).toUpperCase() + confidence.slice(1)}
      </p>

      {/* ── Type-specific sections ──────────────────────────────── */}
      {type === 'price_change' && (
        <>
          <div className="card__price-row">
            <span className="price-old">${current_price?.toFixed(2)}</span>
            <span className="price-arrow" aria-hidden="true">→</span>
            <span className="price-new">${proposed_price?.toFixed(2)}</span>
          </div>
          <Sparkline data={sparkline_data} />
        </>
      )}

      {type === 'copy_rewrite' && (
        <div className="card__copy-diff">
          <div className="copy-block copy-block--old">
            <span className="copy-label">Current</span>
            <p>{current_copy}</p>
          </div>
          <div className="copy-block copy-block--new">
            <span className="copy-label">Proposed</span>
            <p>{proposed_copy}</p>
          </div>
        </div>
      )}

      {type === 'bundle_suggestion' && (
        <div className="card__bundle">
          <ul className="bundle-list">
            {products?.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
          <div className="bundle-meta">
            <span className="bundle-discount">–{discount_percent}% bundle</span>
            <CoPurchaseVisual pct={co_purchase_pct} productCount={products?.length} />
          </div>
        </div>
      )}

      {/* Reasoning */}
      <p className="card__reasoning">
        {displayText}
        {truncate && (
          <button className="toggle-more" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
            {expanded ? 'show less' : 'show more'}
          </button>
        )}
      </p>

      {/* Data trail */}
      <DataTrail steps={data_trail} />

      {/* Actions */}
      {isApproved ? (
        <div className="card__resolved">
          <span className="resolved-badge">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Approved
          </span>
        </div>
      ) : isPending ? (
        <div className="card__actions">
          <button className="btn btn--primary" onClick={handleApprove} disabled={acting !== null} aria-label={`Approve ${product_name}`}>
            {acting === 'approve' ? <><Spinner /> Approving…</> : 'Approve'}
          </button>
          <button className="btn btn--ghost" onClick={handleReject} disabled={acting !== null} aria-label={`Reject ${product_name}`}>
            {acting === 'reject' ? <><Spinner /> Rejecting…</> : 'Reject'}
          </button>
        </div>
      ) : null}
    </article>
  );
}
