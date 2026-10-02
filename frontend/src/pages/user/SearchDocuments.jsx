import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import { categoryService } from '../../services/categoryService';
import Loading from '../../components/Loading';
import ConfirmModal from '../../components/ConfirmModal';

const SearchDocuments = () => {
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [fileType, setFileType] = useState('');
  const [categories, setCategories] = useState([]);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getAllCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCats();
    handleSearch();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const params = {};
      if (keyword.trim()) params.keyword = keyword.trim();
      if (categoryId) params.categoryId = categoryId;
      if (fileType) params.fileType = fileType;

      const res = await documentService.searchDocuments(params);
      if (res.success && res.data) {
        setResults(res.data);
      }
      setSearched(true);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setKeyword('');
    setCategoryId('');
    setFileType('');
    setTimeout(() => {
      documentService.searchDocuments({}).then((res) => {
        if (res.success) setResults(res.data);
      });
    }, 50);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      const res = await documentService.deleteDocument(deleteTarget.id);
      if (res.success) {
        setDeleteTarget(null);
        handleSearch();
      }
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeleteLoading(false);
    }
  };

  const getBadgeClass = (type) => {
    const ext = type?.toLowerCase();
    if (ext === 'pdf') return 'badge-file-pdf';
    if (['jpg', 'jpeg', 'png'].includes(ext)) return 'badge-file-image';
    if (['doc', 'docx'].includes(ext)) return 'badge-file-doc';
    return 'badge-file-other';
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Search & Filter Documents</h3>
        <p className="text-muted mb-0 small">
          Instantly query your personal storage by document title, keyword notes, category, or file format
        </p>
      </div>

      {/* Filter Card */}
      <div className="content-card mb-4">
        <form onSubmit={handleSearch}>
          <div className="row g-3">
            <div className="col-lg-5">
              <label className="form-label small fw-semibold text-secondary">Search Keyword</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light"
                  placeholder="e.g. marksheet, resume, tax, passport..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-4 col-lg-3">
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

            <div className="col-md-4 col-lg-2">
              <label className="form-label small fw-semibold text-secondary">File Format</label>
              <select
                className="form-select bg-light"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="pdf">PDF (.pdf)</option>
                <option value="png">PNG (.png)</option>
                <option value="jpg">JPG (.jpg, .jpeg)</option>
                <option value="docx">Word (.docx, .doc)</option>
              </select>
            </div>

            <div className="col-md-4 col-lg-2 d-flex align-items-end gap-2">
              <button type="submit" className="btn btn-primary-custom w-100 d-flex align-items-center justify-content-center gap-1">
                <i className="bi bi-funnel"></i> Search
              </button>
              <button
                type="button"
                className="btn btn-light border"
                onClick={clearFilters}
                title="Reset Filters"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0">Search Results</h5>
          <span className="badge bg-light text-dark border px-2 py-1 rounded-pill">
            {results.length} {results.length === 1 ? 'match found' : 'matches found'}
          </span>
        </div>

        {loading ? (
          <Loading message="Filtering documents..." />
        ) : results.length > 0 ? (
          <div className="table-responsive">
            <table className="table custom-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Category</th>
                  <th>File Format</th>
                  <th>Size</th>
                  <th>Upload Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <Link to={`/documents/${doc.id}`} className="fw-semibold text-dark text-decoration-none">
                        {doc.documentName}
                      </Link>
                      <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        {doc.originalFilename}
                        {doc.description && ` • "${doc.description}"`}
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
                    <td className="small text-secondary">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link to={`/documents/${doc.id}`} className="btn btn-outline-secondary">
                          <i className="bi bi-eye"></i>
                        </Link>
                        <button
                          onClick={() => documentService.downloadDocument(doc.id, doc.originalFilename)}
                          className="btn btn-outline-secondary"
                        >
                          <i className="bi bi-download"></i>
                        </button>
                        <Link to={`/documents/${doc.id}/edit`} className="btn btn-outline-secondary">
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <button onClick={() => setDeleteTarget(doc)} className="btn btn-outline-danger">
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
            <i className="bi bi-search fs-1 text-muted d-block mb-3"></i>
            <h6 className="fw-bold text-dark">No documents matched your search query</h6>
            <p className="text-muted small mb-0">Try changing keywords or removing category filters.</p>
          </div>
        )}
      </div>

      <ConfirmModal
        show={!!deleteTarget}
        title="Delete Document"
        message={`Are you sure you want to permanently delete "${deleteTarget?.documentName}"?`}
        confirmText="Delete"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default SearchDocuments;
