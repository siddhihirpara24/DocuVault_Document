import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="auth-page-bg text-center">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="display-1 fw-bold text-primary mb-2">404</div>
        <h4 className="fw-bold text-dark mb-2">Page Not Found</h4>
        <p className="text-muted small mb-4">
          The vault resource or page you requested could not be located on the server.
        </p>
        <Link to="/dashboard" className="btn btn-primary-custom px-4">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
