import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para enviar automaticamente o X-Usuario-Id armazenado
api.interceptors.request.use((config) => {
  const usuarioId = localStorage.getItem('usuarioId');
  if (usuarioId) {
    config.headers['X-Usuario-Id'] = usuarioId;
  }
  return config;
});