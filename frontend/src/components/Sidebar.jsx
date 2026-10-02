import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen && <div className="sidebar-backdrop d-lg-none" onClick={toggleSidebar}></div>}

      <aside className={`app-sidebar ${isOpen ? 'show' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">
            <i className="bi bi-safe2"></i>
          </div>
          <div className="d-flex flex-column">
            <span className="fw-bold fs-5 text-white tracking-wide">DocuVault</span>
            <span className="text-secondary" style={{ fontSize: '0.72rem' }}>Personal Organizer</span>
          </div>
        </div>

        <div className="sidebar-nav">
          {isAdmin ? (
            <>
              <div className="nav-category-title">Admin Management</div>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => window.innerWidth < 992 && toggleSidebar()}
              >
                <i className="bi bi-speedometer2"></i>
                <span>Admin Dashboard</span>
              </NavLink>

              <NavLink
                to="/admin/users"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => window.innerWidth < 992 && toggleSidebar()}
              >
                <i className="bi bi-people"></i>
                <span>Manage Users</span>
              </NavLink>

              <NavLink
                to="/admin/documents"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => window.innerWidth < 992 && toggleSidebar()}
              >
                <i className="bi bi-files"></i>
                <span>Manage Documents</span>
              </NavLink>

              <NavLink
                to="/admin/categories"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => window.innerWidth < 992 && toggleSidebar()}
              >
                <i className="bi bi-tags"></i>
                <span>Manage Categories</span>
              </NavLink>

              <NavLink
                to="/admin/reports"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => window.innerWidth < 992 && toggleSidebar()}
              >
                <i className="bi bi-bar-chart-line"></i>
                <span>Analytics & Reports</span>
              </NavLink>
            </>
          ) : (
            <>
              <div className="nav-category-title">Main Navigation</div>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => window.innerWidth < 992 && toggleSidebar()}
              >
                <i className="bi bi-speedometer2"></i>
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/documents"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => window.innerWidth < 992 && toggleSidebar()}
              >
                <i className="bi bi-folder2-open"></i>
                <span>My Documents</span>
              </NavLink>

              <NavLink
                to="/upload"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => window.innerWidth < 992 && toggleSidebar()}
              >
                <i className="bi bi-cloud-arrow-up"></i>
                <span>Upload Document</span>
              </NavLink>

              <NavLink
                to="/categories"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => window.innerWidth < 992 && toggleSidebar()}
              >
                <i className="bi bi-tags"></i>
                <span>Categories</span>
              </NavLink>

              <NavLink
                to="/search"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => window.innerWidth < 992 && toggleSidebar()}
              >
                <i className="bi bi-search"></i>
                <span>Search Documents</span>
              </NavLink>
            </>
          )}

          <div className="nav-category-title mt-3">Account & Security</div>
          <NavLink
            to="/profile"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => window.innerWidth < 992 && toggleSidebar()}
          >
            <i className="bi bi-person-circle"></i>
            <span>Profile</span>
          </NavLink>

          <NavLink
            to="/change-password"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => window.innerWidth < 992 && toggleSidebar()}
          >
            <i className="bi bi-shield-lock"></i>
            <span>Change Password</span>
          </NavLink>
        </div>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3"
            title="Sign Out"
          >
            <i className="bi bi-box-arrow-right fs-5"></i>
            <span className="fw-semibold">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
