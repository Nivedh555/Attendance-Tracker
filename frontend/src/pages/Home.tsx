import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  useEffect(() => {
    // Parallax scroll effect
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallax = document.querySelector('.parallax-bg') as HTMLElement;
      if (parallax) {
        parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="modern-home">
      {/* Animated Background */}
      <div className="parallax-bg">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="modern-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <div className="logo-icon">
              <i className="fas fa-location-dot"></i>
            </div>
            <span className="logo-text">AttendX</span>
          </div>
          <div className="nav-links">
            <a href="#home" className="nav-link">Home</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#about" className="nav-link">About</a>
            <Link to="/login" className="nav-btn login">Login</Link>
            <Link to="/register" className="nav-btn register">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-modern">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>🚀 Next-Gen Attendance System</span>
            </div>
            <h1 className="hero-title">
              Track Attendance with
              <span className="gradient-text"> AI Precision</span>
            </h1>
            <p className="hero-description">
              Experience the future of workforce management with our intelligent geofencing technology. 
              Real-time tracking, automated reports, and seamless integration.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn-primary">
                <span>Start Free Trial</span>
                <i className="fas fa-arrow-right"></i>
              </Link>
              
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Active Users</span>
              </div>
              <div className="stat">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
              <div className="stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Support</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="phone-mockup">
              <div className="phone-screen">
                <div className="app-interface">
                  <div className="status-bar">
                    <span>9:41</span>
                    <div className="signal-icons">
                      <i className="fas fa-signal"></i>
                      <i className="fas fa-wifi"></i>
                      <i className="fas fa-battery-full"></i>
                    </div>
                  </div>
                  <div className="app-content">
                    <div className="location-indicator">
                      <div className="pulse-dot"></div>
                      <span>You're at Office</span>
                    </div>
                    <div className="check-in-button">
                      <div className="check-in-circle">
                        <i className="fas fa-fingerprint"></i>
                      </div>
                      <span>Tap to Check In</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-modern">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-subtitle">Everything you need for modern attendance management</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <h3>Geo-Fencing</h3>
              <p>Set virtual boundaries and ensure employees check in from designated locations</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-chart-pie"></i>
              </div>
              <h3>Analytics Dashboard</h3>
              <p>Real-time insights and comprehensive reports for better decision making</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <h3>Mobile First</h3>
              <p>Native mobile apps for iOS and Android with offline capabilities</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Secure & Private</h3>
              <p>Enterprise-grade security with end-to-end encryption</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-modern">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to revolutionize your attendance system?</h2>
            <p>Join thousands of companies already using AttendX</p>
            <Link to="/register" className="cta-button">
              Get Started Today
              <i className="fas fa-rocket"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="modern-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <div className="logo-icon">
                <i className="fas fa-location-dot"></i>
              </div>
              <span>AttendX</span>
            </div>
            <p>&copy; 2024 AttendX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
