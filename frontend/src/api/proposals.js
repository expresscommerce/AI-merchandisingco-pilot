/**
 * Proposals & Results API client.
 *
 * All requests go through the Vite dev proxy → FastAPI backend.
 */

const API_BASE = '/api';

export async function fetchProposals(category, storeUrl) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (storeUrl) params.append('store_url', storeUrl);

  const url = `${API_BASE}/proposals/?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch proposals (${res.status})`);
  return res.json();
}

export async function fetchResults(storeUrl) {
  const url = storeUrl
    ? `${API_BASE}/results/?store_url=${encodeURIComponent(storeUrl)}`
    : `${API_BASE}/results/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch results (${res.status})`);
  return res.json();
}

export async function approveProposal(id, shop, proposedPrice) {
  const params = new URLSearchParams();
  if (shop) params.append('shop', shop);
  if (proposedPrice != null) params.append('proposed_price', proposedPrice);

  const url = `${API_BASE}/proposals/${id}/approve?${params.toString()}`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to approve proposal (${res.status})`);
  return res.json();
}

export async function rejectProposal(id) {
  const res = await fetch(`${API_BASE}/proposals/${id}/reject`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to reject proposal (${res.status})`);
  return res.json();
}

export async function rollbackProposal(id, shop) {
  const url = shop
    ? `${API_BASE}/proposals/${id}/rollback?shop=${encodeURIComponent(shop)}`
    : `${API_BASE}/proposals/${id}/rollback`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to rollback proposal (${res.status})`);
  return res.json();
}
