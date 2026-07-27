export async function checkChatStatus(baseUrl) {
  try {
    const res = await fetch(`${baseUrl}/api/chat/status`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok && res.status !== 304) return 'offline';
    const data = await res.json().catch(() => null);
    return data?.status === 'online' ? 'online' : 'offline';
  } catch {
    // Network failure, server down, DNS error, or timeout = genuinely offline
    return 'offline';
  }
}

export async function sendChatMessage(baseUrl, message, history = [], signal = null) {
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  };
  if (signal) {
    options.signal = signal;
  }
  return fetch(`${baseUrl}/api/chat`, options);
}
