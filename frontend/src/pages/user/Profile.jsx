import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import Loading from '../../components/Loading';

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await authService.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setFullName(res.data.fullName);
        setPhone(res.data.phone || '');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim()) {
      setError('Full Name is required.');
      return;
    }

    try {
      setSaving(true);
      const res = await authService.updateProfile({ fullName: fullName.trim(), phone: phone.trim() });
      if (res.success && res.data) {
        setProfile(res.data);
        updateUser({ fullName: res.data.fullName });
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading message="Loading profile details..." />;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">User Profile</h3>
        <p className="text-muted mb-0 small">Manage your account identity details and security parameters</p>
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

      {/* Profile Overview Card */}
      <div className="content-card mb-4">
        <div className="d-flex flex-column flex-sm-row align-items-center gap-3">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-2 shadow-sm"
            style={{ width: '70px', height: '70px' }}
          >
            {profile?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="text-center text-sm-start">
            <h4 className="fw-bold text-dark mb-1">{profile?.fullName}</h4>
            <p className="text-muted small mb-2">{profile?.email}</p>
            <div className="d-flex flex-wrap justify-content-center justify-content-sm-start gap-2">
              <span className="badge bg-primary-subtle text-primary border px-2 py-1 rounded-pill">
                {profile?.role === 'ROLE_ADMIN' ? 'Administrator' : 'Verified User'}
              </span>
              <span className="badge bg-success-subtle text-success border px-2 py-1 rounded-pill">
                Status: {profile?.status}
              </span>
              <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill">
                {profile?.documentCount} Documents Stored
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Profile Form */}
      <div className="content-card">
        <h5 className="fw-bold text-dark border-bottom pb-2 mb-4">Update Details</h5>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Full Name *</label>
            <input
              type="text"
              className="form-control"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Email Address (Read-only)</label>
            <input
              type="email"
              className="form-control bg-light"
              value={profile?.email || ''}
              disabled
              readOnly
            />
            <div className="form-text small">Email cannot be modified directly to preserve audit integrity.</div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Phone Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="+1 555-0100"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold text-secondary">Member Since</label>
            <input
              type="text"
              className="form-control bg-light"
              value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : ''}
              disabled
              readOnly
            />
          </div>

          <div className="d-flex justify-content-end">
            <button
              type="submit"
              className="btn btn-primary-custom px-4 d-flex align-items-center gap-2"
              disabled={saving}
            >
              {saving && <span className="spinner-border spinner-border-sm" role="status"></span>}
              <i className="bi bi-check-lg"></i>
              <span>Update Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
