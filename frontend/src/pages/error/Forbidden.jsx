import React from 'react';
import { Link } from 'react-router-dom';

const Forbidden = () => {
  return (
    <div className="auth-page-bg text-center">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="display-1 fw-bold text-danger mb-2">403</div>
        <h4 className="fw-bold text-dark mb-2">Access Forbidden</h4>
        <p className="text-muted small mb-4">
          You do not have administrative privileges to access this console.
        </p>
        <Link to="/dashboard" className="btn btn-primary-custom px-4">
          Return to User Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Forbidden;
