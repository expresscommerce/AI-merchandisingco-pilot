import { useState, useEffect, useCallback } from 'react';
import SummaryBar from './components/SummaryBar';
import ProposalsTab from './components/ProposalsTab';
import ResultsTab from './components/ResultsTab';
import Toast from './components/Toast';
import {
  fetchProposals,
  fetchResults,
  approveProposal,
  rejectProposal,
} from './api/proposals';

const COLLAPSE_MS = 450;

export default function App() {
  const [tab, setTab] = useState('proposals');
  const [proposals, setProposals] = useState([]);
  const [results, setResults] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [loadingResults, setLoadingResults] = useState(true);
  const [errorProposals, setErrorProposals] = useState(null);
  const [errorResults, setErrorResults] = useState(null);
  const [toast, setToast] = useState(null);
  const [recentlyApproved, setRecentlyApproved] = useState([]);

  /* ── Fetch proposals ──────────────────────────────────────────────── */

  const loadProposals = useCallback(async () => {
    setLoadingProposals(true);
    setErrorProposals(null);
    try {
      const data = await fetchProposals();
      setProposals(data);
    } catch (err) {
      setErrorProposals(err.message);
    } finally {
      setLoadingProposals(false);
    }
  }, []);

  /* ── Fetch results ────────────────────────────────────────────────── */

  const loadResults = useCallback(async () => {
    setLoadingResults(true);
    setErrorResults(null);
    try {
      const data = await fetchResults();
      setResults(data);
    } catch (err) {
      setErrorResults(err.message);
    } finally {
      setLoadingResults(false);
    }
  }, []);

  useEffect(() => {
    loadProposals();
    loadResults();
  }, [loadProposals, loadResults]);

  /* ── Optimistic approve ─────────────────────────────────────────── */

  const handleApprove = useCallback(async (id) => {
    const proposal = proposals.find((p) => p.id === id);

    // Optimistic: mark approved immediately
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'approved' } : p))
    );

    try {
      await approveProposal(id);
      // After success, move to recently approved strip and remove from grid
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
      // Rollback
      setProposals((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'pending' } : p))
      );
      setToast('Failed to approve — please try again.');
    }
  }, [proposals]);

  /* ── Optimistic reject ──────────────────────────────────────────── */

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

  /* ── Derived stats ──────────────────────────────────────────────── */

  const pending = proposals.filter((p) => p.status === 'pending');
  const highConf = pending.filter((p) => p.confidence === 'high');

  // Parse dollar amounts from estimated_impact strings
  const totalImpact = pending.reduce((sum, p) => {
    const match = p.estimated_impact.match(/\$[\d,]+/);
    if (match) {
      const num = parseFloat(match[0].replace(/[$,]/g, ''));
      return sum + (isNaN(num) ? 0 : num);
    }
    return sum;
  }, 0);

  /* ── Render ─────────────────────────────────────────────────────── */

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <h1 className="app-logo">
            <span className="app-logo__icon" aria-hidden="true">◆</span>
            Merchandising Co-Pilot
          </h1>
        </div>
      </header>

      <main className="app-main">
        <SummaryBar
          totalImpact={totalImpact}
          pendingCount={pending.length}
          highConfCount={highConf.length}
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

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
