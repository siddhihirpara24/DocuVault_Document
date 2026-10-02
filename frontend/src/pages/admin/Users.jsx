import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Loading from '../../components/Loading';
import ConfirmModal from '../../components/ConfirmModal';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [actionTarget, setActionTarget] = useState(null);
  const [modalType, setModalType] = useState(null); // 'delete', 'view', 'docs'
  const [actionLoading, setActionLoading] = useState(false);

  // User documents modal
  const [userDocs, setUserDocs] = useState([]);
  const [userDocsLoading, setUserDocsLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      } else {
        setError(res.message || 'Error fetching user directory.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to user service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    try {
      if (user.status === 'ACTIVE') {
        await adminService.deactivateUser(user.id);
        setSuccess(`User ${user.fullName} has been deactivated.`);
      } else {
        await adminService.activateUser(user.id);
        setSuccess(`User ${user.fullName} has been activated.`);
      }
      fetchUsers();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error toggling user status.');
    }
  };

  const confirmDelete = async () => {
    if (!actionTarget) return;
    try {
      setActionLoading(true);
      const res = await adminService.deleteUser(actionTarget.id);
      if (res.success) {
        setSuccess(`User account ${actionTarget.fullName} and their files were deleted.`);
        setActionTarget(null);
        setModalType(null);
        fetchUsers();
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setActionLoading(false);
    }
  };

  const openUserDocs = async (user) => {
    setActionTarget(user);
    setModalType('docs');
    try {
      setUserDocsLoading(true);
      const res = await adminService.getAllDocuments({ userId: user.id });
      if (res.success && res.data) {
        setUserDocs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUserDocsLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.fullName?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.phone?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return <Loading message="Loading user directory..." />;
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Manage Users</h3>
          <p className="text-muted mb-0 small">
            Supervise registered accounts, manage account states, and monitor document volume
          </p>
        </div>
        <div className="input-group" style={{ maxWidth: '320px' }}>
          <span className="input-group-text bg-white border-end-0 text-muted">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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

      <div className="content-card">
        <div className="table-responsive">
          <table className="table custom-table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>User Details</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Documents</th>
                <th>Registration Date</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td className="text-muted small">#{u.id}</td>
                  <td>
                    <div className="fw-semibold text-dark">{u.fullName}</div>
                    <div className="text-muted small">{u.email}</div>
                  </td>
                  <td className="small text-secondary">{u.phone || '—'}</td>
                  <td>
                    <span className={`badge ${u.role === 'ROLE_ADMIN' ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-light text-secondary border'}`}>
                      {u.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-link p-0 text-decoration-none fw-semibold"
                      onClick={() => openUserDocs(u)}
                    >
                      {u.documentCount} {u.documentCount === 1 ? 'doc' : 'docs'}
                    </button>
                  </td>
                  <td className="small text-secondary">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`badge rounded-pill ${u.status === 'ACTIVE' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => { setActionTarget(u); setModalType('view'); }}
                        title="View User Details"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button
                        className={`btn ${u.status === 'ACTIVE' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        onClick={() => handleToggleStatus(u)}
                        title={u.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
                      >
                        <i className={`bi ${u.status === 'ACTIVE' ? 'bi-person-slash' : 'bi-person-check'}`}></i>
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => { setActionTarget(u); setModalType('delete'); }}
                        title="Delete User"
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
      </div>

      {/* View User Modal */}
      {modalType === 'view' && actionTarget && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">User Information</h5>
                <button type="button" className="btn-close" onClick={() => { setActionTarget(null); setModalType(null); }}></button>
              </div>
              <div className="modal-body py-4">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-3" style={{ width: '56px', height: '56px' }}>
                    {actionTarget.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0 text-dark">{actionTarget.fullName}</h5>
                    <span className="text-muted small">{actionTarget.email}</span>
                  </div>
                </div>

                <div className="list-group list-group-flush small">
                  <div className="list-group-item d-flex justify-content-between px-0">
                    <span className="text-muted">Account ID:</span>
                    <span className="fw-semibold text-dark">#{actionTarget.id}</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0">
                    <span className="text-muted">Phone Number:</span>
                    <span className="fw-semibold text-dark">{actionTarget.phone || 'Not provided'}</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0">
                    <span className="text-muted">Role Assignment:</span>
                    <span className="badge bg-light text-dark border">{actionTarget.role}</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0">
                    <span className="text-muted">Current Status:</span>
                    <span className={`badge ${actionTarget.status === 'ACTIVE' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                      {actionTarget.status}
                    </span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0">
                    <span className="text-muted">Total Stored Files:</span>
                    <span className="fw-semibold text-dark">{actionTarget.documentCount} documents</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0">
                    <span className="text-muted">Joined Date:</span>
                    <span className="fw-semibold text-dark">{new Date(actionTarget.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-light px-4 rounded-3" onClick={() => { setActionTarget(null); setModalType(null); }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Documents Modal */}
      {modalType === 'docs' && actionTarget && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <div>
                  <h5 className="modal-title fw-bold">Documents belonging to {actionTarget.fullName}</h5>
                  <span className="text-muted small">{actionTarget.email}</span>
                </div>
                <button type="button" className="btn-close" onClick={() => { setActionTarget(null); setModalType(null); }}></button>
              </div>
              <div className="modal-body py-4">
                {userDocsLoading ? (
                  <Loading message="Loading files..." />
                ) : userDocs.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table custom-table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Document Name</th>
                          <th>Category</th>
                          <th>Size</th>
                          <th>Date</th>
                          <th className="text-end">Download</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userDocs.map((d) => (
                          <tr key={d.id}>
                            <td className="fw-semibold text-dark">{d.documentName}</td>
                            <td><span className="badge bg-light text-dark border">{d.categoryName}</span></td>
                            <td className="small text-secondary">{d.fileSizeFormatted}</td>
                            <td className="small text-secondary">{new Date(d.uploadDate).toLocaleDateString()}</td>
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => adminService.downloadDocument(d.id, d.originalFilename)}
                              >
                                <i className="bi bi-download"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted text-center py-4 mb-0">This user has not uploaded any documents yet.</p>
                )}
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-light px-4 rounded-3" onClick={() => { setActionTarget(null); setModalType(null); }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirm Modal */}
      <ConfirmModal
        show={modalType === 'delete' && !!actionTarget}
        title="Delete User Account"
        message={`Warning: Deleting user "${actionTarget?.fullName}" (${actionTarget?.email}) will permanently purge their account and delete all ${actionTarget?.documentCount} physical files from the storage server. Are you sure you wish to proceed?`}
        confirmText="Confirm Purge"
        confirmVariant="danger"
        loading={actionLoading}
        onConfirm={confirmDelete}
        onCancel={() => { setActionTarget(null); setModalType(null); }}
      />
    </div>
  );
};

export default Users;
