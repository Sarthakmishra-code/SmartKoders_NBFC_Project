import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationService } from '../services/applicationService';
import { documentService } from '../services/documentService';
import { 
  ArrowLeft, DollarSign, Calendar, TrendingUp, AlertCircle, 
  CheckCircle, Loader, Upload, FileText 
} from 'lucide-react';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadType, setUploadType] = useState('pan');

  useEffect(() => {
    loadApplication();
    loadDocuments();
  }, [id]);

  const loadApplication = async () => {
    try {
      const data = await applicationService.getApplication(id);
      setApplication(data.application);
    } catch (error) {
      console.error('Load application error:', error);
      alert('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const data = await documentService.getApplicationDocuments(id);
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Load documents error:', error);
    }
  };

  const handleEligibilityCheck = async () => {
    setProcessing(true);
    try {
      const result = await applicationService.runEligibilityCheck(id);
      alert(result.message || 'Eligibility check completed');
      await loadApplication();
    } catch (error) {
      alert('Failed to check eligibility');
    } finally {
      setProcessing(false);
    }
  };

  const handleFinalDecision = async () => {
    if (!window.confirm('Request final decision for this application?')) return;

    setProcessing(true);
    try {
      const result = await applicationService.makeFinalDecision(id);
      alert(result.message || 'Decision processed');
      await loadApplication();
    } catch (error) {
      alert('Failed to make decision');
    } finally {
      setProcessing(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    setProcessing(true);
    try {
      await documentService.uploadDocument(uploadFile, id, uploadType);
      alert('Document uploaded successfully!');
      setUploadFile(null);
      await loadDocuments();
    } catch (error) {
      alert('Failed to upload document');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: '#fef3c7', color: '#f59e0b', text: 'Pending' },
      under_review: { bg: '#dbeafe', color: '#3b82f6', text: 'Under Review' },
      approved: { bg: '#d1fae5', color: '#10b981', text: 'Approved' },
      rejected: { bg: '#fee2e2', color: '#ef4444', text: 'Rejected' },
      documents_pending: { bg: '#fed7aa', color: '#ea580c', text: 'Documents Pending' }
    };
    const style = styles[status] || styles.pending;
    return (
      <span style={{
        padding: '0.5rem 1rem',
        borderRadius: '999px',
        fontSize: '0.875rem',
        fontWeight: '600',
        background: style.bg,
        color: style.color
      }}>
        {style.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <Loader size={48} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
      </div>
    );
  }

  if (!loading && application === null) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      Application not found
    </div>
  );
}

  return (
    <div>
      <button
        onClick={() => navigate('/dashboard/applications')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'none',
          border: 'none',
          color: '#64748b',
          fontSize: '0.875rem',
          cursor: 'pointer',
          marginBottom: '1.5rem',
          padding: '0.5rem'
        }}
      >
        <ArrowLeft size={16} />
        Back to Applications
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Main Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Application Info */}
          <div className="dashboard-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  Application #{application.id}
                </h1>
                <p style={{ color: '#64748b' }}>
                  Created: {new Date(application.created_at).toLocaleDateString()}
                </p>
              </div>
              {getStatusBadge(application.status)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Loan Amount</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                  ₹{application.loan_amount?.toLocaleString('en-IN') || 'N/A'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Monthly Income</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                  ₹{application.monthly_income?.toLocaleString('en-IN') || 'N/A'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Tenure</p>
                <p style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>
                  {application.tenure_months || 'N/A'} months
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Purpose</p>
                <p style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', textTransform: 'capitalize' }}>
                  {application.loan_purpose || 'Personal'}
                </p>
              </div>
            </div>
          </div>

          {/* Assessment Details */}
          {application.credit_score && (
            <div className="dashboard-card">
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                Assessment Details
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Credit Score</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                    {application.credit_score}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>DTI Ratio</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>
                    {application.dti_ratio?.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Interest Rate</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>
                    {application.interest_rate}%
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Monthly EMI</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8b5cf6' }}>
                    ₹{application.monthly_emi?.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="dashboard-card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>
              Documents ({documents.length})
            </h2>
            
            {documents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {documents.map(doc => (
                  <div key={doc.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FileText size={20} color="#3b82f6" />
                      <div>
                        <p style={{ fontWeight: '600', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                          {doc.document_type.replace('_', ' ')}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {doc.original_name || 'Document'}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: doc.verification_status === 'verified' ? '#d1fae5' : '#fef3c7',
                      color: doc.verification_status === 'verified' ? '#10b981' : '#f59e0b'
                    }}>
                      {doc.verification_status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                No documents uploaded yet
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Upload Document */}
          <div className="dashboard-card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem' }}>
              Upload Document
            </h3>
            <form onSubmit={handleFileUpload}>
              <div className="form-group">
                <label className="form-label">Document Type</label>
                <select
                  className="form-input"
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  style={{ marginBottom: '1rem' }}
                >
                  <option value="pan">PAN Card</option>
                  <option value="salary_slip">Salary Slip</option>
                  <option value="bank_statement">Bank Statement</option>
                  <option value="identity_proof">Identity Proof</option>
                </select>
              </div>

              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files[0])}
                accept=".jpg,.jpeg,.png,.pdf"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px dashed #e2e8f0',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  cursor: 'pointer'
                }}
              />

              <button
                type="submit"
                disabled={!uploadFile || processing}
                className="btn-submit"
                style={{ width: '100%' }}
              >
                {processing ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={16} />}
                <span style={{ marginLeft: '0.5rem' }}>Upload</span>
              </button>
            </form>
          </div>

          {/* Actions */}
          <div className="dashboard-card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem' }}>
              Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={handleEligibilityCheck}
                disabled={processing}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {processing ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <TrendingUp size={16} />}
                <span style={{ marginLeft: '0.5rem' }}>Check Eligibility</span>
              </button>

              <button
                onClick={handleFinalDecision}
                disabled={processing || documents.length < 1}
                className="btn-primary"
                style={{ 
                  width: '100%', 
                  justifyContent: 'center',
                  opacity: documents.length < 1 ? 0.5 : 1
                }}
              >
                <CheckCircle size={16} />
                <span style={{ marginLeft: '0.5rem' }}>Request Decision</span>
              </button>
            </div>
            {documents.length < 1 && (
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.75rem', textAlign: 'center' }}>
                Upload at least 1 document to proceed
              </p>
            )}
          </div>

          {/* Status Info */}
          <div className="dashboard-card" style={{
            background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
            color: 'white'
          }}>
            <AlertCircle size={24} style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              Application Status
            </h3>
            <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              {application.status === 'approved' && 'Your loan has been approved!'}
              {application.status === 'rejected' && 'Application was not approved.'}
              {application.status === 'pending' && 'Application is being processed.'}
              {application.status === 'under_review' && 'Documents are being verified.'}
              {application.status === 'documents_pending' && 'Please upload required documents.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;