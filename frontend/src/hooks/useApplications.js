import { useState, useEffect, useCallback } from 'react';
import { applicationService } from '../services/applicationService';

export const useApplications = (userId, status = null) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadApplications = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const data = await applicationService.getUserApplications(userId, status);
      setApplications(data.applications || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Load applications error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, status]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const createApplication = async (applicationData) => {
    try {
      setLoading(true);
      const data = await applicationService.createApplication(applicationData);
      setApplications(prev => [data.application, ...prev]);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateApplication = async (id, updates) => {
    try {
      setLoading(true);
      const data = await applicationService.updateApplication(id, updates);
      setApplications(prev => 
        prev.map(app => app.id === id ? data.application : app)
      );
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteApplication = async (id) => {
    try {
      setLoading(true);
      await applicationService.deleteApplication(id);
      setApplications(prev => prev.filter(app => app.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    applications,
    loading,
    error,
    createApplication,
    updateApplication,
    deleteApplication,
    refreshApplications: loadApplications
  };
};