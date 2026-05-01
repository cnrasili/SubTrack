const API_BASE = '/api';

async function request(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(API_BASE + path, opts);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Request failed');
  }
  return res.json();
}

const api = {
  getCategories: () => request('GET', '/categories'),
  createCategory: (data) => request('POST', '/categories', data),
  updateCategory: (id, data) => request('PUT', `/categories/${id}`, data),
  deleteCategory: (id) => request('DELETE', `/categories/${id}`),

  getSubscriptions: (params = {}) => {
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined));
    const qs = new URLSearchParams(clean).toString();
    return request('GET', '/subscriptions' + (qs ? '?' + qs : ''));
  },
  createSubscription: (data) => request('POST', '/subscriptions', data),
  updateSubscription: (id, data) => request('PUT', `/subscriptions/${id}`, data),
  deleteSubscription: (id) => request('DELETE', `/subscriptions/${id}`),
  getUpcoming: (days = 7) => request('GET', `/subscriptions/upcoming?days=${days}`),

  getSummary: () => request('GET', '/summary'),
};
