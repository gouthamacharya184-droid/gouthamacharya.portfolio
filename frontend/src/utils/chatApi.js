/**
 * chatApi.js — Backend communication utilities
 *
 * Status check strategy:
 *  1. First hit /api/health (instant, no Groq call) — just proves the server is alive.
 *     Render free tier cold-starts in 30–60s, so we allow up to 90s timeout here.
 *  2. If server is alive, hit /api/chat/status for the Groq AI status.
 *     This returns "online" | "offline" with a reason.
 *
 * States returned:
 *   "checking"  — in-flight (used by UI)
 *   "waking"    — server is alive but not yet warmed (cold-start in progress)
 *   "online"    — server alive + Groq AI responding
 *   "degraded"  — server alive but Groq key invalid/quota exceeded
 *   "offline"   — server not reachable after 90s timeout
 */

/**
 * Check if the backend server itself is alive.
 * Uses a 90-second timeout to handle Render free-tier cold-starts.
 * @param {string} baseUrl
 * @returns {Promise<"alive"|"offline">}
 */
export async function checkBackendHealth(baseUrl) {
  try {
    const res = await fetch(`${baseUrl}/api/health`, {
      signal: AbortSignal.timeout(90_000), // 90s for cold-start
      cache: 'no-store',
    });
    return res.ok ? 'alive' : 'offline';
  } catch {
    return 'offline';
  }
}

/**
 * Check the full AI chat status (requires backend alive + Groq responding).
 * Uses a 15-second timeout — backend is already warm at this point.
 * @param {string} baseUrl
 * @returns {Promise<"online"|"degraded"|"offline">}
 */
export async function checkAIStatus(baseUrl) {
  try {
    const res = await fetch(`${baseUrl}/api/chat/status`, {
      signal: AbortSignal.timeout(15_000),
      cache: 'no-store',
    });
    if (!res.ok && res.status !== 304) return 'offline';
    const data = await res.json().catch(() => null);
    if (data?.status === 'online') return 'online';
    // Server alive but Groq has an error (bad key, quota, etc.)
    return 'degraded';
  } catch {
    return 'offline';
  }
}

/**
 * Full status check: server health → AI status.
 * Returns a unified status string for the UI dot indicator.
 *
 * Flow:
 *   offline  → server not reachable
 *   waking   → server responded to /health but /chat/status is still coming up
 *   degraded → server alive but AI key/quota issue
 *   online   → everything working
 *
 * @param {string} baseUrl
 * @returns {Promise<"online"|"waking"|"degraded"|"offline">}
 */
export async function checkChatStatus(baseUrl) {
  const health = await checkBackendHealth(baseUrl);
  if (health === 'offline') return 'offline';

  // Server is alive — now check AI specifically
  const aiStatus = await checkAIStatus(baseUrl);
  return aiStatus; // "online" | "degraded" | "offline"
}

/**
 * Send a chat message to the backend (streaming).
 * @param {string} baseUrl
 * @param {string} message
 * @returns {Promise<Response>}
 */
export async function sendChatMessage(baseUrl, message) {
  return fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
}
