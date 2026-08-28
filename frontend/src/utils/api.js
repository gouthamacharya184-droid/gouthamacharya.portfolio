/**
 * api.js — Centralized API base URL resolver and endpoint helpers
 *
 * Rules:
 *  - In local development (import.meta.env.DEV):
 *      Default to "" so Vite's dev proxy forwards /api/* to http://127.0.0.1:8787
 *      If VITE_API_BASE_URL is explicitly set, respect that override.
 *  - In production (import.meta.env.PROD):
 *      Use VITE_API_BASE_URL if defined, otherwise fall back to the known deployed Render backend
 *      ('https://goutham-portfolio-backend.onrender.com').
 */

export const RENDER_BACKEND_URL = 'https://goutham-portfolio-backend.onrender.com';

export function getApiBaseUrl(overrideUrl = '') {
  if (overrideUrl && typeof overrideUrl === 'string' && overrideUrl.trim() !== '') {
    return overrideUrl.trim().replace(/\/$/, '');
  }

  const envUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  if (import.meta.env.DEV) {
    return '';
  }

  return RENDER_BACKEND_URL;
}

export function apiUrl(path = '', overrideBase = '') {
  const base = getApiBaseUrl(overrideBase);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
