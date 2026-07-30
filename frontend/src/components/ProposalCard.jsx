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

/** Mocked Shopify Product Page preview (with tab switcher to compare Current vs Proposed). */
function StorefrontProductPreview({ type, title, symbol, currentPrice, proposedPrice, currentCopy, proposedCopy, products, discountPercent, imageUrl }) {
  const [activeView, setActiveView] = useState('proposed'); // 'current' | 'proposed'

  const isPrice = type === 'price_change';
  const isCopy = type === 'copy_rewrite';
  const isBundle = type === 'bundle_suggestion';

  const oldPriceStr = currentPrice ? `${symbol}${currentPrice}` : `${symbol}29.99`;
  const newPriceStr = proposedPrice ? `${symbol}${proposedPrice}` : oldPriceStr;
  const handleSlug = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'product-page';

  return (
    <div className="storefront-preview-wrapper">
      {/* Tab Switcher without Emojis */}
      <div className="storefront-tabs">
        <button
          type="button"
          className={`storefront-tab ${activeView === 'current' ? 'storefront-tab--active' : ''}`}
          onClick={() => setActiveView('current')}
        >
          <span>Current Storefront</span>
        </button>
        <button
          type="button"
          className={`storefront-tab ${activeView === 'proposed' ? 'storefront-tab--active storefront-tab--proposed' : ''}`}
          onClick={() => setActiveView('proposed')}
        >
          <span>Proposed AI Storefront</span>
        </button>
      </div>

      {/* Mini Shopify Browser Window Mockup */}
      <div className={`storefront-card ${activeView === 'proposed' ? 'storefront-card--proposed' : 'storefront-card--current'}`}>
        <div className="storefront-browser-bar">
          <span className="browser-dot browser-dot--red"></span>
          <span className="browser-dot browser-dot--yellow"></span>
          <span className="browser-dot browser-dot--green"></span>
          <span className="browser-address">myshopify.com/products/{handleSlug}</span>
        </div>

        <div className="storefront-card__header-bar">
          <span className="storefront-card__tag">
            {activeView === 'current' ? 'Current Live Version' : 'Proposed AI Recommendation'}
          </span>
        </div>

        <div className="storefront-card__body">
          <div className="storefront-card__img">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="product-real-img" />
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            )}
          </div>

          <div className="storefront-card__info">
            <h4 className="storefront-card__title">{title}</h4>
            
            {/* Price display */}
            <div className="storefront-card__price">
              {isPrice ? (
                activeView === 'current' ? (
                  <span className="price-tag">{oldPriceStr}</span>
                ) : (
                  <span className="price-tag price-tag--new">{newPriceStr} <s className="price-tag--old">{oldPriceStr}</s></span>
                )
              ) : (
                <span className="price-tag">{oldPriceStr}</span>
              )}
            </div>

            {/* Bundle details if bundle proposal */}
            {isBundle && activeView === 'proposed' && (
              <div className="storefront-bundle-badge">
                Bundle Offer: Save {discountPercent}% when bought together
              </div>
            )}

            <button type="button" className={`storefront-card__btn ${activeView === 'proposed' ? 'storefront-card__btn--active' : ''}`} disabled>
              {isBundle && activeView === 'proposed' ? `Add ${products?.length || 3}-Item Bundle to Cart` : 'Add to Cart'}
            </button>

            {/* Description */}
            <p className="storefront-card__desc">
              {isCopy ? (
                activeView === 'current' ? currentCopy : proposedCopy
              ) : isBundle && activeView === 'proposed' ? (
                `Includes: ${products?.join(', ')}.`
              ) : (
                currentCopy || 'High quality product designed for durability and daily performance.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Card ────────────────────────────────────────────────────────── */

export default function ProposalCard({ proposal, onApprove, onReject, onRollback }) {
  const [expanded, setExpanded] = useState(false);
  const [acting, setActing] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
    id, type, product_name, image_url, reasoning, confidence,
    estimated_impact, status, data_trail,
    current_price, proposed_price, sparkline_data,
    current_copy, proposed_copy,
    products, discount_percent, co_purchase_pct,
    seasonal_context,
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

  const handleConfirmRollback = useCallback(async () => {
    setShowConfirm(false);
    setActing('rollback');
    try {
      if (onRollback) await onRollback(id);
    } finally {
      setActing(null);
    }
  }, [id, onRollback]);

  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';
  const isPending = status === 'pending';
  const isRolledBack = status === 'rolled_back';

  const symbol = estimated_impact?.match(/(Rs\.|PKR|CA\$|A\$|€|£|₹|\$|AED|SAR)/)?.[0] || '$';
  const revertText = type === 'price_change'
    ? `Revert price for "${product_name}" back to ${symbol}${current_price}?`
    : type === 'copy_rewrite'
    ? `Revert description for "${product_name}" back to original copy?`
    : `Revert proposal for "${product_name}"?`;

  const cls = [
    'card',
    isApproved && 'card--approved',
    isRejected && 'card--rejected',
    isRolledBack && 'card--rolled-back',
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

      {/* Confidence & Seasonal Badge */}
      <div className="card__meta-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
        <p className="card__confidence" style={{ marginBottom: 0 }}>
          <span className="conf-dot" style={{ backgroundColor: CONF_DOT[confidence] }} aria-hidden="true" />
          {confidence.charAt(0).toUpperCase() + confidence.slice(1)}
        </p>

        {seasonal_context && (
          <span className="card__seasonal-badge" title={`Seasonal Context: ${seasonal_context}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: '4px' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {seasonal_context}
          </span>
        )}
      </div>

      {/* Toggle button available on ALL cards */}
      <div className="preview-toggle-bar">
        <button
          type="button"
          className={`btn-preview-toggle ${showPreview ? 'btn-preview-toggle--active' : ''}`}
          onClick={() => setShowPreview(!showPreview)}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ marginRight: '6px' }}>
            <path d="M1 8s3-5.5 7-5.5S15 8 15 8s-3 5.5-7 5.5S1 8 1 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          {showPreview ? 'Hide storefront preview' : 'See how this looks on your store'}
        </button>
      </div>

      {showPreview ? (
        <StorefrontProductPreview
          type={type}
          title={product_name}
          imageUrl={image_url}
          symbol={symbol}
          currentPrice={current_price}
          proposedPrice={proposed_price}
          currentCopy={current_copy}
          proposedCopy={proposed_copy}
          products={products}
          discountPercent={discount_percent}
        />
      ) : (
        <>
          {/* ── Type-specific sections ──────────────────────────────── */}
          {type === 'price_change' && (
            <>
              <div className="card__price-row">
                <span className="price-old">{symbol}{current_price?.toLocaleString()}</span>
                <span className="price-arrow" aria-hidden="true">→</span>
                <span className="price-new">{symbol}{proposed_price?.toLocaleString()}</span>
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
        </>
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
        <div className="card__resolved" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span className="resolved-badge">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Approved
          </span>
          <button
            className="btn btn--ghost btn--small"
            style={{ fontSize: '0.75rem', padding: '4px 10px', opacity: 0.85 }}
            onClick={() => setShowConfirm(true)}
            disabled={acting !== null}
          >
            {acting === 'rollback' ? <><Spinner /> Rolling back…</> : '↺ Rollback'}
          </button>
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

      {/* Rollback Confirmation Dialog Overlay */}
      {showConfirm && (
        <div className="confirm-modal-overlay" style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justify: 'center',
          padding: '16px',
          borderRadius: '12px',
          zIndex: 10,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.875rem', color: '#f8fafc', fontWeight: 600, marginBottom: '12px' }}>
            {revertText}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn--primary"
              style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              onClick={handleConfirmRollback}
            >
              Yes, Revert
            </button>
            <button
              className="btn btn--ghost"
              style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
