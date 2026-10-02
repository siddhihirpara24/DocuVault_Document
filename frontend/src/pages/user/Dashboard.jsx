import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { documentService } from '../../services/documentService';
import Loading from '../../components/Loading';
import ConfirmModal from '../../components/ConfirmModal';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await documentService.getUserDashboard();
      if (res.success && res.data) {
        setDashboardData(res.data);
      } else {
        setError(res.message || 'Failed to load dashboard metrics.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleDownload = async (doc) => {
    try {
      await documentService.downloadDocument(doc.id, doc.originalFilename);
    } catch (err) {
      alert('Error downloading document: ' + (err.response?.data?.message || err.message));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      const res = await documentService.deleteDocument(deleteTarget.id);
      if (res.success) {
        setSuccess(`Document "${deleteTarget.documentName}" deleted successfully.`);
        setDeleteTarget(null);
        fetchDashboard();
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err) {
      alert('Failed to delete document: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeleteLoading(false);
    }
  };

  const getBadgeClass = (fileType) => {
    const ext = fileType?.toLowerCase();
    if (ext === 'pdf') return 'badge-file-pdf';
    if (['jpg', 'jpeg', 'png'].includes(ext)) return 'badge-file-image';
    if (['doc', 'docx'].includes(ext)) return 'badge-file-doc';
    return 'badge-file-other';
  };

  if (loading) {
    return <Loading message="Loading your personal dashboard..." />;
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            Welcome back, <span className="text-primary">{user?.fullName || 'User'}</span>!
          </h2>
          <p className="text-muted mb-0 small">
            Securely organize, browse, search, and manage your personal documents in one place.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/upload" className="btn btn-primary-custom d-flex align-items-center gap-2">
            <i className="bi bi-cloud-arrow-up-fill"></i>
            <span>Upload Document</span>
          </Link>
          <Link to="/search" className="btn btn-light border d-flex align-items-center gap-2">
            <i className="bi bi-search"></i>
            <span>Search</span>
          </Link>
        </div>
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

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted small fw-semibold text-uppercase tracking-wider">Total Documents</span>
              <h3 className="fw-bold text-dark mt-1 mb-0">{dashboardData?.totalDocuments || 0}</h3>
              <span className="text-success small fw-medium mt-1 d-block">
                <i className="bi bi-check-circle me-1"></i>Securely Stored
              </span>
            </div>
            <div className="stat-icon primary">
              <i className="bi bi-folder-fill"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted small fw-semibold text-uppercase tracking-wider">Education</span>
              <h3 className="fw-bold text-dark mt-1 mb-0">{dashboardData?.educationCount || 0}</h3>
              <span className="text-muted small mt-1 d-block">Marksheets & Degrees</span>
            </div>
            <div className="stat-icon success">
              <i className="bi bi-mortarboard-fill"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted small fw-semibold text-uppercase tracking-wider">Identity</span>
              <h3 className="fw-bold text-dark mt-1 mb-0">{dashboardData?.identityCount || 0}</h3>
              <span className="text-muted small mt-1 d-block">Passports & IDs</span>
            </div>
            <div className="stat-icon info">
              <i className="bi bi-person-badge-fill"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted small fw-semibold text-uppercase tracking-wider">Career & Other</span>
              <h3 className="fw-bold text-dark mt-1 mb-0">
                {(dashboardData?.careerCount || 0) + (dashboardData?.otherCount || 0)}
              </h3>
              <span className="text-muted small mt-1 d-block">Resumes & General</span>
            </div>
            <div className="stat-icon warning">
              <i className="bi bi-briefcase-fill"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="card bg-white border border-slate-200 rounded-4 p-3 mb-4 shadow-sm">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-light text-dark border p-2">
              <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Quick Shortcuts
            </span>
            <span className="text-muted small">Jump straight into common document activities:</span>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/upload" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 rounded-3">
              <i className="bi bi-plus-lg"></i> Upload New
            </Link>
            <Link to="/documents" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 rounded-3">
              <i className="bi bi-files"></i> View All ({dashboardData?.totalDocuments || 0})
            </Link>
            <Link to="/categories" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 rounded-3">
              <i className="bi bi-tags"></i> Categories
            </Link>
            <Link to="/search" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 rounded-3">
              <i className="bi bi-funnel"></i> Filter
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Documents Table */}
      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-0">Recent Documents</h5>
            <span className="text-muted small">Recently uploaded files ready for quick access</span>
          </div>
          <Link to="/documents" className="text-primary small fw-semibold text-decoration-none">
            View All &rarr;
          </Link>
        </div>

        {dashboardData?.recentDocuments && dashboardData.recentDocuments.length > 0 ? (
          <div className="table-responsive">
            <table className="table custom-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Category</th>
                  <th>File Type</th>
                  <th>Upload Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <i className={`bi ${doc.fileType?.toLowerCase() === 'pdf' ? 'bi-file-earmark-pdf-fill text-danger' : 'bi-file-earmark-text-fill text-primary'} fs-5`}></i>
                        <div>
                          <Link to={`/documents/${doc.id}`} className="fw-semibold text-dark text-decoration-none">
                            {doc.documentName}
                          </Link>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {doc.originalFilename} • {doc.fileSizeFormatted}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border px-2 py-1 rounded-pill">
                        {doc.categoryName || 'General'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge px-2 py-1 rounded-pill ${getBadgeClass(doc.fileType)}`}>
                        {doc.fileType?.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-secondary small">
                      {new Date(doc.uploadDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link
                          to={`/documents/${doc.id}`}
                          className="btn btn-outline-secondary"
                          title="View Document"
                        >
                          <i className="bi bi-eye"></i>
                        </Link>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="btn btn-outline-secondary"
                          title="Download"
                        >
                          <i className="bi bi-download"></i>
                        </button>
                        <Link
                          to={`/documents/${doc.id}/edit`}
                          className="btn btn-outline-secondary"
                          title="Edit Document"
                        >
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(doc)}
                          className="btn btn-outline-danger"
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="stat-icon primary mx-auto mb-3" style={{ width: '64px', height: '64px', fontSize: '2rem' }}>
              <i className="bi bi-cloud-arrow-up"></i>
            </div>
            <h6 className="fw-bold text-dark">No documents uploaded yet</h6>
            <p className="text-muted small mb-3">Upload your first degree certificate, ID, or resume now.</p>
            <Link to="/upload" className="btn btn-sm btn-primary-custom">
              Upload First Document
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={!!deleteTarget}
        title="Delete Document"
        message={`Are you sure you want to permanently delete "${deleteTarget?.documentName}"? Both metadata and physical file will be deleted.`}
        confirmText="Yes, Delete"
        confirmVariant="danger"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Dashboard;
