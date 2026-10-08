import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, GraduationCap } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/browse';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email and password');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await login(email.trim().toLowerCase(), password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      if (!err.response) {
        setError('Cannot reach backend server. Please check your network connection.');
      } else {
        const msg = err.response?.data?.message || 'Invalid email or password. Please verify credentials.';
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        padding: '4rem 1rem 6rem 1rem',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fcfcfc',
      }}
    >
      <div style={{ maxWidth: '440px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              backgroundColor: '#09090b',
              color: 'white',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.25)',
              marginBottom: '1.25rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <GraduationCap size={30} />
          </div>
          <h1 style={{ fontSize: '1.95rem', letterSpacing: '-0.03em', marginBottom: '0.4rem', color: '#09090b' }}>
            Student Login
          </h1>
          <p style={{ color: '#71717a', fontSize: '0.925rem' }}>
            Access your campus marketplace account and active listings
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2.25rem', boxShadow: '0 12px 30px -8px rgba(0,0,0,0.08)', borderRadius: '18px' }}>
          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                color: '#b91c1c',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  color="#a1a1aa"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@nmit.ac.in"
                  className="form-input"
                  style={{ paddingLeft: '42px' }}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  color="#a1a1aa"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingLeft: '42px' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', letterSpacing: '-0.01em' }}
              disabled={submitting}
            >
              {submitting ? 'Authenticating...' : (
                <>
                  <LogIn size={18} /> Log In
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: '#71717a' }}>
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: '#09090b', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
