import api from './api';

export const categoryService = {
  getAllCategories: async () => {
    const res = await api.get('/api/categories');
    return res.data;
  },

  getCategoryById: async (id) => {
    const res = await api.get(`/api/categories/${id}`);
    return res.data;
  },

  getCategoryDocuments: async (id) => {
    const res = await api.get(`/api/categories/${id}/documents`);
    return res.data;
  },
};
