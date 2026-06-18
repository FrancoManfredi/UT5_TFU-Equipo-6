import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// Adjuntar token en cada request si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tr_token');
  if (token) config.headers['X-Cliente-Id'] = token;
  return config;
});

export default api;
