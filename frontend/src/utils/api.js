/**
 * api.js — Centralized API base URL resolver and endpoint helpers
 *
 * Full-Stack Vercel Deployment:
 *  - Both frontend and serverless API (/api/*) are hosted on the same Vercel domain.
 *  - Defaults to "" so all requests use native relative paths (/api/...).
 *  - If VITE_API_BASE_URL is explicitly set, respects that override.
 */

export function getApiBaseUrl(overrideUrl = '') {
  if (overrideUrl && typeof overrideUrl === 'string' && overrideUrl.trim() !== '') {
    return overrideUrl.trim().replace(/\/$/, '');
  }

  const envUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  return '';
}

export function apiUrl(path = '', overrideBase = '') {
  const base = getApiBaseUrl(overrideBase);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
