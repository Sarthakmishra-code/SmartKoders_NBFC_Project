// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import { Loader, Lock, Mail, User as UserIcon, Phone } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useApp();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.register(formData);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <h2>Join SmartKoder Today</h2>
          <p>Start your loan application journey with us</p>
          <ul className="login-features">
            <li>Quick registration process</li>
            <li>Instant loan eligibility check</li>
            <li>Secure and encrypted</li>
            <li>24/7 customer support</li>
          </ul>
        </div>

        <div className="login-right">
          <div className="login-card">
            <h2 className="login-title">Create Account</h2>
            <p className="login-subtitle">Fill in your details to get started</p>

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

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <UserIcon size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  className="form-input"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  className="form-input"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>

              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader size={20} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="login-footer">
              Already have an account?{' '}
              <Link to="/login">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;