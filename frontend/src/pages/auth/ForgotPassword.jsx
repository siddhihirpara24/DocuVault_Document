import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please provide your registered email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.forgotPassword({ email });
      if (res.success && res.data) {
        setToken(res.data);
      } else {
        setError(res.message || 'Could not generate reset token.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Email not found or error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="auth-page-bg">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="sidebar-logo-icon mx-auto mb-3" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}>
            <i className="bi bi-key-fill"></i>
          </div>
          <h3 className="fw-bold text-dark mb-1">Reset Password</h3>
          <p className="text-muted small">Enter your email to request a secure reset token</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 rounded-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div>{error}</div>
          </div>
        )}

        {token ? (
          <div>
            <div className="alert alert-success py-3 rounded-3 mb-3">
              <div className="d-flex align-items-center gap-2 fw-bold mb-1">
                <i className="bi bi-check-circle-fill"></i> Token Generated Successfully!
              </div>
              <p className="small mb-2 text-secondary">
                For college project demonstration without SMTP mail service, your secure token is generated below:
              </p>
              <div className="bg-white p-2 rounded border font-monospace small text-break user-select-all mb-2">
                {token}
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-success w-100 d-flex align-items-center justify-content-center gap-1"
                onClick={copyToken}
              >
                <i className={`bi ${copied ? 'bi-check-lg' : 'bi-clipboard'}`}></i>
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Token'}</span>
              </button>
            </div>

            <button
              onClick={() => navigate(`/reset-password?token=${token}`)}
              className="btn btn-primary-custom w-100 py-2 mb-3"
            >
              Continue to Set New Password &rarr;
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary">Registered Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control bg-light border-start-0 ps-0"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary-custom w-100 py-2 mb-3 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading && <span className="spinner-border spinner-border-sm" role="status"></span>}
              <span>Generate Reset Token</span>
            </button>
          </form>
        )}

        <div className="text-center small text-secondary">
          Remembered your password?{' '}
          <Link to="/login" className="text-primary fw-semibold text-decoration-none">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
