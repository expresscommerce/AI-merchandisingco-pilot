/**
 * Proposals API client.
 *
 * All requests go through the Vite dev proxy → FastAPI backend.
 */

const BASE = '/api/proposals';

export async function fetchProposals() {
  const res = await fetch(`${BASE}/`);
  if (!res.ok) throw new Error(`Failed to fetch proposals (${res.status})`);
  return res.json();
}

export async function approveProposal(id) {
  const res = await fetch(`${BASE}/${id}/approve`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to approve proposal (${res.status})`);
  return res.json();
}

export async function rejectProposal(id) {
  const res = await fetch(`${BASE}/${id}/reject`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to reject proposal (${res.status})`);
  return res.json();
}
