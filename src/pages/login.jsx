import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/auth';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      await loginUser(
        credentials.email,
        credentials.password
      );

      navigate('/dashboard', { replace: true });

    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = (provider) => {
    const urls = {
      google: 'http://localhost:8000/accounts/google/login/',
      github: 'http://localhost:8000/accounts/github/login/',
      facebook: 'http://localhost:8000/accounts/facebook/login/',
    };

    window.location.href = urls[provider];
  };

  return (
    <div className="login-page">
      <div className="background-glow"></div>

      <div className="login-container">
        {/* LEFT BRANDING */}
        <div className="brand-section">
          <div className="brand-logo">
            <span className="logo-icon">▶</span>
            <span>
              CineFlow<span className="highlight">AI</span>
            </span>
          </div>

          <div className="brand-content">
            <span className="welcome-tag">WELCOME TO THE FUTURE</span>

            <h1>
              Your Next
              <span className="highlight"> {' '}Favorite Story{' '} </span>
              Starts Here.
            </h1>

            <p>
              Discover movies, explore personalized recommendations,
              and experience entertainment powered by artificial intelligence.
            </p>

            <div className="feature-list">
              <div>✦ AI-Powered Movie Recommendations</div>
              <div>✦ Personalized Entertainment Experience</div>
              <div>✦ Your Movies, Your Universe</div>
            </div>
          </div>

          <div className="brand-footer">
            © 2026 CineFlowAI. All rights reserved.
          </div>
        </div>

        {/* RIGHT LOGIN FORM */}
        <div className="form-section">
          <div className="mobile-logo">
            <span className="logo-icon">▶</span>
            CineFlow<span className="highlight">AI</span>
          </div>

          <div className="form-header">
            <span className="welcome-tag">YOUR ENTERTAINMENT HUB</span>

            <h2>Welcome Back!</h2>

            <p>
              Sign in to continue your cinematic journey.
            </p>
          </div>

          {error && (
            <div className="error-message">
              ⚠ {error}
            </div>
          )}

          {/* SOCIAL LOGIN */}
          <div className="social-buttons">
            <button
              type="button"
              className="social-btn"
              onClick={() => socialLogin('google')}
            >
              <span className="google-icon">G</span>
              Google
            </button>

            <button
              type="button"
              className="social-btn"
              onClick={() => socialLogin('github')}
            >
              ◈ GitHub
            </button>

            <button
              type="button"
              className="social-btn"
              onClick={() => socialLogin('facebook')}
            >
              <span className="facebook-icon">f</span>
              Facebook
            </button>
          </div>

          <div className="divider">
            <span></span>
            <p>OR CONTINUE WITH EMAIL</p>
            <span></span>
          </div>

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email</label>

              <div className="input-wrapper">
                <span className="input-icon">✉</span>

                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>

              <div className="input-wrapper">
                <span className="input-icon">🔒</span>

                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="forgot-link"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In →'}
            </button>
          </form>

          <div className="signup-text">
            Don't have an account?

            <Link to="/register">
              Create Account
            </Link>
          </div>

          <div className="security-text">
            🔒 Your account and personal information are protected.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;