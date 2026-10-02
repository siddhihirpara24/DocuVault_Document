import api from './api';

export const documentService = {
  getUserDocuments: async () => {
    const res = await api.get('/api/documents');
    return res.data;
  },

  uploadDocument: async (formData) => {
    const res = await api.post('/api/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getDocumentById: async (id) => {
    const res = await api.get(`/api/documents/${id}`);
    return res.data;
  },

  updateDocument: async (id, formData) => {
    const res = await api.put(`/api/documents/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  deleteDocument: async (id) => {
    const res = await api.delete(`/api/documents/${id}`);
    return res.data;
  },

  downloadDocument: async (id, filename) => {
    const res = await api.get(`/api/documents/${id}/download`, {
      responseType: 'blob',
    });
    // Create blob link to trigger download
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `document-${id}`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  getPreviewUrl: (id) => {
    const token = localStorage.getItem('token');
    return `${api.defaults.baseURL}/api/documents/${id}/preview?token=${token}`;
  },

  previewDocumentBlob: async (id) => {
    const res = await api.get(`/api/documents/${id}/preview`, {
      responseType: 'blob',
    });
    return window.URL.createObjectURL(new Blob([res.data], { type: res.headers['content-type'] }));
  },

  searchDocuments: async (params) => {
    const res = await api.get('/api/documents/search', { params });
    return res.data;
  },

  getUserDashboard: async () => {
    const res = await api.get('/api/user/dashboard');
    return res.data;
  },
};
