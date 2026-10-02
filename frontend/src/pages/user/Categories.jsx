import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { documentService } from '../../services/documentService';
import Loading from '../../components/Loading';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryDocs, setCategoryDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAllCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      } else {
        setError(res.message || 'Error fetching categories.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSelectCategory = async (cat) => {
    setSelectedCategory(cat);
    try {
      setDocsLoading(true);
      const res = await categoryService.getCategoryDocuments(cat.id);
      if (res.success && res.data) {
        setCategoryDocs(res.data);
      }
    } catch (err) {
      console.error('Error fetching category docs:', err);
    } finally {
      setDocsLoading(false);
    }
  };

  const getCategoryIcon = (name) => {
    const n = name?.toLowerCase();
    if (n.includes('education')) return { icon: 'bi-mortarboard-fill', variant: 'success' };
    if (n.includes('identity')) return { icon: 'bi-person-badge-fill', variant: 'info' };
    if (n.includes('career')) return { icon: 'bi-briefcase-fill', variant: 'primary' };
    if (n.includes('financial')) return { icon: 'bi-cash-coin', variant: 'warning' };
    if (n.includes('bills')) return { icon: 'bi-receipt', variant: 'danger' };
    if (n.includes('certificates')) return { icon: 'bi-award-fill', variant: 'purple' };
    if (n.includes('medical')) return { icon: 'bi-heart-pulse-fill', variant: 'danger' };
    return { icon: 'bi-folder-fill', variant: 'primary' };
  };

  if (loading) {
    return <Loading message="Loading document categories..." />;
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Document Categories</h3>
          <p className="text-muted mb-0 small">
            Organize and classify personal documents into dedicated operational vaults
          </p>
        </div>
        <Link to="/upload" className="btn btn-primary-custom d-flex align-items-center gap-2">
          <i className="bi bi-cloud-arrow-up-fill"></i>
          <span>Upload into Category</span>
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 rounded-3 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <div>{error}</div>
        </div>
      )}

      {/* Category Grid Cards */}
      <div className="row g-3 mb-4">
        {categories.map((cat) => {
          const { icon, variant } = getCategoryIcon(cat.name);
          const isSelected = selectedCategory?.id === cat.id;

          return (
            <div className="col-12 col-sm-6 col-lg-3" key={cat.id}>
              <div
                className={`stat-card cursor-pointer h-100 ${isSelected ? 'border-primary shadow-sm bg-primary-subtle' : ''}`}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                onClick={() => handleSelectCategory(cat)}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className={`stat-icon ${variant}`}>
                    <i className={`bi ${icon}`}></i>
                  </div>
                  <span className="badge bg-light text-dark border px-2 py-1 rounded-pill small">
                    {cat.documentCount} {cat.documentCount === 1 ? 'doc' : 'docs'}
                  </span>
                </div>
                <h6 className="fw-bold text-dark mb-1">{cat.name}</h6>
                <p className="text-muted small mb-0 line-clamp-2" style={{ fontSize: '0.8rem' }}>
                  {cat.description || 'Personal category files'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Category Documents Section */}
      {selectedCategory && (
        <div className="content-card">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
            <div>
              <h5 className="fw-bold text-dark mb-0">
                Documents in <span className="text-primary">{selectedCategory.name}</span>
              </h5>
              <span className="text-muted small">
                Showing your personal files filed under this classification
              </span>
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="btn btn-sm btn-light border"
            >
              <i className="bi bi-x-lg me-1"></i> Close View
            </button>
          </div>

          {docsLoading ? (
            <Loading message={`Loading ${selectedCategory.name} documents...`} />
          ) : categoryDocs.length > 0 ? (
            <div className="table-responsive">
              <table className="table custom-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Document Name</th>
                    <th>File Type</th>
                    <th>Size</th>
                    <th>Upload Date</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryDocs.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <Link to={`/documents/${doc.id}`} className="fw-semibold text-dark text-decoration-none">
                          {doc.documentName}
                        </Link>
                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                          {doc.originalFilename}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border px-2 py-1 rounded-pill">
                          {doc.fileType?.toUpperCase()}
                        </span>
                      </td>
                      <td className="small text-secondary">{doc.fileSizeFormatted}</td>
                      <td className="small text-secondary">
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </td>
                      <td className="text-end">
                        <Link to={`/documents/${doc.id}`} className="btn btn-sm btn-outline-primary me-1">
                          View
                        </Link>
                        <button
                          onClick={() => documentService.downloadDocument(doc.id, doc.originalFilename)}
                          className="btn btn-sm btn-outline-secondary"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted small mb-3">No documents uploaded under {selectedCategory.name} yet.</p>
              <Link to="/upload" className="btn btn-sm btn-primary-custom">
                Upload Document Now
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Categories;
