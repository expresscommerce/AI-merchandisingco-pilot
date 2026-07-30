/**
 * Proposals & Results API client.
 *
 * All requests go through the Vite dev proxy → FastAPI backend.
 */

const API_BASE = '/api';

export async function fetchProposals() {
  const res = await fetch(`${API_BASE}/proposals/`);
  if (!res.ok) throw new Error(`Failed to fetch proposals (${res.status})`);
  return res.json();
}

export async function fetchResults() {
  const res = await fetch(`${API_BASE}/results/`);
  if (!res.ok) throw new Error(`Failed to fetch results (${res.status})`);
  return res.json();
}

export async function approveProposal(id) {
  const res = await fetch(`${API_BASE}/proposals/${id}/approve`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to approve proposal (${res.status})`);
  return res.json();
}

export async function rejectProposal(id) {
  const res = await fetch(`${API_BASE}/proposals/${id}/reject`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to reject proposal (${res.status})`);
  return res.json();
}
