import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (username, password) => {
    const form = new URLSearchParams();
    form.append('username', username);
    form.append('password', password);
    return API.post('/auth/login', form);
  },
  me: () => API.get('/auth/me'),
};

export const productAPI = {
  list: (category) => API.get('/products/', { params: category ? { category } : {} }),
  get: (id) => API.get(`/products/${id}`),
  create: (data) => API.post('/products/', data),
  update: (id, data) => API.put(`/products/${id}`, data),
  delete: (id) => API.delete(`/products/${id}`),
};

export const orderAPI = {
  create: (items) => API.post('/orders/', { items }),
  list: () => API.get('/orders/'),
  get: (id) => API.get(`/orders/${id}`),
  updateStatus: (id, status) => API.put(`/orders/${id}/status`, null, { params: { status } }),
};

export const adminAPI = {
  users: () => API.get('/admin/users'),
  auditLog: () => API.get('/admin/audit-log'),
};

export default API;
