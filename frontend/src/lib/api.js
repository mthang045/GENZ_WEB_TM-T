const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// @type RequestInit & { query?: Record };

function buildUrl(path, query) {
  const url = new URL(path, API_BASE);
  if (query) {
    Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }
  return url.toString();
}

export async function apiFetch(path, options= {}) {
  const url = buildUrl(path, options.query);
  const headers= {};
  if (options.headers) Object.assign(headers, options.headers);
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
  create: (payload) => apiFetch('api/products', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
};

export const auth = {
  register: (payload) => apiFetch('api/auth/register', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
  login: (payload) => apiFetch('api/auth/login', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
};

export const orders = {
  list: () => apiFetch('api/orders'),
  create: (payload) => apiFetch('api/orders', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
  get: (id) => apiFetch(`api/orders/${id}`),
  updateStatus: (id, status) => apiFetch(`api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }), headers: { 'Content-Type': 'application/json' } })
}

export const carts = {
  get: () => apiFetch('api/carts'),
  addItem: (payload) => apiFetch('api/carts/items', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
  updateItem: (productId, payload) => apiFetch(`api/carts/items/${productId}`, { method: 'PUT', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
  removeItem: (productId) => apiFetch(`api/carts/items/${productId}`, { method: 'DELETE' }),
  clear: () => apiFetch('api/carts', { method: 'DELETE' }),
}

