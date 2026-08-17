import axios from 'axios';

const api: any = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Extract data or format error message
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'Có lỗi xảy ra, vui lòng thử lại.';

    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (Array.isArray(error.response?.data?.error)) {
      message = error.response.data.error.map((e) => e.message || e).join('; ');
    } else if (typeof error.response?.data?.error === 'string') {
      message = error.response.data.error;
    } else if (error.message) {
      message = error.message;
    }

    if (error.response?.status === 401) {
      // If token expired or unauthorized, clean local storage
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login?expired=true';
        }
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
