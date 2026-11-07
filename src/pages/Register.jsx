import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/auth';
import './Login.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    rePassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.rePassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await registerUser(
        formData.username,
        formData.email,
        formData.password
      );

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <span className="welcome-tag">JOIN THE COMMUNITY</span>

            <h1>
              Start Your
              <span className="highlight"> {' '}Cinematic Journey{' '} </span>
            </h1>

            <p>
              Create an account to discover personalized movie recommendations
              and experience entertainment powered by AI.
            </p>

            <div className="feature-list">
              <div>✦ AI-Powered Recommendations</div>
              <div>✦ Personalized Experience</div>
              <div>✦ Movie Discovery</div>
            </div>
          </div>

          <div className="brand-footer">
            © 2026 CineFlowAI. All rights reserved.
          </div>
        </div>

        {/* RIGHT REGISTRATION FORM */}
        <div className="form-section">
          <div className="mobile-logo">
            <span className="logo-icon">▶</span>
            CineFlow<span className="highlight">AI</span>
          </div>

          <div className="form-header">
            <span className="welcome-tag">CREATE YOUR ACCOUNT</span>

            <h2>Join Us!</h2>

            <p>
              Sign up to start your entertainment journey.
            </p>
          </div>

          {error && (
            <div className="error-message">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">Username</label>

              <div className="input-wrapper">
                <span className="input-icon">👤</span>

                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>

              <div className="input-wrapper">
                <span className="input-icon">✉</span>

                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
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
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
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

            <div className="input-group">
              <label htmlFor="rePassword">Confirm Password</label>

              <div className="input-wrapper">
                <span className="input-icon">🔐</span>

                <input
                  type={showPassword ? 'text' : 'password'}
                  id="rePassword"
                  name="rePassword"
                  placeholder="Confirm your password"
                  value={formData.rePassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>

          <div className="signup-text">
            Already have an account?

            <Link to="/login">
              Sign In
            </Link>
          </div>

          <div className="security-text">
            🔒 We never share your personal information.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;