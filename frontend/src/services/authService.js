import api from './api';

export const authService = {
  register: async (data) => {
    const res = await api.post('/api/auth/register', data);
    return res.data;
  },

  login: async (data) => {
    const res = await api.post('/api/auth/login', data);
    return res.data;
  },

  forgotPassword: async (data) => {
    const res = await api.post('/api/auth/forgot-password', data);
    return res.data;
  },

  resetPassword: async (data) => {
    const res = await api.post('/api/auth/reset-password', data);
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get('/api/users/profile');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.put('/api/users/profile', data);
    return res.data;
  },

  changePassword: async (data) => {
    const res = await api.put('/api/users/change-password', data);
    return res.data;
  },
};
