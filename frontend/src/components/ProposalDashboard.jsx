import { useState, useEffect, useCallback } from 'react';
import ProposalCard from './ProposalCard';
import Toast from './Toast';
import {
  fetchProposals,
  approveProposal,
  rejectProposal,
} from '../api/proposals';

/* ── Time constants ───────────────────────────────────────────────────── */

const REJECTED_COLLAPSE_MS = 400; // match CSS transition duration

/* ── Component ────────────────────────────────────────────────────────── */

export default function ProposalDashboard() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [toast, setToast]         = useState(null);

  /* ── Fetch ──────────────────────────────────────────────────────────── */

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProposals();
      setProposals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Optimistic approve ─────────────────────────────────────────────── */

  const handleApprove = useCallback(async (id) => {
    // Optimistic: immediately mark as approved
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'approved' } : p))
    );

    try {
      await approveProposal(id);
    } catch {
      // Rollback
      setProposals((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'pending' } : p))
      );
      setToast('Failed to approve — please try again.');
    }
  }, []);

  /* ── Optimistic reject ──────────────────────────────────────────────── */

  const handleReject = useCallback(async (id) => {
    // Optimistic: mark as rejected (card starts collapsing via CSS)
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'rejected' } : p))
    );

    try {
      await rejectProposal(id);
      // Remove from list after collapse animation finishes
      setTimeout(() => {
        setProposals((prev) => prev.filter((p) => p.id !== id));
      }, REJECTED_COLLAPSE_MS);
    } catch {
      // Rollback
      setProposals((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'pending' } : p))
      );
      setToast('Failed to reject — please try again.');
    }
  }, []);

  /* ── Render states ──────────────────────────────────────────────────── */

  // Loading skeleton
  if (loading) {
    return (
      <section className="dashboard" aria-busy="true">
        <header className="dashboard__header">
          <h1 className="dashboard__title">Proposals</h1>
        </header>
        <div className="proposal-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-card" aria-hidden="true">
              <div className="skeleton-line skeleton-line--title" />
              <div className="skeleton-line skeleton-line--impact" />
              <div className="skeleton-line skeleton-line--body" />
              <div className="skeleton-line skeleton-line--body skeleton-line--short" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="dashboard">
        <header className="dashboard__header">
          <h1 className="dashboard__title">Proposals</h1>
        </header>
        <div className="dashboard__error" role="alert">
          <div className="error-icon" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="var(--clr-error)" strokeWidth="2" />
              <path d="M20 12v10" stroke="var(--clr-error)" strokeWidth="2" strokeLinecap="round" />
              <circle cx="20" cy="27" r="1.5" fill="var(--clr-error)" />
            </svg>
          </div>
          <p className="error-msg">Something went wrong loading proposals.</p>
          <p className="error-detail">{error}</p>
          <button className="btn btn--retry" onClick={load}>
            Retry
          </button>
        </div>
      </section>
    );
  }

  // Empty state
  if (proposals.length === 0) {
    return (
      <section className="dashboard">
        <header className="dashboard__header">
          <h1 className="dashboard__title">Proposals</h1>
        </header>
        <div className="dashboard__empty">
          <div className="empty-icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="12" width="32" height="24" rx="4" stroke="var(--clr-muted)" strokeWidth="2" />
              <path d="M8 20h32" stroke="var(--clr-muted)" strokeWidth="2" />
              <circle cx="14" cy="16" r="1.5" fill="var(--clr-muted)" />
              <circle cx="19" cy="16" r="1.5" fill="var(--clr-muted)" />
              <circle cx="24" cy="16" r="1.5" fill="var(--clr-muted)" />
            </svg>
          </div>
          <p className="empty-title">No proposals yet</p>
          <p className="empty-subtitle">
            Run an analysis to see recommendations here.
          </p>
        </div>
      </section>
    );
  }

  // Happy path — proposal grid
  return (
    <section className="dashboard">
      <header className="dashboard__header">
        <h1 className="dashboard__title">Proposals</h1>
        <p className="dashboard__subtitle">
          {proposals.filter((p) => p.status === 'pending').length} pending review
        </p>
      </header>

      <div className="proposal-grid">
        {proposals.map((p) => (
          <ProposalCard
            key={p.id}
            proposal={p}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))}
      </div>

      {toast && (
        <Toast message={toast} onClose={() => setToast(null)} />
      )}
    </section>
  );
}
