import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-navbar">
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-light d-lg-none p-1 px-2 border"
          onClick={toggleSidebar}
          aria-label="Toggle Navigation"
        >
          <i className="bi bi-list fs-5"></i>
        </button>

        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1">
            {isAdmin ? 'Admin Console' : 'Personal Document Organizer'}
          </span>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        <div className="dropdown">
          <button
            className="btn btn-light border-0 d-flex align-items-center gap-2 px-2 py-1 rounded-pill"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
              style={{ width: '32px', height: '32px' }}
            >
              {isAdmin ? 'A' : (user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U')}
            </div>
            <span className="d-none d-md-inline small fw-semibold text-secondary">
              {isAdmin ? 'Administrator' : (user?.fullName || 'My Account')}
            </span>
            <i className="bi bi-chevron-down small text-muted"></i>
          </button>

          <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-2">
            <li className="px-3 py-2 border-bottom">
              <p className="mb-0 fw-bold small text-dark">{isAdmin ? 'Administrator' : user?.fullName}</p>
              <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>{user?.email}</p>
            </li>
            <li>
              <Link className="dropdown-item py-2 small d-flex align-items-center gap-2" to="/profile">
                <i className="bi bi-person"></i> My Profile
              </Link>
            </li>
            <li>
              <Link className="dropdown-item py-2 small d-flex align-items-center gap-2" to="/change-password">
                <i className="bi bi-shield-lock"></i> Change Password
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link className="dropdown-item py-2 small d-flex align-items-center gap-2 text-primary" to="/admin/dashboard">
                  <i className="bi bi-speedometer2"></i> Admin Dashboard
                </Link>
              </li>
            )}
            <li><hr className="dropdown-divider my-1" /></li>
            <li>
              <button
                className="dropdown-item py-2 small d-flex align-items-center gap-2 text-danger"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right"></i> Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
