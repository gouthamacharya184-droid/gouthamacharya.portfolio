export function makeId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function truncate(text, maxLen = 40) {
  if (!text || text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + '…';
}

export function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
