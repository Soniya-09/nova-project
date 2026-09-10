// VITE_API_URL may be a bare host (e.g. when injected by a host's
// fromService env var at build time) or a full URL (local dev) — normalize both.
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE = rawBase.startsWith('http') ? rawBase : `https://${rawBase}/api`;

export async function api(path, options = {}) {
  const token = localStorage.getItem('nova_token');

  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Request failed');
  }

  return res.status === 204 ? null : res.json();
}
