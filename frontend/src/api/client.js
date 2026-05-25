const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getToken = () => localStorage.getItem('token');

export async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export const authApi = {
  login: (email, password) =>
    api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (body) =>
    api('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me: () => api('/auth/me'),
};

export const dashboardApi = {
  stats: () => api('/dashboard/stats'),
};

function withQuery(path, params) {
  const q = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v != null && String(v).trim() !== '') q.set(k, String(v).trim());
  });
  const qs = q.toString();
  return qs ? `${path}?${qs}` : path;
}

export const patientsApi = {
  list: (params) => api(withQuery('/patients', params)),
  create: (body) => api('/patients', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id) => api(`/patients/${id}`, { method: 'DELETE' }),
};

export const doctorsApi = {
  list: (params) => api(withQuery('/doctors', params)),
  create: (body) => api('/doctors', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/doctors/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id) => api(`/doctors/${id}`, { method: 'DELETE' }),
};

export const appointmentsApi = {
  list: () => api('/appointments'),
  create: (body) => api('/appointments', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  updateStatus: (id, status) =>
    api(`/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  remove: (id) => api(`/appointments/${id}`, { method: 'DELETE' }),
};
