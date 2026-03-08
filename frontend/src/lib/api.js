const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// ── Token management ──────────────────────────────────────────
export const tokenStore = {
  get: () => localStorage.getItem('align_token'),
  set: (t) => localStorage.setItem('align_token', t),
  clear: () => localStorage.removeItem('align_token'),
};

// ── Base fetch wrapper ────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = tokenStore.get();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  register: (email, password, display_name) =>
    apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, display_name }) }),

  login: (email, password) =>
    apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  logout: () =>
    apiFetch('/api/auth/logout', { method: 'POST' }),

  me: () =>
    apiFetch('/api/auth/me'),
};

// ── Sessions ──────────────────────────────────────────────────
export const sessionsApi = {
  submit: (data) =>
    apiFetch('/api/sessions/submit', { method: 'POST', body: JSON.stringify(data) }),

  history: (limit = 50, offset = 0) =>
    apiFetch(`/api/sessions/history?limit=${limit}&offset=${offset}`),

  stats: () =>
    apiFetch('/api/sessions/stats'),

  updateFeedback: (id, feedback_thumb) =>
    apiFetch(`/api/sessions/${id}/feedback`, { method: 'PUT', body: JSON.stringify({ feedback_thumb }) }),
};

// ── AI ────────────────────────────────────────────────────────
export const aiApi = {
  recommend: (data) =>
    apiFetch('/api/ai/recommend', { method: 'POST', body: JSON.stringify(data) }),
};

export default apiFetch;
