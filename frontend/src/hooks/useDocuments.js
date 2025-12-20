import { useState, useEffect, useCallback } from 'react';
import { documentService } from '../services/documentService';

export const useDocuments = (applicationId) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const loadDocuments = useCallback(async () => {
    if (!applicationId) return;

    try {
      setLoading(true);
      const data = await documentService.getApplicationDocuments(applicationId);
      setDocuments(data.documents || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Load documents error:', err);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const uploadDocument = async (file, documentType) => {
    try {
      setLoading(true);
      setUploadProgress(0);

      const data = await documentService.uploadDocument(
        file,
        applicationId,
        documentType
      );

      setDocuments(prev => [...prev, data.document]);
      setUploadProgress(100);
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const verifyDocument = async (documentId, additionalData = {}) => {
    try {
      setLoading(true);
      const data = await documentService.verifyDocument(documentId, additionalData);
      
      // Update document in list
      setDocuments(prev =>
        prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, verification_status: data.valid ? 'verified' : 'rejected' }
            : doc
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

  const deleteDocument = async (documentId) => {
    try {
      setLoading(true);
      await documentService.deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDocumentStats = () => {
    const total = documents.length;
    const verified = documents.filter(d => d.verification_status === 'verified').length;
    const pending = documents.filter(d => d.verification_status === 'pending').length;
    const rejected = documents.filter(d => d.verification_status === 'rejected').length;

    return { total, verified, pending, rejected };
  };

  return {
    documents,
    loading,
    error,
    uploadProgress,
    uploadDocument,
    verifyDocument,
    deleteDocument,
    refreshDocuments: loadDocuments,
    documentStats: getDocumentStats()
  };
};