export async function checkChatStatus(baseUrl) {
  try {
    const res = await fetch(`${baseUrl}/api/chat/status`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok && res.status !== 304) return 'offline';
    const data = await res.json().catch(() => null);
    return data?.status === 'online' ? 'online' : 'offline';
  } catch {
    return 'offline';
  }
}

export async function sendChatMessage(baseUrl, message) {
  return fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
}
