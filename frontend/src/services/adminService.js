import api from './api';

export const adminService = {
  getDashboard: async () => {
    const res = await api.get('/api/admin/dashboard');
    return res.data;
  },

  getAllUsers: async () => {
    const res = await api.get('/api/admin/users');
    return res.data;
  },

  getUserById: async (id) => {
    const res = await api.get(`/api/admin/users/${id}`);
    return res.data;
  },

  activateUser: async (id) => {
    const res = await api.put(`/api/admin/users/${id}/activate`);
    return res.data;
  },

  deactivateUser: async (id) => {
    const res = await api.put(`/api/admin/users/${id}/deactivate`);
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await api.delete(`/api/admin/users/${id}`);
    return res.data;
  },

  getAllDocuments: async (params) => {
    const res = await api.get('/api/admin/documents', { params });
    return res.data;
  },

  getDocumentById: async (id) => {
    const res = await api.get(`/api/admin/documents/${id}`);
    return res.data;
  },

  downloadDocument: async (id, filename) => {
    const res = await api.get(`/api/admin/documents/${id}/download`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `admin-doc-${id}`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  deleteDocument: async (id) => {
    const res = await api.delete(`/api/admin/documents/${id}`);
    return res.data;
  },

  getCategories: async () => {
    const res = await api.get('/api/admin/categories');
    return res.data;
  },

  createCategory: async (data) => {
    const res = await api.post('/api/admin/categories', data);
    return res.data;
  },

  updateCategory: async (id, data) => {
    const res = await api.put(`/api/admin/categories/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id) => {
    const res = await api.delete(`/api/admin/categories/${id}`);
    return res.data;
  },

  getReports: async () => {
    const res = await api.get('/api/admin/reports');
    return res.data;
  },
};
