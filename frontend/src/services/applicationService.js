import api from './api';

export const applicationService = {
  createApplication: async (applicationData) => {
    const response = await api.post('/applications', applicationData);
    return response.data;
  },

  getApplication: async (id) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  getUserApplications: async (userId, status = null) => {
    const params = status ? { status } : {};
    const response = await api.get(`/applications/user/${userId}`, { params });
    return response.data;
  },

  updateApplication: async (id, updates) => {
    const response = await api.patch(`/applications/${id}`, updates);
    return response.data;
  },

  deleteApplication: async (id) => {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  },

  runEligibilityCheck: async (id) => {
    const response = await api.post(`/applications/${id}/eligibility`);
    return response.data;
  },

  runUnderwriting: async (id) => {
    const response = await api.post(`/applications/${id}/underwriting`);
    return response.data;
  },

  makeFinalDecision: async (id) => {
    const response = await api.post(`/applications/${id}/decision`);
    return response.data;
  },

  getOfferLetter: async (id) => {
    const response = await api.get(`/applications/${id}/offer-letter`);
    return response.data;
  }
};