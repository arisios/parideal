import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Injeta token JWT se disponível
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jr_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Trata erro 401 global
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('jr_token');
      localStorage.removeItem('jr_user');
    }
    return Promise.reject(err);
  }
);

export default api;
