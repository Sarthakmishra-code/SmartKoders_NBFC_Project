import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../services/chatService';

export const useChat = (userId, applicationId = null) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const data = await chatService.getChatHistory(userId, applicationId);
      setMessages(data.conversations || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Load history error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, applicationId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const sendMessage = async (message) => {
    try {
      setLoading(true);
      setError(null);

      // Add user message immediately
      const userMessage = {
        message,
        sender: 'user',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);

      // Send to backend
      const response = await chatService.sendMessage(message, userId, applicationId);

      // Add agent response
      if (response.success && response.response) {
        const agentMessage = {
          message: response.response.message,
          sender: 'agent',
          agent_type: response.agent,
          intent: response.intent,
          created_at: new Date().toISOString(),
          metadata: JSON.stringify(response.response)
        };
        setMessages(prev => [...prev, agentMessage]);
      }

      return response;
    } catch (err) {
      setError(err.message);
      console.error('Send message error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetChat = async () => {
    try {
      await chatService.resetConversation(userId);
      setMessages([]);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Reset chat error:', err);
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    resetChat,
    refreshHistory: loadHistory
  };
};
