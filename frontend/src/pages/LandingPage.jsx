/**
 * LandingPage — SaaS-style hero page with "Connect your Shopify store" CTA.
 */

export default function LandingPage({ onConnect }) {
  return (
    <div className="landing">
      <div className="landing__bg" aria-hidden="true">
        <div className="landing__glow landing__glow--1" />
        <div className="landing__glow landing__glow--2" />
      </div>

      <nav className="landing__nav">
        <span className="app-logo">
          <span className="app-logo__icon" aria-hidden="true">◆</span>
          Merchandising Co-Pilot
        </span>
      </nav>

      <main className="landing__hero">
        <div className="landing__badge">AI-Powered E-Commerce Intelligence</div>

        <h1 className="landing__title">
          Smarter pricing, copy &amp; bundles —<br />
          <span className="landing__title-accent">powered by your store data</span>
        </h1>

        <p className="landing__subtitle">
          Connect your Shopify store and let AI analyze your catalog, orders, and
          competitors to generate revenue-boosting recommendations you can approve
          with one click.
        </p>

        <button className="landing__cta" onClick={onConnect}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5.5 2.5L4.17 5.83l-3.33 1.34 3.33 1.33L5.5 11.83l1.33-3.33 3.34-1.33-3.34-1.34L5.5 2.5z" fill="currentColor" opacity=".7"/>
            <path d="M13 7l-1 2.5L9.5 10.5 12 11.5l1 2.5 1-2.5 2.5-1-2.5-1L13 7z" fill="currentColor"/>
            <path d="M8.5 13l-.67 1.67L6.17 15.33l1.66.67L8.5 17.67l.67-1.67 1.66-.67-1.66-.66L8.5 13z" fill="currentColor" opacity=".5"/>
          </svg>
          Connect your Shopify store
        </button>

        <p className="landing__trust">
          Read-only access · No credit card required · Takes 30 seconds
        </p>

        <div className="landing__features">
          <div className="feature-card">
            <div className="feature-card__icon">💰</div>
            <h3 className="feature-card__title">Smart Repricing</h3>
            <p className="feature-card__desc">
              Detect when competitors undercut you and get data-backed price
              recommendations that protect margins.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon">✍️</div>
            <h3 className="feature-card__title">Copy Rewriting</h3>
            <p className="feature-card__desc">
              Transform bland feature lists into persuasive, conversion-focused
              product descriptions in one click.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon">📦</div>
            <h3 className="feature-card__title">Bundle Suggestions</h3>
            <p className="feature-card__desc">
              Discover which products customers buy together and create curated
              bundles that raise your AOV.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
