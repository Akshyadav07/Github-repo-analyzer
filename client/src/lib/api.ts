import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthProbe = url.includes('/auth/me') || url.includes('/auth/logout');
    const isPublicPage = window.location.pathname === '/login' || window.location.pathname === '/';

    // Only redirect if a protected resource failed with 401 and user isn't already on a public page
    if (status === 401 && !isAuthProbe && !isPublicPage) {
      window.location.href = '/login?error=session_expired';
    }

    return Promise.reject(error);
  }
);

export default api;
