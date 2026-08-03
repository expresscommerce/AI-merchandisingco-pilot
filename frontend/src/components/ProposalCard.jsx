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

/** Price trend line chart with timeline axes */
function PriceTrendChart() {
  return (
    <div className="price-chart-wrap">
      <div className="price-chart-y">
        <span>$1500</span>
        <span>$1000</span>
        <span>$500</span>
        <span>0</span>
      </div>
      <div className="price-chart-svg-container">
        <svg viewBox="0 0 200 60" className="price-chart-svg">
          {/* Grid lines */}
          <line x1="0" y1="10" x2="200" y2="10" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="0" y1="30" x2="200" y2="30" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="0" y1="50" x2="200" y2="50" stroke="#f1f5f9" strokeWidth="1" />
          
          {/* Trend lines */}
          <path
            d="M 5,45 Q 40,25 70,38 T 130,20 T 195,30"
            fill="none"
            stroke="#475569"
            strokeWidth="2"
          />
          <path
            d="M 5,50 Q 50,45 80,35 T 140,28 T 195,35"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        </svg>
        <div className="price-chart-x">
          <span>Jan</span>
          <span>Sept</span>
          <span>Dec</span>
          <span>Web</span>
        </div>
      </div>
    </div>
  );
}

export default function ProposalCard({ proposal, onApprove, onReject, onRollback }) {
  const [acting, setActing] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
    id, type, product_name, image_url, reasoning, confidence,
    estimated_impact, status, data_trail,
    current_price, proposed_price, sparkline_data,
    current_copy, proposed_copy,
    products, bundle_images, discount_percent, co_purchase_pct,
  } = proposal;

  const [customPrice, setCustomPrice] = useState(() => proposed_price || 849.95);
  const minSlider = Math.round((current_price || 925.95) * 0.6);
  const maxSlider = Math.round((current_price || 925.95) * 1.4);

  // Helper to get image for each bundle item (prefers real store bundle_images or store image_url)
  const getBundleItemImg = (idx, itemTitle) => {
    if (bundle_images && bundle_images[idx]) return bundle_images[idx];
    if (idx === 0 && image_url) return image_url;

    // Winter / Snowboard category appropriate fallbacks (NO sneakers)
    const storeFallbackImgs = [
      image_url || "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=120&q=80",
      "https://images.unsplash.com/photo-1605540436563-5bca919ae766?auto=format&fit=crop&w=120&q=80",
      "https://images.unsplash.com/photo-1565992441121-4367c2967103?auto=format&fit=crop&w=120&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=120&q=80",
    ];
    return storeFallbackImgs[idx % storeFallbackImgs.length];
  };

  const handleApprove = useCallback(async () => {
    setActing('approve');
    try {
      const targetPrice = type === 'price_change' ? customPrice : proposed_price;
      await onApprove(id, targetPrice);
    } finally {
      setActing(null);
    }
  }, [id, onApprove, type, customPrice, proposed_price]);

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

  const symbol = estimated_impact?.match(/(Rs\.|PKR|CA\$|A\$|€|£|₹|\$|AED|SAR)/)?.[0] || '$';

  // Format type header label & impact badge style
  const typeLabel = type === 'bundle_suggestion'
    ? 'BUNDLE'
    : type === 'copy_rewrite'
    ? 'IMPROVE'
    : type === 'price_change'
    ? 'REPRICE'
    : 'OPTIMIZE';

  const impactLabel = confidence === 'high'
    ? 'High Impact'
    : confidence === 'medium'
    ? 'Medium Impact'
    : 'Low Impact';

  const impactClass = confidence === 'high'
    ? 'impact-badge--high'
    : confidence === 'medium'
    ? 'impact-badge--medium'
    : 'impact-badge--low';

  const cls = [
    'proposal-card',
    isApproved && 'proposal-card--approved',
    isRejected && 'proposal-card--rejected',
  ].filter(Boolean).join(' ');

  return (
    <article className={cls}>
      {/* 1. Header: Type Label (left) & Impact Tag (right) */}
      <div className="proposal-card__top">
        <span className="proposal-card__type">{typeLabel}</span>
        <span className={`impact-badge ${impactClass}`}>{impactLabel}</span>
      </div>

      {/* 2. Proposal Title */}
      <h3 className="proposal-card__title">{product_name}</h3>

      {/* 3. Toggle Storefront Preview / Visual Sub-Section */}
      {showPreview ? (
        <StorefrontProductPreview
          type={type}
          title={product_name}
          imageUrl={image_url}
          symbol={symbol}
          currentPrice={current_price}
          proposedPrice={customPrice}
          currentCopy={current_copy}
          proposedCopy={proposed_copy}
          products={products}
          discountPercent={discount_percent}
        />
      ) : (
        <div className="proposal-card__visual">
          {/* BUNDLE VISUAL WITH REAL STORE PRODUCT PICTURES */}
          {type === 'bundle_suggestion' && (
            <div className="bundle-icons-row">
              {products && products.length > 0 ? (
                products.map((item, idx) => (
                  <div key={idx} className="bundle-item-group">
                    <div className="bundle-item-box">
                      <img
                        src={getBundleItemImg(idx, item)}
                        alt={item}
                        className="bundle-product-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getBundleItemImg((idx + 1) % 3, item);
                        }}
                      />
                    </div>
                    {idx < products.length - 1 && <span className="bundle-plus">+</span>}
                  </div>
                ))
              ) : (
                <>
                  <div className="bundle-item-box">
                    <img src={getBundleItemImg(0, "Snowboard")} alt="Snowboard" className="bundle-product-img" />
                  </div>
                  <span className="bundle-plus">+</span>
                  <div className="bundle-item-box">
                    <img src={getBundleItemImg(1, "Winter Gear")} alt="Gear" className="bundle-product-img" />
                  </div>
                  <span className="bundle-plus">+</span>
                  <div className="bundle-item-box">
                    <img src={getBundleItemImg(2, "Accessories")} alt="Accessories" className="bundle-product-img" />
                  </div>
                </>
              )}
            </div>
          )}

          {/* COPY REWRITE VISUAL */}
          {type === 'copy_rewrite' && (
            <div className="copy-diff-container">
              <div className="diff-box diff-box--old">
                <span className="diff-box__label">DIFF</span>
                <p className="diff-box__text diff-box__text--strikethrough">
                  {current_copy || 'The Collection Snowboard Description. Selling Plala Skiss Wax inwer may increase.'}
                </p>
              </div>
              <div className="diff-box diff-box--new">
                <span className="diff-box__label">AFTER</span>
                <p className="diff-box__text diff-box__text--highlight">
                  {proposed_copy || 'The Collection Snowboard Description. Selling Plala Skiss Wax lower may increase.'}
                </p>
              </div>
            </div>
          )}

          {/* INTERACTIVE REPRICE VISUAL */}
          {type === 'price_change' && (
            <div className="reprice-container">
              <PriceTrendChart />
              <div className="price-slider-row">
                <div className="slider-header">
                  <span className="slider-label">Manual adjustment:</span>
                  <span className="slider-value-preview">{symbol}{customPrice.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={minSlider}
                  max={maxSlider}
                  step="0.5"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(parseFloat(e.target.value))}
                  className="interactive-price-slider"
                  title="Drag to manually adjust proposed price"
                />
              </div>
              <div className="price-change-values">
                <span className="price-val price-val--old">{symbol}{current_price || 925.95}</span>
                <span className="price-arrow">➔</span>
                <span className="price-val price-val--new">{symbol}{customPrice.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Fallback OPTIMIZE Visual */}
          {type === 'other' || (!['bundle_suggestion', 'copy_rewrite', 'price_change'].includes(type)) && (
            <div className="bundle-icons-row">
              <div className="bundle-item-box">
                <img src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=120&q=80" alt="Product" className="bundle-product-img" />
              </div>
              <span className="bundle-plus">+</span>
              <div className="bundle-item-box">
                <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=120&q=80" alt="Accessory" className="bundle-product-img" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Preview Button */}
      <div className="store-preview-btn-wrap">
        <button
          type="button"
          className="btn-store-preview"
          onClick={() => setShowPreview(!showPreview)}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginRight: '6px' }}>
            <path d="M2 4h12l-1 9H3L2 4z" stroke="currentColor" strokeWidth="1.4" />
            <path d="M6 4V2.5A1.5 1.5 0 017.5 1h1A1.5 1.5 0 0110 2.5V4" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          {showPreview ? 'CLOSE PREVIEW' : 'PREVIEW ON STORE'}
        </button>
      </div>

      {/* 5. Bullet Points / Reasoning Description */}
      <div className="proposal-card__reasoning">
        {type === 'bundle_suggestion' ? (
          <ul className="reasoning-bullets">
            {products && products.length > 0 ? (
              products.map((item, idx) => <li key={idx}>• {item}</li>)
            ) : (
              <>
                <li>• The Multi-Location Snowboard</li>
                <li>• Selling Plans Skis Wax</li>
                <li>• Bundling this product with snowboard gear increase</li>
              </>
            )}
          </ul>
        ) : (
          <p className="reasoning-text">
            {reasoning || 'Proposes concise copy with the product with other product snowboarding gear may increase sales.'}
          </p>
        )}
      </div>

      {/* 6. Revenue Lift Impact Tag */}
      <div className="proposal-card__impact-row">
        <span className="impact-amount">{estimated_impact}</span>
        <span className="impact-sep">|</span>
        <span className={`impact-level impact-level--${confidence}`}>
          {confidence.charAt(0).toUpperCase() + confidence.slice(1)}
        </span>
      </div>

      {/* 7. Action Buttons */}
      {isApproved ? (
        <div className="resolved-row">
          <span className="badge-approved">✓ Approved</span>
          <button className="btn-rollback" onClick={() => setShowConfirm(true)}>↺ Revert</button>
        </div>
      ) : isPending ? (
        <div className="proposal-card__actions">
          <button
            className="btn-card btn-card--approve"
            onClick={handleApprove}
            disabled={acting !== null}
          >
            {acting === 'approve' ? <><Spinner /> APPROVING...</> : 'APPROVE'}
          </button>
          <button
            className="btn-card btn-card--reject"
            onClick={handleReject}
            disabled={acting !== null}
          >
            {acting === 'reject' ? <><Spinner /> REJECTING...</> : 'REJECT'}
          </button>
        </div>
      ) : null}

      {/* Rollback confirmation modal */}
      {showConfirm && (
        <div className="confirm-modal-overlay">
          <p className="confirm-text">Revert proposal for "{product_name}"?</p>
          <div className="confirm-buttons">
            <button className="btn-card btn-card--approve" onClick={handleConfirmRollback}>Yes, Revert</button>
            <button className="btn-card btn-card--reject" onClick={() => setShowConfirm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </article>
  );
}

