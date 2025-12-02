let API_BASE = import.meta.env?.VITE_API_URL;
if (!API_BASE && typeof window !== 'undefined' && window._env_ && window._env_.VITE_API_URL) {
  API_BASE = window._env_.VITE_API_URL;
}
if (!API_BASE && process.env.REACT_APP_API_URL) {
  API_BASE = process.env.REACT_APP_API_URL;
}
if (!API_BASE) {
  API_BASE = 'http://localhost:4000/api';
}


function buildUrl(path, query) {
  const base = API_BASE.endsWith('/') ? API_BASE : API_BASE + '/';
  const cleanPath = path.replace(/^\/*/, '');
  const url = new URL(cleanPath, base);
  if (query) {
    Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }
  return url.toString();
}

export async function apiFetch(path, options= {}) {
  const url = buildUrl(path, options.query);
  const headers= {};
  if (options.headers) Object.assign(headers, options.headers);
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
  list: () => apiFetch('products'),
  create: (payload) => apiFetch('products', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
  update: (id, payload) => apiFetch(`products/${id}`, { method: 'PUT', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
  delete: (id) => apiFetch(`products/${id}`, { method: 'DELETE' }),
};

export const auth = {
  register: (payload) => apiFetch('auth/register', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
  login: (payload) => apiFetch('auth/login', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
};

export const orders = {
  list: () => apiFetch('orders'),
  create: (payload) => apiFetch('orders', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
  get: (id) => apiFetch(`orders/${id}`),
  updateStatus: (id, status) => apiFetch(`orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }), headers: { 'Content-Type': 'application/json' } })
}

export const carts = {
  get: () => apiFetch('carts'),
  addItem: (payload) => apiFetch('carts/items', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
  updateItem: (productId, payload) => apiFetch(`carts/items/${productId}`, { method: 'PUT', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
  removeItem: (productId) => apiFetch(`carts/items/${productId}`, { method: 'DELETE' }),
  clear: () => apiFetch('carts', { method: 'DELETE' }),
}

