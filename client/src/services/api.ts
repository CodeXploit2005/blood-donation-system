import axios from 'axios';

const api: any = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  // Allow a sleeping backend to start, but never leave requests pending forever.
  timeout: 90_000,
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

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      message = 'Máy chủ phản hồi quá lâu. Vui lòng thử lại sau ít phút.';
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại sau ít phút.';
    } else if (error.response?.data?.message) {
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

    const formattedError = Object.assign(new Error(message), {
      status: error.response?.status,
      fieldErrors: Array.isArray(error.response?.data?.error) ? error.response.data.error : [],
    });
    return Promise.reject(formattedError);
  }
);

export default api;
