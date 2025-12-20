import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { applicationService } from '../services/applicationService';
import { Loader, DollarSign, Calendar, User, Briefcase, Building } from 'lucide-react';

const NewApplication = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    loanAmount: '',
    loanPurpose: 'personal',
    tenureMonths: '36',
    monthlyIncome: '',
    existingEmi: '0',
    employmentType: 'salaried',
    companyName: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const applicationData = {
        userId: user.id,
        loanAmount: parseFloat(formData.loanAmount),
        loanPurpose: formData.loanPurpose,
        tenureMonths: parseInt(formData.tenureMonths),
        monthlyIncome: parseFloat(formData.monthlyIncome),
        existingEmi: parseFloat(formData.existingEmi),
        employmentType: formData.employmentType,
        companyName: formData.companyName
      };

      const result = await applicationService.createApplication(applicationData);
      
      if (result.success) {
        alert('Application created successfully!');
        navigate(`/dashboard/applications/${result.application.id}`);
      }
    } catch (err) {
      console.error('Create application error:', err);
      setError(err.response?.data?.message || 'Failed to create application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">New Loan Application</h1>
        <p className="page-description">Fill in your details to apply for a loan</p>
      </div>

      <form onSubmit={handleSubmit} className="dashboard-card">
        {error && (
          <div style={{
            padding: '1rem',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">
              <DollarSign size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Loan Amount (₹) *
            </label>
            <input
              name="loanAmount"
              type="number"
              className="form-input"
              placeholder="500000"
              value={formData.loanAmount}
              onChange={handleChange}
              required
              min="50000"
              max="5000000"
            />
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              Min: ₹50,000 | Max: ₹50,00,000
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Briefcase size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Loan Purpose *
            </label>
            <select
              name="loanPurpose"
              className="form-input"
              value={formData.loanPurpose}
              onChange={handleChange}
            >
              <option value="personal">Personal</option>
              <option value="home">Home Renovation</option>
              <option value="education">Education</option>
              <option value="medical">Medical</option>
              <option value="business">Business</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Loan Tenure *
            </label>
            <select
              name="tenureMonths"
              className="form-input"
              value={formData.tenureMonths}
              onChange={handleChange}
            >
              <option value="12">12 months</option>
              <option value="24">24 months</option>
              <option value="36">36 months</option>
              <option value="48">48 months</option>
              <option value="60">60 months</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Monthly Income (₹) *
            </label>
            <input
              name="monthlyIncome"
              type="number"
              className="form-input"
              placeholder="50000"
              value={formData.monthlyIncome}
              onChange={handleChange}
              required
              min="25000"
            />
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              Minimum: ₹25,000
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">
              Existing EMI (₹)
            </label>
            <input
              name="existingEmi"
              type="number"
              className="form-input"
              placeholder="0"
              value={formData.existingEmi}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Briefcase size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Employment Type *
            </label>
            <select
              name="employmentType"
              className="form-input"
              value={formData.employmentType}
              onChange={handleChange}
            >
              <option value="salaried">Salaried</option>
              <option value="self_employed">Self-employed</option>
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">
              <Building size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Company/Business Name
            </label>
            <input
              name="companyName"
              type="text"
              className="form-input"
              placeholder="Your company or business name"
              value={formData.companyName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            type="button"
            onClick={() => navigate('/dashboard/applications')}
            className="btn-secondary"
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-submit"
            style={{ flex: 1 }}
          >
            {loading ? (
              <>
                <Loader size={20} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
                Creating...
              </>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewApplication;