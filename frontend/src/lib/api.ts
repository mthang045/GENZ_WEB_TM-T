const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

type FetchOptions = RequestInit & { query?: Record<string, string | number | boolean> };

function buildUrl(path: string, query?: Record<string, string | number | boolean>) {
  const url = new URL(path, API_BASE);
  if (query) {
    Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }
  return url.toString();
}

export async function apiFetch(path: string, options: FetchOptions = {}) {
  const url = buildUrl(path, options.query);
  const headers: Record<string, string> = {};
  if (options.headers) Object.assign(headers, options.headers as Record<string, string>);
  // Add auth token if present
  const token = localStorage.getItem('genz_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export const products = {
  list: () => apiFetch('api/products'),
  create: (payload: any) => apiFetch('api/products', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
};

export const auth = {
  register: (payload: any) => apiFetch('api/auth/register', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
  login: (payload: any) => apiFetch('api/auth/login', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
};

export const orders = {
  list: () => apiFetch('api/orders'),
  create: (payload: any) => apiFetch('api/orders', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
  get: (id: string) => apiFetch(`api/orders/${id}`),
  updateStatus: (id: string, status: string) => apiFetch(`api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }), headers: { 'Content-Type': 'application/json' } })
}

export const carts = {
  get: () => apiFetch('api/carts'),
  addItem: (payload: any) => apiFetch('api/carts/items', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
  updateItem: (productId: string, payload: any) => apiFetch(`api/carts/items/${productId}`, { method: 'PUT', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
  removeItem: (productId: string) => apiFetch(`api/carts/items/${productId}`, { method: 'DELETE' }),
  clear: () => apiFetch('api/carts', { method: 'DELETE' }),
}
