import api from './api';

export const authService = {
  login: async (credentials) => {
    return api.post('/auth/login', credentials);
  },

  register: async (userData) => {
    return api.post('/auth/register', userData);
  },

  getMe: async () => {
    return api.get('/auth/me');
  },

  updateProfile: async (profileData) => {
    return api.put('/auth/profile', profileData);
  },

  getUsers: async (search = '') => {
    return api.get('/users', { params: search ? { q: search } : {} });
  },

  updateUserRole: async (userId, role) => {
    return api.patch(`/users/${userId}/role`, { role });
  },

  deleteUser: async (userId) => {
    return api.delete(`/users/${userId}`);
  },
};

export default authService;
