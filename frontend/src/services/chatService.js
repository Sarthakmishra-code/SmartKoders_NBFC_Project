import api from './api';

export const chatService = {
  sendMessage: async (message, userId, applicationId = null) => {
    const response = await api.post('/chat/message', {
      message,
      userId,
      applicationId
    });
    return response.data;
  },

  getChatHistory: async (userId, applicationId = null, limit = 50) => {
    const params = { limit };
    if (applicationId) params.applicationId = applicationId;
    
    const response = await api.get(`/chat/history/${userId}`, { params });
    return response.data;
  },

  resetConversation: async (userId) => {
    const response = await api.post('/chat/reset', { userId });
    return response.data;
  }
};