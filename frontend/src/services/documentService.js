import api from './api';
export const documentService = {
  uploadDocument: async (file, applicationId, documentType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('applicationId', applicationId);
    formData.append('documentType', documentType);

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getDocument: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  getApplicationDocuments: async (applicationId) => {
    const response = await api.get(`/documents/application/${applicationId}`);
    return response.data;
  },

  verifyDocument: async (id, additionalData = {}) => {
    const response = await api.post(`/documents/verify/${id}`, additionalData);
    return response.data;
  },

  deleteDocument: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  }
};

