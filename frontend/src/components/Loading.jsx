import React from 'react';

const Loading = ({ message = 'Loading, please wait...' }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center">
      <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted fw-semibold">{message}</p>
    </div>
  );
};

export default Loading;
