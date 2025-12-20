import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Zap, Award, TrendingUp, Users, 
  FileText, CheckCircle, ArrowRight, ChevronLeft, ChevronRight 
} from 'lucide-react';

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200',
      title: 'Digital Loan Solutions',
      description: 'Fast, Secure, and Transparent Loan Processing'
    },
    {
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200',
      title: 'AI-Powered Decisions',
      description: 'Get instant loan approvals with our smart technology'
    },
    {
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200',
      title: 'Your Financial Partner',
      description: 'Empowering dreams through accessible credit'
    }
  ];

  const features = [
    {
      icon: <Zap size={32} />,
      title: 'Instant Approval',
      description: 'Get loan decisions in under 24 hours with our AI-powered system'
    },
    {
      icon: <ShieldCheck size={32} />,
      title: '100% Secure',
      description: 'Bank-level encryption ensures your data is always protected'
    },
    {
      icon: <TrendingUp size={32} />,
      title: 'Best Interest Rates',
      description: 'Competitive rates starting from 10.5% per annum'
    },
    {
      icon: <FileText size={32} />,
      title: 'Minimal Documentation',
      description: 'Simple process with just basic documents required'
    },
    {
      icon: <Users size={32} />,
      title: '24/7 Support',
      description: 'Our team is always available to help you'
    },
    {
      icon: <Award size={32} />,
      title: 'Trusted by Thousands',
      description: 'Join 50,000+ satisfied customers across India'
    }
  ];

  const stats = [
    { value: '₹500Cr+', label: 'Loans Disbursed' },
    { value: '50,000+', label: 'Happy Customers' },
    { value: '95%', label: 'Approval Rate' },
    { value: '24hrs', label: 'Average TAT' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="main-navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <div className="logo-icon">💰</div>
            <span>SmartKoder Loans</span>
          </Link>
          <ul className="navbar-menu">
            <li><a href="#features" className="navbar-link">Features</a></li>
            <li><a href="#about" className="navbar-link">About Us</a></li>
            <li><a href="#contact" className="navbar-link">Contact</a></li>
            <li><Link to="/login" className="btn-login">Login / Register</Link></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Empowering Your Financial Journey
          </h1>
          <p className="hero-subtitle">
            Quick, transparent, and hassle-free loans powered by AI technology
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-primary">
              Apply for Loan <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="btn-secondary">
              Check Eligibility
            </Link>
          </div>
        </div>
      </section>

      {/* Carousel Section */}
      <section className="carousel-section">
        <div className="carousel-container">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
            >
              <img src={slide.image} alt={slide.title} className="carousel-image" />
              <div className="carousel-caption">
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {slide.title}
                </h3>
                <p style={{ fontSize: '1.125rem' }}>{slide.description}</p>
              </div>
            </div>
          ))}
          
          <div className="carousel-controls">
            <button onClick={prevSlide} className="carousel-btn">
              <ChevronLeft size={24} />
            </button>
            <button onClick={nextSlide} className="carousel-btn">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
        
        <div className="carousel-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <h2 className="section-title">Why Choose SmartKoder?</h2>
        <p className="section-subtitle">
          We make loan processing simple, fast, and transparent
        </p>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="features-section">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Get your loan in 3 simple steps</p>
        <div className="features-grid" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="feature-card">
            <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <span style={{ fontSize: '2rem', color: 'white' }}>1</span>
            </div>
            <h3 className="feature-title">Apply Online</h3>
            <p className="feature-description">
              Fill simple application form and upload required documents
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <span style={{ fontSize: '2rem', color: 'white' }}>2</span>
            </div>
            <h3 className="feature-title">Get Instant Decision</h3>
            <p className="feature-description">
              Our AI analyzes your profile and provides instant approval
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
              <span style={{ fontSize: '2rem', color: 'white' }}>3</span>
            </div>
            <h3 className="feature-title">Receive Funds</h3>
            <p className="feature-description">
              Money transferred to your account within 24 hours
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/register" className="btn-primary">
            Start Your Application <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        background: '#1e293b', 
        color: 'white', 
        padding: '3rem 2rem', 
        textAlign: 'center' 
      }}>
        <div className="container">
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>SmartKoder Loans</h3>
            <p style={{ color: '#94a3b8' }}>Empowering financial inclusion through technology</p>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            <div>
              <h4 style={{ marginBottom: '1rem', fontWeight: '600' }}>Quick Links</h4>
              <ul style={{ listStyle: 'none', color: '#94a3b8' }}>
                <li style={{ marginBottom: '0.5rem' }}><a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }}>Features</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="#about" style={{ color: '#94a3b8', textDecoration: 'none' }}>About Us</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="#contact" style={{ color: '#94a3b8', textDecoration: 'none' }}>Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: '1rem', fontWeight: '600' }}>Legal</h4>
              <ul style={{ listStyle: 'none', color: '#94a3b8' }}>
                <li style={{ marginBottom: '0.5rem' }}>Privacy Policy</li>
                <li style={{ marginBottom: '0.5rem' }}>Terms & Conditions</li>
                <li style={{ marginBottom: '0.5rem' }}>Disclaimer</li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: '1rem', fontWeight: '600' }}>Contact</h4>
              <ul style={{ listStyle: 'none', color: '#94a3b8' }}>
                <li style={{ marginBottom: '0.5rem' }}>support@smartkoder.com</li>
                <li style={{ marginBottom: '0.5rem' }}>1800-123-4567</li>
                <li style={{ marginBottom: '0.5rem' }}>Mon-Sat: 9AM-6PM</li>
              </ul>
            </div>
          </div>
          <div style={{ paddingTop: '2rem', borderTop: '1px solid #334155', color: '#94a3b8' }}>
            <p>© 2024 SmartKoder Loans. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;