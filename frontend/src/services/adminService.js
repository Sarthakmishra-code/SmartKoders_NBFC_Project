// ============= frontend/src/services/adminService.js =============
import api from './api';

export const adminService = {
  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  getAllApplications: async (status = null, page = 1, limit = 20) => {
    const params = { page, limit };
    if (status) params.status = status;
    
    const response = await api.get('/admin/applications', { params });
    return response.data;
  },

  getAgentLogs: async (applicationId = null, agentName = null, limit = 50) => {
    const params = { limit };
    if (applicationId) params.applicationId = applicationId;
    if (agentName) params.agentName = agentName;
    
    const response = await api.get('/admin/agent-logs', { params });
    return response.data;
  },

  updateApplicationStatus: async (id, status, notes = null) => {
    const response = await api.patch(`/admin/applications/${id}/status`, {
      status,
      notes
    });
    return response.data;
  }
};