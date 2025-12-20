import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';

export const useAdmin = () => {
  const [analytics, setAnalytics] = useState(null);
  const [applications, setApplications] = useState([]);
  const [agentLogs, setAgentLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAnalytics();
      setAnalytics(data.analytics);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Load analytics error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadApplications = useCallback(async (status = null, page = 1) => {
    try {
      setLoading(true);
      const data = await adminService.getAllApplications(status, page);
      setApplications(data.applications || []);
      setError(null);
      return data.pagination;
    } catch (err) {
      setError(err.message);
      console.error('Load applications error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAgentLogs = useCallback(async (applicationId = null) => {
    try {
      setLoading(true);
      const data = await adminService.getAgentLogs(applicationId);
      setAgentLogs(data.logs || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Load agent logs error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = async (applicationId, status, notes = null) => {
    try {
      setLoading(true);
      const data = await adminService.updateApplicationStatus(applicationId, status, notes);
      
      // Update in list
      setApplications(prev =>
        prev.map(app => 
          app.id === applicationId ? data.application : app
        )
      );

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    analytics,
    applications,
    agentLogs,
    loading,
    error,
    loadAnalytics,
    loadApplications,
    loadAgentLogs,
    updateStatus
  };
};