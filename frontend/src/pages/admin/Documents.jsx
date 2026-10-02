import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { categoryService } from '../../services/categoryService';
import Loading from '../../components/Loading';
import ConfirmModal from '../../components/ConfirmModal';

const AdminDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [userId, setUserId] = useState('');
  const [fileType, setFileType] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchFilters = async () => {
    try {
      const [catsRes, usersRes] = await Promise.all([
        categoryService.getAllCategories(),
        adminService.getAllUsers(),
      ]);
      if (catsRes.success) setCategories(catsRes.data);
      if (usersRes.success) setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (keyword.trim()) params.keyword = keyword.trim();
      if (categoryId) params.categoryId = categoryId;
      if (userId) params.userId = userId;
      if (fileType) params.fileType = fileType;

      const res = await adminService.getAllDocuments(params);
      if (res.success && res.data) {
        setDocuments(res.data);
      } else {
        setError(res.message || 'Error fetching documents.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error connecting to documents service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
    fetchDocuments();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchDocuments();
  };

  const handleClear = () => {
    setKeyword('');
    setCategoryId('');
    setUserId('');
    setFileType('');
    setTimeout(() => {
      adminService.getAllDocuments({}).then((res) => {
        if (res.success) setDocuments(res.data);
      });
    }, 50);
  };

  const handleDownload = async (doc) => {
    try {
      await adminService.downloadDocument(doc.id, doc.originalFilename);
    } catch (err) {
      alert('Download error: ' + (err.response?.data?.message || err.message));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      const res = await adminService.deleteDocument(deleteTarget.id);
      if (res.success) {
        setSuccess(`Document "${deleteTarget.documentName}" deleted successfully.`);
        setDeleteTarget(null);
        fetchDocuments();
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeleteLoading(false);
    }
  };

  const getBadgeClass = (ext) => {
    const e = ext?.toLowerCase();
    if (e === 'pdf') return 'badge-file-pdf';
    if (['jpg', 'jpeg', 'png'].includes(e)) return 'badge-file-image';
    if (['doc', 'docx'].includes(e)) return 'badge-file-doc';
    return 'badge-file-other';
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Global Document Storage</h3>
          <p className="text-muted mb-0 small">
            Supervise, audit, download, or moderate documents uploaded by all registered users
          </p>
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

      {/* Filter Section */}
      <div className="content-card mb-4">
        <form onSubmit={handleFilterSubmit}>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-semibold text-secondary">Search Keyword</label>
              <input
                type="text"
                className="form-control bg-light"
                placeholder="Title or filename..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-semibold text-secondary">Filter by User</label>
              <select
                className="form-select bg-light"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              >
                <option value="">All Users</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-semibold text-secondary">Category</label>
              <select
                className="form-select bg-light"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-semibold text-secondary">File Type</label>
              <select
                className="form-select bg-light"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="pdf">PDF</option>
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
                <option value="docx">Word</option>
              </select>
            </div>

            <div className="col-md-2 d-flex align-items-end gap-2">
              <button type="submit" className="btn btn-primary-custom w-100">
                Filter
              </button>
              <button type="button" className="btn btn-light border" onClick={handleClear} title="Clear Filters">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Document Records Table */}
      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0">Repository Files</h5>
          <span className="badge bg-light text-dark border px-2 py-1 rounded-pill">
            {documents.length} files found
          </span>
        </div>

        {loading ? (
          <Loading message="Fetching all user records..." />
        ) : documents.length > 0 ? (
          <div className="table-responsive">
            <table className="table custom-table align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th>Document Name</th>
                  <th>Account Owner</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="small text-muted">#{doc.id}</td>
                    <td>
                      <div className="fw-semibold text-dark">{doc.documentName}</div>
                      <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        {doc.originalFilename}
                      </div>
                    </td>
                    <td>
                      <div className="small fw-semibold text-dark">{doc.userName}</div>
                      <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        {doc.userEmail}
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
                    <td className="small text-secondary">{doc.fileSizeFormatted}</td>
                    <td className="small text-secondary">
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link
                          to={`/documents/${doc.id}`}
                          className="btn btn-outline-secondary"
                          title="View / Preview"
                        >
                          <i className="bi bi-eye"></i>
                        </Link>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="btn btn-outline-secondary"
                          title="Download File"
                        >
                          <i className="bi bi-download"></i>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(doc)}
                          className="btn btn-outline-danger"
                          title="Delete File"
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
            <i className="bi bi-folder2-open fs-1 text-muted d-block mb-3"></i>
            <h6 className="fw-bold text-dark">No documents found matching filters</h6>
          </div>
        )}
      </div>

      <ConfirmModal
        show={!!deleteTarget}
        title="Admin Document Deletion"
        message={`Are you sure you want to delete "${deleteTarget?.documentName}" owned by ${deleteTarget?.userName}? The physical file will be removed from disk immediately.`}
        confirmText="Delete Document"
        confirmVariant="danger"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminDocuments;
