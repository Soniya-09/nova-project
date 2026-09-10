// VITE_API_URL may be a bare host, a full origin, or a full origin that
// already ends in /api — accept all three so a small formatting slip in
// deploy config doesn't silently break every request.
const raw = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const withProtocol = raw.startsWith('http') ? raw : `https://${raw}`;
const withoutTrailingSlash = withProtocol.replace(/\/+$/, '');
const BASE = withoutTrailingSlash.endsWith('/api') ? withoutTrailingSlash : `${withoutTrailingSlash}/api`;

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
