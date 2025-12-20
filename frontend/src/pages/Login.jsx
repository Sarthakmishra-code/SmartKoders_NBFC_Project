import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import { Loader, Lock, Mail, Eye, EyeOff, ShieldCheck, Zap, CheckCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login({ email, password });
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Info */}
        <div className="login-left">
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              fontSize: '2rem'
            }}>
              💰
            </div>
            <h2>Welcome to SmartKoder Loans</h2>
            <p>Your trusted partner for digital lending solutions</p>
          </div>

          <ul className="login-features">
            <li>
              <Zap size={20} />
              <span>Instant loan approvals</span>
            </li>
            <li>
              <ShieldCheck size={20} />
              <span>100% secure & encrypted</span>
            </li>
            <li>
              <CheckCircle size={20} />
              <span>Minimal documentation</span>
            </li>
            <li>
              <CheckCircle size={20} />
              <span>Competitive interest rates</span>
            </li>
          </ul>

          <div style={{ 
            marginTop: '3rem', 
            padding: '1.5rem', 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <h4 style={{ marginBottom: '0.5rem', fontWeight: '600' }}>Need Help?</h4>
            <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              Contact our support team at<br />
              <strong>1800-123-4567</strong> or<br />
              <strong>support@smartkoder.com</strong>
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-right">
          <div className="login-card">
            <h2 className="login-title">Login to Your Account</h2>
            <p className="login-subtitle">Enter your credentials to access your dashboard</p>

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
                  <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: '3rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b'
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" />
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Remember me</span>
                </label>
                <a href="#" style={{ fontSize: '0.875rem', color: '#3b82f6', textDecoration: 'none' }}>
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader size={20} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="login-footer">
              Don't have an account?{' '}
              <Link to="/register">Create one now</Link>
            </div>

            <div style={{
              marginTop: '2rem',
              paddingTop: '2rem',
              borderTop: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6 }}>
                By signing in, you agree to our{' '}
                <a href="#" style={{ color: '#3b82f6' }}>Terms of Service</a> and{' '}
                <a href="#" style={{ color: '#3b82f6' }}>Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;