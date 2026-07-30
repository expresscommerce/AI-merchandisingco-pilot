/**
 * OAuthScreen — mocked Shopify OAuth consent prompt.
 *
 * Styled to look like a real OAuth permission screen — store name input,
 * requested permissions list, Allow/Cancel buttons.
 */

import { useState } from 'react';

const PERMISSIONS = [
  { scope: 'read_products', label: 'View your products and collections', icon: '📦' },
  { scope: 'read_orders', label: 'View your order history', icon: '🧾' },
  { scope: 'read_analytics', label: 'View your store analytics', icon: '📊' },
  { scope: 'write_products', label: 'Update product prices and descriptions', icon: '✏️' },
];

export default function OAuthScreen({ onAllow, onCancel }) {
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState('');

  const handleAllow = () => {
    const trimmed = storeName.trim();
    if (!trimmed) {
      setError('Please enter your store name');
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
          <h2 className="oauth-header__title">Connect to Merchandising Co-Pilot</h2>
          <p className="oauth-header__sub">
            Enter your Shopify store name to get started
          </p>
        </div>

        {/* Store name input */}
        <div className="oauth-store-input">
          <label htmlFor="store-name" className="oauth-input-label">Store name</label>
          <div className="oauth-input-wrap">
            <input
              id="store-name"
              type="text"
              className={`oauth-input ${error ? 'oauth-input--error' : ''}`}
              placeholder="my-awesome-store"
              value={storeName}
              onChange={(e) => { setStoreName(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleAllow()}
              autoFocus
            />
            <span className="oauth-input-suffix">.myshopify.com</span>
          </div>
          {error && <p className="oauth-input-error">{error}</p>}
        </div>

        {/* Permissions list */}
        <div className="oauth-permissions">
          <p className="oauth-permissions__label">This app will be able to:</p>
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
          <button className="btn btn--primary oauth-btn--allow" onClick={handleAllow}>
            Allow access
          </button>
          <button className="btn btn--ghost oauth-btn--cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>

        <p className="oauth-footer">
          You can revoke access at any time from your Shopify admin.
        </p>
      </div>
    </div>
  );
}
