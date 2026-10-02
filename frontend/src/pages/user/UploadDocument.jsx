import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import { categoryService } from '../../services/categoryService';

const UploadDocument = () => {
  const navigate = useNavigate();

  const [documentName, setDocumentName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getAllCategories();
        if (res.success && res.data) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setCategoryId(res.data[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCats();
  }, []);

  const handleFileValidation = (selectedFile) => {
    if (!selectedFile) return;

    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError(`Unsupported file format .${ext}. Allowed formats: PDF, JPG, JPEG, PNG, DOC, DOCX.`);
      setFile(null);
      return false;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size exceeds 10 MB limit.');
      setFile(null);
      return false;
    }

    setError('');
    setFile(selectedFile);
    if (!documentName) {
      // Auto-populate document name from filename (without extension)
      const nameWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
      setDocumentName(nameWithoutExt);
    }
    return true;
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileValidation(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileValidation(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!documentName.trim()) {
      setError('Document Name is required.');
      return;
    }

    if (!file) {
      setError('Please select or drop a valid document file.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('documentName', documentName.trim());
      if (categoryId) {
        formData.append('categoryId', categoryId);
      }
      formData.append('description', description.trim());
      formData.append('file', file);

      const res = await documentService.uploadDocument(formData);
      if (res.success) {
        navigate('/documents');
      } else {
        setError(res.message || 'Upload failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while uploading document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Upload New Document</h3>
          <p className="text-muted mb-0 small">
            Store documents securely with server-side validation and automated metadata indexing
          </p>
        </div>
        <Link to="/documents" className="btn btn-light border btn-sm">
          &larr; Back to Documents
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 rounded-3 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <div>{error}</div>
        </div>
      )}

      <div className="content-card">
        <form onSubmit={handleSubmit}>
          {/* File Dropzone */}
          <div className="mb-4">
            <label className="form-label small fw-semibold text-secondary">Document File *</label>
            <div
              className={`file-dropzone ${dragOver ? 'dragover' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileUploadInput').click()}
            >
              <input
                id="fileUploadInput"
                type="file"
                className="d-none"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileInputChange}
              />

              {file ? (
                <div className="py-2">
                  <i className="bi bi-file-earmark-check fs-1 text-success d-block mb-2"></i>
                  <h6 className="fw-bold text-dark mb-1">{file.name}</h6>
                  <p className="text-muted small mb-2">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('fileUploadInput').click();
                    }}
                  >
                    Choose Different File
                  </button>
                </div>
              ) : (
                <div className="py-2">
                  <i className="bi bi-cloud-arrow-up fs-1 text-primary d-block mb-2"></i>
                  <h6 className="fw-bold text-dark mb-1">Click to upload or drag and drop</h6>
                  <p className="text-muted small mb-2">
                    Allowed formats: <strong>PDF, JPG, JPEG, PNG, DOC, DOCX</strong>
                  </p>
                  <span className="badge bg-secondary-subtle text-secondary px-2 py-1">
                    Maximum size: 10 MB
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-7">
              <label className="form-label small fw-semibold text-secondary">Document Title / Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Master Degree Certificate"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                required
              />
            </div>

            <div className="col-md-5">
              <label className="form-label small fw-semibold text-secondary">Category</label>
              <select
                className="form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold text-secondary">Description / Remarks</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Add optional notes, validity dates, or document keywords..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <Link to="/documents" className="btn btn-light border px-4">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary-custom px-4 d-flex align-items-center gap-2"
              disabled={loading}
            >
              {loading && <span className="spinner-border spinner-border-sm" role="status"></span>}
              <i className="bi bi-check2-circle"></i>
              <span>Save & Upload</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadDocument;
