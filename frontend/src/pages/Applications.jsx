import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { applicationService } from '../services/applicationService';
import { FileText, Plus, DollarSign, Calendar, Loader } from 'lucide-react';

const Applications = () => {
  const { user } = useApp();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, [user]);

  const loadApplications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await applicationService.getUserApplications(user.id);
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Load applications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#fef3c7', color: '#f59e0b' },
      under_review: { bg: '#dbeafe', color: '#3b82f6' },
      approved: { bg: '#d1fae5', color: '#10b981' },
      rejected: { bg: '#fee2e2', color: '#ef4444' },
      documents_pending: { bg: '#fed7aa', color: '#ea580c' }
    };
    return colors[status] || colors.pending;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">My Applications</h1>
          <p className="page-description">View and manage all your loan applications</p>
        </div>
        <Link to="/dashboard/applications/new" className="btn-primary">
          <Plus size={20} />
          New Application
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Loader size={48} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
        </div>
      ) : applications.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {applications.map(app => {
            const statusColor = getStatusColor(app.status);
            return (
              <Link
                key={app.id}
                to={`/dashboard/applications/${app.id}`}
                className="dashboard-card"
                style={{ textDecoration: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText size={24} color="white" />
                  </div>
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: statusColor.bg,
                    color: statusColor.color,
                    textTransform: 'uppercase'
                  }}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1e293b' }}>
                  Application #{app.id}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem', textTransform: 'capitalize' }}>
                  {app.loan_purpose || 'Personal Loan'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                    <DollarSign size={16} />
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>
                      ₹{app.loan_amount?.toLocaleString('en-IN') || 'N/A'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                    <Calendar size={16} />
                    <span style={{ fontSize: '0.875rem' }}>
                      {app.tenure_months || 0} months
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Created: {new Date(app.created_at).toLocaleDateString('en-IN')}
                  </div>
                </div>

                {app.monthly_emi && (
                  <div style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Monthly EMI</span>
                    <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#3b82f6' }}>
                      ₹{app.monthly_emi.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="dashboard-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <FileText size={64} style={{ color: '#cbd5e1', margin: '0 auto 1.5rem' }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1e293b' }}>
            No Applications Yet
          </h3>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            Start your loan journey by creating your first application
          </p>
          <Link to="/dashboard/applications/new" className="btn-primary">
            <Plus size={20} />
            Create Application
          </Link>
        </div>
      )}
    </div>
  );
};

export default Applications;