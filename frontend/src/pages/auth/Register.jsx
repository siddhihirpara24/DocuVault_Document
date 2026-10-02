import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required.';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email format.';
    }
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm Password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const res = await authService.register(formData);
      if (res.success) {
        navigate('/login?registered=true');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      if (err.response?.data?.data && typeof err.response.data.data === 'object') {
        setFieldErrors(err.response.data.data);
      }
      setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-bg">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="text-center mb-4">
          <div className="sidebar-logo-icon mx-auto mb-3" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}>
            <i className="bi bi-person-plus-fill"></i>
          </div>
          <h3 className="fw-bold text-dark mb-1">Create an Account</h3>
          <p className="text-muted small">Register to start managing your personal vault</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 rounded-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Full Name *</label>
            <input
              type="text"
              name="fullName"
              className={`form-control bg-light ${fieldErrors.fullName ? 'is-invalid' : ''}`}
              placeholder="e.g. John Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            {fieldErrors.fullName && <div className="invalid-feedback">{fieldErrors.fullName}</div>}
          </div>

          <div className="row g-2 mb-3">
            <div className="col-md-7">
              <label className="form-label small fw-semibold text-secondary">Email Address *</label>
              <input
                type="email"
                name="email"
                className={`form-control bg-light ${fieldErrors.email ? 'is-invalid' : ''}`}
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
            </div>

            <div className="col-md-5">
              <label className="form-label small fw-semibold text-secondary">Phone Number</label>
              <input
                type="text"
                name="phone"
                className="form-control bg-light"
                placeholder="+1 555-0100"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row g-2 mb-4">
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Password *</label>
              <input
                type="password"
                name="password"
                className={`form-control bg-light ${fieldErrors.password ? 'is-invalid' : ''}`}
                placeholder="Min. 6 chars"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {fieldErrors.password && <div className="invalid-feedback">{fieldErrors.password}</div>}
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                className={`form-control bg-light ${fieldErrors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {fieldErrors.confirmPassword && <div className="invalid-feedback">{fieldErrors.confirmPassword}</div>}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary-custom w-100 py-2 mb-3 d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading && <span className="spinner-border spinner-border-sm" role="status"></span>}
            <span>Complete Registration</span>
          </button>
        </form>

        <div className="text-center small text-secondary">
          Already registered?{' '}
          <Link to="/login" className="text-primary fw-semibold text-decoration-none">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
