import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useApplications } from '../hooks/useApplications';
import { 
  FileText, Clock, CheckCircle, XCircle, Plus, 
  TrendingUp, DollarSign, Calendar, ArrowRight,
  MessageSquare, Upload, Calculator, Award
} from 'lucide-react';
import NewApplication from './NewApplication';

const Home = () => {
  const { user } = useApp();
  const { applications, loading } = useApplications(user?.id);

  const recentApplications = applications.slice(0, 3);
  const pendingCount = applications.filter(a => a.status === 'pending' || a.status === 'under_review').length;
  const approvedCount = applications.filter(a => a.status === 'approved').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected').length;
  const totalAmount = applications.reduce((sum, app) => sum + (app.loan_amount || 0), 0);

  const stats = [
    {
      icon: <FileText size={24} />,
      label: 'Total Applications',
      value: applications.length,
      color: 'linear-gradient(135deg, #3b82f6, #1e40af)',
      bgLight: '#eff6ff'
    },
    {
      icon: <Clock size={24} />,
      label: 'Pending Review',
      value: pendingCount,
      color: 'linear-gradient(135deg, #f59e0b, #d97706)',
      bgLight: '#fef3c7'
    },
    {
      icon: <CheckCircle size={24} />,
      label: 'Approved',
      value: approvedCount,
      color: 'linear-gradient(135deg, #10b981, #059669)',
      bgLight: '#d1fae5'
    },
    {
      icon: <DollarSign size={24} />,
      label: 'Total Amount',
      value: `₹${(totalAmount / 100000).toFixed(1)}L`,
      color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      bgLight: '#ede9fe'
    }
  ];

  const quickActions = [
    {
      icon: <Plus size={28} />,
      title: 'New Application',
      description: 'Start a new loan application',
      link: '/applications/new',
      gradient: 'linear-gradient(135deg, #3b82f6, #1e40af)'
    },
    {
      icon: <MessageSquare size={28} />,
      title: 'AI Assistant',
      description: 'Chat with our AI helper',
      link: '/chat',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    },
    {
      icon: <Upload size={28} />,
      title: 'Upload Documents',
      description: 'Submit required documents',
      link: '/documents',
      gradient: 'linear-gradient(135deg, #10b981, #059669)'
    },
    {
      icon: <Calculator size={28} />,
      title: 'EMI Calculator',
      description: 'Calculate your monthly EMI',
      link: '/chat',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
    }
  ];

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pending', color: '#f59e0b', bg: '#fef3c7' },
      under_review: { text: 'Under Review', color: '#3b82f6', bg: '#dbeafe' },
      approved: { text: 'Approved', color: '#10b981', bg: '#d1fae5' },
      rejected: { text: 'Rejected', color: '#ef4444', bg: '#fee2e2' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        background: badge.bg,
        color: badge.color
      }}>
        {badge.text}
      </span>
    );
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Welcome back, {user?.name}! 👋</h1>
            <p className="page-description">
              Here's what's happening with your loan applications today
            </p>
          </div>
          <Link to="/applications/new" className="btn-primary">
            <Plus size={20} />
            New Application
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="card-grid">
        {stats.map((stat, index) => (
          <div key={index} className="dashboard-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div className="card-icon" style={{ background: stat.color }}>
                {stat.icon}
              </div>
              <div style={{
                padding: '0.25rem 0.5rem',
                background: stat.bgLight,
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#1e293b'
              }}>
                <TrendingUp size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                +12%
              </div>
            </div>
            <div className="card-label">{stat.label}</div>
            <div className="card-value">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b' }}>
          Quick Actions
        </h2>
        <div className="card-grid">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="dashboard-card"
              style={{ textDecoration: 'none', cursor: 'pointer' }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                background: action.gradient,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                marginBottom: '1rem'
              }}>
                {action.icon}
              </div>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                marginBottom: '0.5rem',
                color: '#1e293b'
              }}>
                {action.title}
              </h3>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#64748b',
                marginBottom: '1rem'
              }}>
                {action.description}
              </p>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: '#3b82f6',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>
                Get Started
                <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="dashboard-card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
            Recent Applications
          </h2>
          <Link 
            to="/applications" 
            style={{ 
              color: '#3b82f6', 
              fontWeight: '600', 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e2e8f0',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
        ) : recentApplications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentApplications.map(app => (
              <Link
                key={app.id}
                to={`/applications/${app.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 style={{ 
                      fontWeight: '600', 
                      marginBottom: '0.25rem',
                      color: '#1e293b',
                      fontSize: '1rem'
                    }}>
                      Application #{app.id}
                    </h4>
                    <p style={{ 
                      fontSize: '0.875rem', 
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <DollarSign size={14} />
                      ₹{app.loan_amount.toLocaleString('en-IN')}
                      <span style={{ margin: '0 0.25rem' }}>•</span>
                      <Calendar size={14} />
                      {new Date(app.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {getStatusBadge(app.status)}
                  <ArrowRight size={20} style={{ color: '#94a3b8' }} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            background: '#f8fafc',
            borderRadius: '12px'
          }}>
            <FileText size={64} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>
              No Applications Yet
            </h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              Start your loan journey by creating your first application
            </p>
            <Link to="/applications/new" className="btn-primary">
              <Plus size={20} />
              Create Application
            </Link>
          </div>
        )}
      </div>

      {/* Trust Badges */}
      <div style={{ 
        marginTop: '2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
      }}>
        {[
          { icon: <Award size={32} />, title: 'RBI Registered', desc: 'Certified NBFC' },
          { icon: <CheckCircle size={32} />, title: '95% Approval', desc: 'High success rate' },
          { icon: <Clock size={32} />, title: '24hr Processing', desc: 'Quick decisions' }
        ].map((badge, index) => (
          <div key={index} className="dashboard-card" style={{ textAlign: 'center' }}>
            <div style={{ 
              color: '#3b82f6', 
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'center'
            }}>
              {badge.icon}
            </div>
            <h4 style={{ fontWeight: '600', marginBottom: '0.25rem', color: '#1e293b' }}>
              {badge.title}
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              {badge.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;