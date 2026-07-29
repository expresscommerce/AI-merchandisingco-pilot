import { useState, useCallback } from 'react';

/* ── Constants ────────────────────────────────────────────────────────── */

const BADGE_MAP = {
  price_change:      { label: 'Reprice',       cls: 'badge--reprice' },
  copy_rewrite:      { label: 'Rewrite copy',  cls: 'badge--rewrite' },
  bundle_suggestion: { label: 'Bundle offer',  cls: 'badge--bundle'  },
};

const CONFIDENCE_COLOR = {
  high:   'var(--clr-confidence-high)',
  medium: 'var(--clr-confidence-med)',
  low:    'var(--clr-confidence-low)',
};

const REASONING_TRUNCATE = 140; // chars before "show more"

/* ── Helpers ──────────────────────────────────────────────────────────── */

function formatPrice(n) {
  return `$${Number(n).toFixed(2)}`;
}

/* ── Inline spinner (16 × 16) ─────────────────────────────────────────── */

function Spinner() {
  return (
    <svg
      className="btn-spinner"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="8" cy="8" r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="28"
        strokeDashoffset="10"
      />
    </svg>
  );
}

/* ── Component ────────────────────────────────────────────────────────── */

/**
 * ProposalCard
 *
 * Props:
 *   proposal    — the proposal object from the API
 *   onApprove   — (id) => Promise — called when user clicks Approve
 *   onReject    — (id) => Promise — called when user clicks Reject
 */
export default function ProposalCard({ proposal, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false);
  const [acting, setActing]     = useState(null);   // 'approving' | 'rejecting' | null
  const [removed, setRemoved]   = useState(false);  // triggers collapse-out

  const {
    id,
    type,
    product_name,
    reasoning,
    confidence,
    estimated_impact,
    status,
    // price_change fields
    current_price,
    proposed_price,
    // copy_rewrite fields
    current_copy,
    proposed_copy,
    // bundle_suggestion fields
    products,
    discount_percent,
  } = proposal;

  const badge = BADGE_MAP[type] || { label: type, cls: '' };
  const needsTruncation = reasoning.length > REASONING_TRUNCATE;
  const displayReasoning = (!needsTruncation || expanded)
    ? reasoning
    : reasoning.slice(0, REASONING_TRUNCATE) + '…';

  /* ── Handlers ─────────────────────────────────────────────────────── */

  const handleApprove = useCallback(async () => {
    setActing('approving');
    try {
      await onApprove(id);
    } finally {
      setActing(null);
    }
  }, [id, onApprove]);

  const handleReject = useCallback(async () => {
    setActing('rejecting');
    try {
      await onReject(id);
      // Trigger collapse-out animation, actual removal handled by parent
      setRemoved(true);
    } finally {
      setActing(null);
    }
  }, [id, onReject]);

  /* ── Derived state classes ────────────────────────────────────────── */

  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';
  const isPending  = status === 'pending';

  const cardClasses = [
    'proposal-card',
    isApproved && 'proposal-card--approved',
    (isRejected || removed) && 'proposal-card--rejected',
  ].filter(Boolean).join(' ');

  /* ── Render ───────────────────────────────────────────────────────── */

  return (
    <article
      className={cardClasses}
      tabIndex={0}
      aria-label={`${badge.label} proposal for ${product_name}`}
      onTransitionEnd={(e) => {
        // After collapse-out transition completes, nothing more to do — 
        // parent will stop rendering this card.
        if (e.propertyName === 'opacity' && removed) return;
      }}
    >
      {/* ── Header row ──────────────────────────────────────────────── */}
      <div className="proposal-card__header">
        <h3 className="proposal-card__product">{product_name}</h3>
        <span className={`proposal-card__badge ${badge.cls}`}>{badge.label}</span>
      </div>

      {/* ── Impact — the hero number ────────────────────────────────── */}
      <p className="proposal-card__impact">{estimated_impact}</p>

      {/* ── Confidence dot ──────────────────────────────────────────── */}
      <p className="proposal-card__confidence">
        <span
          className="confidence-dot"
          style={{ backgroundColor: CONFIDENCE_COLOR[confidence] }}
          aria-hidden="true"
        />
        {confidence.charAt(0).toUpperCase() + confidence.slice(1)}
      </p>

      {/* ── Type-specific detail ────────────────────────────────────── */}
      {type === 'price_change' && (
        <div className="proposal-card__price-row">
          <span className="price--old">{formatPrice(current_price)}</span>
          <span className="price-arrow" aria-hidden="true">→</span>
          <span className="price--new">{formatPrice(proposed_price)}</span>
        </div>
      )}

      {type === 'copy_rewrite' && (
        <div className="proposal-card__copy-diff">
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
        <div className="proposal-card__bundle">
          <ul className="bundle-list">
            {products.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
          <span className="bundle-discount">–{discount_percent}% bundle</span>
        </div>
      )}

      {/* ── Reasoning ───────────────────────────────────────────────── */}
      <p className="proposal-card__reasoning">
        {displayReasoning}
        {needsTruncation && (
          <button
            className="show-more-toggle"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {expanded ? 'show less' : 'show more'}
          </button>
        )}
      </p>

      {/* ── Actions ─────────────────────────────────────────────────── */}
      {isApproved ? (
        <div className="proposal-card__resolved">
          <span className="resolved-badge resolved-badge--approved">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Approved
          </span>
        </div>
      ) : isPending ? (
        <div className="proposal-card__actions">
          <button
            className="btn btn--approve"
            onClick={handleApprove}
            disabled={acting !== null}
            aria-label={`Approve ${product_name}`}
          >
            {acting === 'approving' ? <><Spinner /> Approving…</> : 'Approve'}
          </button>
          <button
            className="btn btn--reject"
            onClick={handleReject}
            disabled={acting !== null}
            aria-label={`Reject ${product_name}`}
          >
            {acting === 'rejecting' ? <><Spinner /> Rejecting…</> : 'Reject'}
          </button>
        </div>
      ) : null}
    </article>
  );
}
