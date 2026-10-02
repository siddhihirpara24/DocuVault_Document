import React, { useState } from 'react';
import { authService } from '../../services/authService';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.currentPassword) {
      setError('Please provide your current password.');
      return;
    }
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('New password and confirm new password do not match.');
      return;
    }
    if (formData.currentPassword === formData.newPassword) {
      setError('New password cannot be identical to your current password.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.changePassword(formData);
      if (res.success) {
        setSuccess('Your password has been changed successfully!');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      } else {
        setError(res.message || 'Failed to change password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while updating password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto' }}>
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Change Password</h3>
        <p className="text-muted mb-0 small">
          Enhance your vault protection by setting a new strong password
        </p>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 rounded-3 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="alert alert-success py-2 small d-flex align-items-center gap-2 rounded-3 mb-4" role="alert">
          <i className="bi bi-check-circle-fill"></i>
          <div>{success}</div>
        </div>
      )}

      <div className="content-card">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Current Password *</label>
            <input
              type="password"
              name="currentPassword"
              className="form-control"
              placeholder="Enter existing password"
              value={formData.currentPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">New Password *</label>
            <input
              type="password"
              name="newPassword"
              className="form-control"
              placeholder="Min. 6 characters"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold text-secondary">Confirm New Password *</label>
            <input
              type="password"
              name="confirmNewPassword"
              className="form-control"
              placeholder="Re-enter new password"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="d-flex justify-content-end">
            <button
              type="submit"
              className="btn btn-primary-custom px-4 d-flex align-items-center gap-2"
              disabled={loading}
            >
              {loading && <span className="spinner-border spinner-border-sm" role="status"></span>}
              <i className="bi bi-shield-lock-fill"></i>
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
