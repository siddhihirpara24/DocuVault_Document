import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import Loading from '../../components/Loading';
import ConfirmModal from '../../components/ConfirmModal';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterText, setFilterText] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await documentService.getUserDocuments();
      if (res.success && res.data) {
        setDocuments(res.data);
      } else {
        setError(res.message || 'Failed to fetch documents.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDownload = async (doc) => {
    try {
      await documentService.downloadDocument(doc.id, doc.originalFilename);
    } catch (err) {
      alert('Error downloading file: ' + (err.response?.data?.message || err.message));
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
        fetchDocuments();
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

  const filteredDocs = documents.filter((doc) => {
    const text = filterText.toLowerCase();
    return (
      doc.documentName?.toLowerCase().includes(text) ||
      doc.categoryName?.toLowerCase().includes(text) ||
      doc.originalFilename?.toLowerCase().includes(text) ||
      doc.fileType?.toLowerCase().includes(text)
    );
  });

  if (loading) {
    return <Loading message="Loading your documents..." />;
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">My Documents</h3>
          <p className="text-muted mb-0 small">
            All your secured files stored safely in your personal vault ({documents.length} total)
          </p>
        </div>
        <Link to="/upload" className="btn btn-primary-custom d-flex align-items-center gap-2">
          <i className="bi bi-cloud-arrow-up-fill"></i>
          <span>Upload Document</span>
        </Link>
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
        {/* Search Filter Header */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-3">
          <div className="input-group" style={{ maxWidth: '350px' }}>
            <span className="input-group-text bg-light border-end-0 text-muted">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control bg-light border-start-0 ps-0"
              placeholder="Filter by name, category, or file type..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            {filterText && (
              <button className="btn btn-light border border-start-0" onClick={() => setFilterText('')}>
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>

          <div className="text-muted small">
            Showing <strong>{filteredDocs.length}</strong> of <strong>{documents.length}</strong> files
          </div>
        </div>

        {filteredDocs.length > 0 ? (
          <div className="table-responsive">
            <table className="table custom-table align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th>Document Name</th>
                  <th>Category</th>
                  <th>File Type</th>
                  <th>File Size</th>
                  <th>Upload Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc) => (
                  <tr key={doc.id}>
                    <td className="text-muted small">#{doc.id}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <i className={`bi ${doc.fileType?.toLowerCase() === 'pdf' ? 'bi-file-earmark-pdf-fill text-danger' : 'bi-file-earmark-text-fill text-primary'} fs-5`}></i>
                        <div>
                          <Link to={`/documents/${doc.id}`} className="fw-semibold text-dark text-decoration-none">
                            {doc.documentName}
                          </Link>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {doc.originalFilename}
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
                    <td className="text-secondary small">{doc.fileSizeFormatted}</td>
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
                          title="View / Preview"
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
                          title="Edit"
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
            <i className="bi bi-folder-x fs-1 text-muted d-block mb-3"></i>
            <h6 className="fw-bold text-dark">No matching documents found</h6>
            <p className="text-muted small mb-0">Try adjusting your filter or upload a new document.</p>
          </div>
        )}
      </div>

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

export default Documents;
