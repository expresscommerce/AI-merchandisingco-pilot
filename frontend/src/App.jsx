import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import OAuthScreen from './pages/OAuthScreen';
import CategoryPicker from './pages/CategoryPicker';
import SummaryBar from './components/SummaryBar';
import ProposalsTab from './components/ProposalsTab';
import ResultsTab from './components/ResultsTab';
import Toast from './components/Toast';
import {
  fetchProposals,
  fetchResults,
  approveProposal,
  rejectProposal,
  rollbackProposal,
} from './api/proposals';
import CopilotDrawer from './components/CopilotDrawer';

const COLLAPSE_MS = 450;

/* ══════════════════════════════════════════════════════════════════════
   DASHBOARD — the authenticated view
   ══════════════════════════════════════════════════════════════════════ */

function Dashboard({ session, onLogout, initialToast }) {
  const [tab, setTab] = useState('proposals');
  const [proposals, setProposals] = useState([]);
  const [results, setResults] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [loadingResults, setLoadingResults] = useState(true);
  const [errorProposals, setErrorProposals] = useState(null);
  const [errorResults, setErrorResults] = useState(null);
  const [toast, setToast] = useState(initialToast || null);
  const [recentlyApproved, setRecentlyApproved] = useState([]);

  /* ── Fetch ────────────────────────────────────────────────────── */

  const loadProposals = useCallback(async () => {
    setLoadingProposals(true);
    setErrorProposals(null);
    try {
      setProposals(await fetchProposals(session?.category, session?.storeName));
    } catch (err) {
      setErrorProposals(err.message);
    } finally {
      setLoadingProposals(false);
    }
  }, [session?.category, session?.storeName]);

  const loadResults = useCallback(async () => {
    setLoadingResults(true);
    setErrorResults(null);
    try {
      const liveResults = await fetchResults(session?.storeName);
      setResults(liveResults || []);
    } catch (err) {
      setErrorResults(err.message);
    } finally {
      setLoadingResults(false);
    }
  }, [session?.storeName]);

  useEffect(() => {
    loadProposals();
    loadResults();
  }, [loadProposals, loadResults]);

  /* ── Optimistic approve ───────────────────────────────────────── */

  const handleApprove = useCallback(async (id) => {
    const proposal = proposals.find((p) => p.id === id);
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'approved' } : p))
    );
    try {
      await approveProposal(id, session?.storeName);
      await loadResults();
      setTimeout(() => {
        if (proposal) {
          setRecentlyApproved((prev) => [
            { id: proposal.id, product_name: proposal.product_name },
            ...prev,
          ]);
        }
        setProposals((prev) => prev.filter((p) => p.id !== id));
      }, 600);
    } catch {
      setProposals((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'pending' } : p))
      );
      setToast('Failed to approve — please try again.');
    }
  }, [proposals, session?.storeName, loadResults]);

  /* ── Optimistic reject ────────────────────────────────────────── */

  const handleReject = useCallback(async (id) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'rejected' } : p))
    );
    try {
      await rejectProposal(id);
      setTimeout(() => {
        setProposals((prev) => prev.filter((p) => p.id !== id));
      }, COLLAPSE_MS);
    } catch {
      setProposals((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'pending' } : p))
      );
      setToast('Failed to reject — please try again.');
    }
  }, []);

  /* ── Rollback proposal ────────────────────────────────────────── */

  const handleRollback = useCallback(async (id) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'pending' } : p))
    );
    try {
      await rollbackProposal(id, session?.storeName);
      setRecentlyApproved((prev) => prev.filter((item) => item.id !== id));
      await loadResults();
      await loadProposals();
      setToast('Proposal rolled back — original store state restored.');
    } catch {
      setProposals((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'approved' } : p))
      );
      setToast('Failed to rollback proposal — please try again.');
    }
  }, [session?.storeName, loadResults, loadProposals]);

  /* ── Stats ────────────────────────────────────────────────────── */

  const pending = proposals.filter((p) => p.status === 'pending');
  const highConf = pending.filter((p) => p.confidence === 'high');
  const currencySymbol = pending[0]?.estimated_impact?.match(/(Rs\.|PKR|CA\$|A\$|€|£|₹|\$|AED|SAR)/)?.[0] || '$';

  const totalImpact = pending.reduce((sum, p) => {
    const m = p.estimated_impact.match(/[\d,]+\.?\d*/);
    if (m) {
      const num = parseFloat(m[0].replace(/,/g, ''));
      return sum + (isNaN(num) ? 0 : num);
    }
    return sum;
  }, 0);

  /* ── Render ───────────────────────────────────────────────────── */

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <span className="app-logo">
            <span className="app-logo__icon" aria-hidden="true">◆</span>
            Merchandising Co-Pilot
          </span>

          <div className="app-header__right">
            <span className="app-header__store">
              <span className="store-dot" aria-hidden="true" />
              {session.storeName}
              {session.isDemo && <span className="demo-badge">Demo</span>}
            </span>
            <button className="btn-logout" onClick={onLogout}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <SummaryBar
          totalImpact={totalImpact}
          pendingCount={pending.length}
          highConfCount={highConf.length}
          currencySymbol={currencySymbol}
        />

        <nav className="tab-bar" role="tablist" aria-label="Dashboard views">
          <button
            className={`tab-btn ${tab === 'proposals' ? 'tab-btn--active' : ''}`}
            role="tab"
            aria-selected={tab === 'proposals'}
            onClick={() => setTab('proposals')}
          >
            Proposals
            {pending.length > 0 && (
              <span className="tab-badge">{pending.length}</span>
            )}
          </button>
          <button
            className={`tab-btn ${tab === 'results' ? 'tab-btn--active' : ''}`}
            role="tab"
            aria-selected={tab === 'results'}
            onClick={() => setTab('results')}
          >
            Results
          </button>
        </nav>

        {tab === 'proposals' && (
          <ProposalsTab
            proposals={proposals}
            loading={loadingProposals}
            error={errorProposals}
            onRetry={loadProposals}
            onApprove={handleApprove}
            onReject={handleReject}
            onRollback={handleRollback}
            recentlyApproved={recentlyApproved}
          />
        )}

        {tab === 'results' && (
          <ResultsTab
            results={results}
            loading={loadingResults}
            error={errorResults}
            onRetry={loadResults}
          />
        )}
      </main>

      <CopilotDrawer
        storeName={session?.storeName}
        category={session?.category}
        onAddProposal={(sugProp) => {
          const newProposal = {
            id: crypto.randomUUID(),
            status: 'pending',
            product_name: sugProp.product_name || 'AI Recommended Product',
            reasoning: sugProp.reasoning || 'AI Copilot generated strategy recommendation.',
            confidence: sugProp.confidence || 'high',
            estimated_impact: sugProp.estimated_impact || '+$500/mo revenue',
            type: sugProp.type || 'price_change',
            current_price: sugProp.current_price || 99.99,
            proposed_price: sugProp.proposed_price || 89.99,
            current_copy: sugProp.current_copy || '',
            proposed_copy: sugProp.proposed_copy || '',
            products: sugProp.products || [],
            discount_percent: sugProp.discount_percent || 15.0,
            co_purchase_pct: sugProp.co_purchase_pct || 25.0,
            data_trail: ['Generated via AI Merchandising Copilot Assistant'],
            sparkline_data: [4, 5, 3, 6, 7, 5, 4, 3, 5, 6, 4, 3, 2, 4, 5],
          };
          setProposals((prev) => [newProposal, ...prev]);
          setToast(`Proposal added for "${newProposal.product_name}"!`);
        }}
      />

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════════
   APP ROOT — onboarding flow + routing
   ══════════════════════════════════════════════════════════════════════ */

export default function App() {
  // Restore session from localStorage on mount
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem('mcp_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [onboarding, setOnboarding] = useState('idle'); // idle | oauth | category
  const [tempStore, setTempStore] = useState('');
  const [initialToast, setInitialToast] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Persist session to localStorage whenever it changes
  useEffect(() => {
    if (session) {
      localStorage.setItem('mcp_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('mcp_session');
    }
  }, [session]);

  /* ── Check for OAuth redirect params (?connected=true&shop=...) ─── */

  useEffect(() => {
    const isConnected = searchParams.get('connected') === 'true';
    const shop = searchParams.get('shop');
    const oauthError = searchParams.get('error');

    if (isConnected && shop) {
      setSession({ storeName: shop, category: 'General', isDemo: false });
      setInitialToast('Store connected — analyzing your catalog now');
      navigate('/dashboard', { replace: true });
    } else if (oauthError) {
      setInitialToast(`OAuth Error: ${oauthError}`);
    }
  }, [searchParams, navigate]);

  /* ── Onboarding handlers ──────────────────────────────────────── */

  const handleConnect = () => setOnboarding('oauth');
  const handleCancelOAuth = () => setOnboarding('idle');

  const handleAllow = (storeName) => {
    setTempStore(storeName);
    setOnboarding('category');
  };

  const handleCategorySelect = (category) => {
    setSession({ storeName: tempStore, category, isDemo: true });
    setOnboarding('idle');
    setTempStore('');
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setSession(null);
    setOnboarding('idle');
    setInitialToast(null);
    navigate('/');
  };

  /* ── Routes ───────────────────────────────────────────────────── */

  return (
    <>
      {/* Onboarding overlays */}
      {onboarding === 'oauth' && (
        <OAuthScreen onAllow={handleAllow} onCancel={handleCancelOAuth} />
      )}
      {onboarding === 'category' && (
        <CategoryPicker storeName={tempStore} onSelect={handleCategorySelect} />
      )}

      <Routes>
        <Route
          path="/"
          element={
            session
              ? <Navigate to="/dashboard" replace />
              : <LandingPage onConnect={handleConnect} />
          }
        />
        <Route
          path="/dashboard"
          element={
            session
              ? <Dashboard session={session} onLogout={handleLogout} initialToast={initialToast} />
              : <Navigate to="/" replace />
          }
        />
      </Routes>
    </>
  );
}
