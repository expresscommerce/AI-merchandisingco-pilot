/**
 * OAuthScreen — Supports both:
 *   1. Live Shopify App OAuth Installation Flow (redirects browser window to Shopify OAuth consent screen).
 *   2. Instant Demo Preview Mode.
 */

import { useState } from 'react';

const PERMISSIONS = [
  { scope: 'read_products', label: 'View your products and collections', icon: '📦' },
  { scope: 'read_orders', label: 'View your order history', icon: '🧾' },
  { scope: 'read_analytics', label: 'View your store analytics', icon: '📊' },
  { scope: 'write_products', label: 'Update product prices and descriptions', icon: '✏️' },
];

export default function OAuthScreen({ onAllow, onCancel }) {
  const [storeInput, setStoreInput] = useState('');
  const [error, setError] = useState('');

  // 1. Real Shopify OAuth Flow (Redirects Browser)
  const handleRealOAuth = (e) => {
    if (e) e.preventDefault();
    const trimmed = storeInput.trim();
    if (!trimmed) {
      setError("Please enter your store's .myshopify.com URL or domain");
      return;
    }
    // Redirect browser window directly to backend OAuth install route
    const installUrl = `http://localhost:8000/auth/shopify/install?shop=${encodeURIComponent(trimmed)}`;
    window.location.href = installUrl;
  };

  // 2. Mock Demo Flow
  const handleMockAllow = () => {
    const trimmed = storeInput.trim();
    if (!trimmed) {
      setError('Please enter a store URL or handle');
      return;
    }
    onAllow(trimmed);
  };

  return (
    <div className="oauth-backdrop">
      <div className="oauth-card">
        {/* Header */}
        <div className="oauth-header">
          <div className="oauth-header__logos">
            <div className="oauth-logo oauth-logo--shopify">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15.34 3.27c-.05 0-.1.03-.12.08-.02.05-.55 1.07-.55 1.07s-.8-.17-.92-.2c-.04-.36-.22-.94-.56-1.15-.5-.3-1.18-.22-1.6.18-.3.28-.52.7-.64 1.15l-.58.18c-.14.04-.23.16-.24.3l-.78 6.02c0 .14.08.27.22.31l4.5 1.4c.14.04.29-.03.34-.17l2.2-6.8c.05-.15-.02-.3-.16-.36l-1.11-.01zm-2.5.44c.17 0 .3.05.4.14.15.13.24.33.28.56l-1.37.42c.12-.54.37-.96.69-1.12z" fill="#95BF47"/>
                <path d="M14.5 5.38l-.38.12-.15-.92c-.04-.22-.13-.43-.28-.56a.51.51 0 00-.4-.14c-.32.16-.57.58-.69 1.12l-1.05.32.62-1.93c.04-.12.14-.2.26-.2h.07c.46.04.79.42.94.82l.12.38 1 .3z" fill="#5E8E3E"/>
              </svg>
            </div>
            <div className="oauth-connect-dots" aria-hidden="true">
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
            <div className="oauth-logo oauth-logo--app">
              <span className="app-logo__icon">◆</span>
            </div>
          </div>
          <h2 className="oauth-header__title">Connect Shopify Store</h2>
          <p className="oauth-header__sub">
            Enter your store domain to connect via real Shopify OAuth
          </p>
        </div>

        {/* Store input form */}
        <form onSubmit={handleRealOAuth} className="oauth-store-input">
          <label htmlFor="store-name" className="oauth-input-label">Shopify Store Domain</label>
          <div className="oauth-input-wrap">
            <input
              id="store-name"
              type="text"
              className={`oauth-input ${error ? 'oauth-input--error' : ''}`}
              placeholder="e.g. test-store.myshopify.com or gymshark.com"
              value={storeInput}
              onChange={(e) => { setStoreInput(e.target.value); setError(''); }}
              autoFocus
            />
          </div>
          {error && <p className="oauth-input-error">{error}</p>}

          {/* Permissions list */}
          <div className="oauth-permissions" style={{ marginTop: '16px' }}>
            <p className="oauth-permissions__label">Requested app permissions:</p>
            <ul className="oauth-permissions__list">
              {PERMISSIONS.map((p) => (
                <li key={p.scope} className="oauth-perm">
                  <span className="oauth-perm__icon" aria-hidden="true">{p.icon}</span>
                  <span className="oauth-perm__text">{p.label}</span>
                  <span className="oauth-perm__scope">{p.scope}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="oauth-actions">
            <button type="submit" className="btn btn--primary oauth-btn--allow">
              🔑 Connect via Shopify OAuth
            </button>
            <button
              type="button"
              className="btn btn--ghost oauth-btn--real"
              onClick={handleMockAllow}
            >
              Instant Demo Mode (No Auth)
            </button>
            <button type="button" className="btn btn--ghost oauth-btn--cancel" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>

        <p className="oauth-footer">
          Clicking <strong>Connect via Shopify OAuth</strong> will redirect to your store's Shopify admin login screen.
        </p>
      </div>
    </div>
  );
}
