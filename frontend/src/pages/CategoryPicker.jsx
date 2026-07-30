/**
 * CategoryPicker — post-OAuth step asking user to select their store category.
 */

const CATEGORIES = [
  { key: 'home_kitchen', label: 'Home & Kitchen', icon: '🏠' },
  { key: 'apparel', label: 'Apparel', icon: '👕' },
  { key: 'electronics', label: 'Electronics', icon: '⚡' },
  { key: 'beauty', label: 'Beauty', icon: '💄' },
  { key: 'general', label: 'General', icon: '🛒' },
];

import { useState } from 'react';

export default function CategoryPicker({ storeName, onSelect }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
    if (!selected) return;
    setLoading(true);
    // Simulate a brief "syncing" delay for the demo feel
    setTimeout(() => onSelect(selected), 1200);
  };

  return (
    <div className="oauth-backdrop">
      <div className="oauth-card category-card">
        <div className="category-header">
          <div className="category-store-badge">
            <span className="category-store-dot" aria-hidden="true" />
            {storeName}.myshopify.com
          </div>
          <h2 className="category-header__title">Almost there!</h2>
          <p className="category-header__sub">
            What type of products does your store sell? This helps us calibrate
            our AI recommendations.
          </p>
        </div>

        <div className="category-grid" role="radiogroup" aria-label="Store category">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              className={`category-option ${selected === c.key ? 'category-option--selected' : ''}`}
              onClick={() => setSelected(c.key)}
              role="radio"
              aria-checked={selected === c.key}
            >
              <span className="category-option__icon">{c.icon}</span>
              <span className="category-option__label">{c.label}</span>
            </button>
          ))}
        </div>

        <button
          className="btn btn--primary category-cta"
          onClick={handleContinue}
          disabled={!selected || loading}
        >
          {loading ? (
            <>
              <svg className="btn-spinner" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="22" strokeDashoffset="8" />
              </svg>
              Syncing your store…
            </>
          ) : (
            'Continue to dashboard'
          )}
        </button>
      </div>
    </div>
  );
}
