// CarePulse API Client

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function getToken() {
  return localStorage.getItem('carepulse_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('carepulse_token', token);
  } else {
    localStorage.removeItem('carepulse_token');
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('carepulse_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('carepulse_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('carepulse_user');
  }
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 204) {
      return null;
    }

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const msg = json?.message || `Request failed with status ${response.status}`;
      throw new ApiError(msg, response.status, json?.errors || null);
    }

    // ApiResponse envelope returns { success, message, data }
    return json?.data !== undefined ? json.data : json;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || 'Network connection failed. Make sure backend is running on port 8080.', 0);
  }
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

// Auth API
export const authApi = {
  async login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    if (data?.token) {
      setToken(data.token);
      setStoredUser(data);
    }
    return data;
  },

  async register(registerData) {
    const data = await api.post('/auth/register', registerData);
    if (data?.token) {
      setToken(data.token);
      setStoredUser(data);
    }
    return data;
  },

  async getCurrentUser() {
    return api.get('/auth/me');
  },

  logout() {
    setToken(null);
    setStoredUser(null);
  }
};

// Specialties API
export const specialtiesApi = {
  getAll: () => api.get('/specialties'),
  getById: (id) => api.get(`/specialties/${id}`),
  create: (data) => api.post('/specialties', data),
  update: (id, data) => api.put(`/specialties/${id}`, data),
  delete: (id) => api.delete(`/specialties/${id}`),
};

// Doctors API
export const doctorsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.specialtyId) query.append('specialtyId', params.specialtyId);
    if (params.includeInactive) query.append('includeInactive', 'true');
    const qs = query.toString();
    return api.get(`/doctors${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  toggleStatus: (id) => api.patch(`/doctors/${id}/status`, {}),
  getAvailability: (id, date = null) => {
    const query = date ? `?date=${date}` : '';
    return api.get(`/doctors/${id}/availability${query}`);
  },
  updateAvailability: (id, availabilities) => api.put(`/doctors/${id}/availability`, availabilities),
};

// Appointments API
export const appointmentsApi = {
  getAll: (filters = {}) => {
    const query = new URLSearchParams();
    if (filters.status) query.append('status', filters.status);
    if (filters.date) query.append('date', filters.date);
    if (filters.doctorId) query.append('doctorId', filters.doctorId);
    const qs = query.toString();
    return api.get(`/appointments${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => api.get(`/appointments/${id}`),
  book: (data) => api.post('/appointments', data),
  updateStatus: (id, statusData) => api.put(`/appointments/${id}`, statusData),
  cancel: (id, reason) => api.post(`/appointments/${id}/cancel`, { reason }),
};

// Dashboard API
export const dashboardApi = {
  getPatient: () => api.get('/dashboard/patient'),
  getDoctor: () => api.get('/dashboard/doctor'),
  getAdmin: () => api.get('/dashboard/admin'),
};
