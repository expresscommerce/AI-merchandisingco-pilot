/**
 * Copilot API client.
 *
 * Calls POST /api/copilot/ask to interact with the AI assistant.
 */

const API_BASE = '/api';

export async function askCopilot(message, conversationHistory = [], storeUrl = null, category = 'Home & Kitchen') {
  const url = `${API_BASE}/copilot/ask`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      conversation_history: conversationHistory,
      store_url: storeUrl,
      category: category,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Copilot request failed (${res.status}): ${errText}`);
  }

  return res.json();
}
