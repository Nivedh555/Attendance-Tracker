import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('employee');

  const { login, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Floating animation for background shapes
    const elements = document.querySelectorAll('.bg-elements div');
    const intervals: NodeJS.Timeout[] = [];

    elements.forEach(el => {
      (el as HTMLElement).style.transition = 'transform 8s ease-in-out';
      const interval = setInterval(() => {
        (el as HTMLElement).style.transform = `translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px)`;
      }, 8000);
      intervals.push(interval);
    });

    return () => intervals.forEach(interval => clearInterval(interval));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate inputs
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      // Login with email and password
      await login(email, password);
      
      // Small delay to ensure user context is updated
      setTimeout(() => {
        // Get the user data from localStorage as fallback
        const userData = localStorage.getItem('user');
        if (userData) {
          const loggedInUser = JSON.parse(userData);
          
          // Validate if selected role matches user's actual role
          if (loggedInUser.role !== selectedRole) {
            // Role mismatch - logout and show error
            logout();
            setError(`Invalid credentials. This account is registered as ${loggedInUser.role === 'admin' ? 'Administrator' : 'Employee'}. Please select the correct role and try again.`);
            setLoading(false);
            return;
          }
          
          // Role matches - navigate to appropriate dashboard
          if (selectedRole === 'admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/dashboard');
          }
        } else {
          setError('Login failed. User data not found.');
          setLoading(false);
        }
      }, 100);
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    setError(`${provider} login is not implemented yet.`);
  };

  const handleRoleSelect = (role: 'employee' | 'admin') => {
    setSelectedRole(role);
    // Clear any existing errors when role changes
    if (error) setError('');
  };

  return (
    <div className="login-page">
      {/* Animated background blobs */}
      <div className="bg-elements">
        <div style={{ width: '300px', height: '300px', top: '-100px', left: '-100px' }}></div>
        <div style={{ width: '200px', height: '200px', bottom: '-50px', right: '-50px' }}></div>
        <div style={{ width: '150px', height: '150px', top: '50%', left: '70%' }}></div>
      </div>

      <div className="container">
        {/* Left Info Panel */}
        <div className="left-panel">
          <div className="logo">GeoAttend</div>
          <ul className="features">
            <li><i className="fas fa-map-marker-alt"></i> GPS-based attendance tracking</li>
            <li><i className="fas fa-clock"></i> Real-time monitoring</li>
            <li><i className="fas fa-chart-line"></i> Analytics & reporting</li>
            <li><i className="fas fa-shield-alt"></i> Secure & tamper-proof system</li>
          </ul>
          <Link to="/" className="back-link">
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>
        </div>

        {/* Right Login Panel */}
        <div className="right-panel">
          <div className="welcome">
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          {/* Role Selector */}
          <div className="role-selector">
            <div 
              className={`role-option ${selectedRole === 'employee' ? 'selected' : ''}`}
              onClick={() => handleRoleSelect('employee')}
            >
              <div className="role-icon">👤</div>
              <span>Employee</span>
            </div>
            <div 
              className={`role-option ${selectedRole === 'admin' ? 'selected' : ''}`}
              onClick={() => handleRoleSelect('admin')}
            >
              <div className="role-icon">🛡️</div>
              <span>Administrator</span>
            </div>
          </div>

          {/* Error message */}
          {error && <div className="error-message">{error}</div>}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>


            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Signing In...' : `Sign In as ${selectedRole === 'admin' ? 'Administrator' : 'Employee'}`}
            </button>
          </form>

          <div className="signup-link">
            <a href="/register">Forgot password?</a> |
            <a href="/register">Sign up here</a>
          </div>

          <div className="divider">
            <span></span>
            <p>Or continue with</p>
            <span></span>
          </div>

          <div className="social-login">
            <button className="social-btn" onClick={() => handleSocialLogin('Google')}>G</button>
            <button className="social-btn" onClick={() => handleSocialLogin('Facebook')}>f</button>
            <button className="social-btn" onClick={() => handleSocialLogin('Microsoft')}>⊞</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
