import axios from 'axios';
//import.meta.env - vite

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('app-token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    const tokenUsuario = usuario?.token;

    if (token || tokenUsuario) {
      config.headers.Authorization = `Bearer ${token || tokenUsuario}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
