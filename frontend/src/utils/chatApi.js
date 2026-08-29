/**
 * Resilient API Client with Cold-Start Detection & Exponential Backoff Retries
 */

// Exponential backoff helper
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function checkChatStatus(baseUrl, timeoutMs = 6000) {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(`${baseUrl}/api/chat/status`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    }).finally(() => clearTimeout(timer));

    const duration = Date.now() - start;

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.status === 'online') {
        return duration > 3500 ? 'warming' : 'online';
      }
      return data.status || 'online';
    }
    if (res.status === 503) {
      const data = await res.json().catch(() => ({}));
      if (data.reason === 'maintenance') return 'warming';
    }
    return 'offline';
  } catch (err) {
    if (err.name === 'AbortError') {
      return 'warming'; // Timed out waiting for Render free tier spin-up
    }
    return 'offline';
  }
}

export async function sendChatMessage(baseUrl, message, history = [], signal = null, maxRetries = 3) {
  const url = `${baseUrl}/api/chat`;
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  };

  let attempt = 0;
  let lastError;

  while (attempt < maxRetries) {
    attempt++;
    try {
      const controller = new AbortController();
      // Combine user signal if passed
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout limit

      const combinedSignal = signal || controller.signal;

      const response = await fetch(url, {
        ...options,
        signal: combinedSignal,
      }).finally(() => clearTimeout(timeoutId));

      if (response.status === 504 || response.status === 502 || response.status === 503) {
        // Cold start or proxy gateway timeout — wait and retry with exponential backoff
        if (attempt < maxRetries) {
          const backoffDelay = Math.pow(2, attempt) * 1000; // 2s, 4s...
          await sleep(backoffDelay);
          continue;
        }
      }

      return response;
    } catch (err) {
      lastError = err;
      if (err.name === 'AbortError') {
        if (signal?.aborted) throw err; // User requested abort
      }
      if (attempt < maxRetries) {
        const backoffDelay = Math.pow(2, attempt) * 1000;
        await sleep(backoffDelay);
      }
    }
  }

  throw lastError || new Error('Failed to connect to backend after multiple retries.');
}
