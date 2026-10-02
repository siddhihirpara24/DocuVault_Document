import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import { categoryService } from '../../services/categoryService';
import Loading from '../../components/Loading';

const EditDocument = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [documentName, setDocumentName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [existingDoc, setExistingDoc] = useState(null);

  // File replacement state
  const [replaceFile, setReplaceFile] = useState(false);
  const [newFile, setNewFile] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [docRes, catRes] = await Promise.all([
          documentService.getDocumentById(id),
          categoryService.getAllCategories(),
        ]);

        if (docRes.success && docRes.data) {
          const doc = docRes.data;
          setExistingDoc(doc);
          setDocumentName(doc.documentName);
          setCategoryId(doc.categoryId || '');
          setDescription(doc.description || '');
        }

        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading document data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const ext = selected.name.split('.').pop().toLowerCase();

      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setError(`Unsupported file format .${ext}. Allowed formats: PDF, JPG, JPEG, PNG, DOC, DOCX.`);
        setNewFile(null);
        return;
      }

      if (selected.size > MAX_FILE_SIZE) {
        setError('New file exceeds the 10 MB limit.');
        setNewFile(null);
        return;
      }

      setError('');
      setNewFile(selected);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!documentName.trim()) {
      setError('Document Name is required.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('documentName', documentName.trim());
      if (categoryId) {
        formData.append('categoryId', categoryId);
      }
      formData.append('description', description.trim());
      if (replaceFile && newFile) {
        formData.append('file', newFile);
      }

      const res = await documentService.updateDocument(id, formData);
      if (res.success) {
        navigate('/documents');
      } else {
        setError(res.message || 'Update failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating document.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading message="Loading document details..." />;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Edit Document</h3>
          <p className="text-muted mb-0 small">
            Update document metadata or safely replace the stored physical file
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
        {/* Existing file metadata badge */}
        <div className="card bg-light border-0 rounded-3 p-3 mb-4">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-file-earmark-text fs-4 text-primary"></i>
              <div>
                <span className="fw-bold text-dark d-block">{existingDoc?.originalFilename}</span>
                <span className="text-muted small">
                  Type: {existingDoc?.fileType?.toUpperCase()} • Size: {existingDoc?.fileSizeFormatted}
                </span>
              </div>
            </div>
            <span className="badge bg-secondary-subtle text-secondary border">Stored File</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-3">
            <div className="col-md-7">
              <label className="form-label small fw-semibold text-secondary">Document Title / Name *</label>
              <input
                type="text"
                className="form-control"
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
                <option value="">Uncategorized</option>
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          {/* Replace file toggle */}
          <div className="border rounded-3 p-3 mb-4 bg-light">
            <div className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="replaceFileSwitch"
                checked={replaceFile}
                onChange={(e) => {
                  setReplaceFile(e.target.checked);
                  if (!e.target.checked) setNewFile(null);
                }}
              />
              <label className="form-check-label fw-semibold text-dark" htmlFor="replaceFileSwitch">
                Replace Existing Stored File
              </label>
            </div>
            <p className="text-muted small mb-2">
              Check this option if you want to upload a revised version of this file. The old file will be deleted safely.
            </p>

            {replaceFile && (
              <div className="mt-3">
                <input
                  type="file"
                  className="form-control"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileChange}
                />
                {newFile && (
                  <div className="mt-2 small text-success fw-semibold">
                    <i className="bi bi-check-circle me-1"></i>
                    Selected: {newFile.name} ({(newFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="d-flex justify-content-end gap-2">
            <Link to="/documents" className="btn btn-light border px-4">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary-custom px-4 d-flex align-items-center gap-2"
              disabled={submitting}
            >
              {submitting && <span className="spinner-border spinner-border-sm" role="status"></span>}
              <i className="bi bi-save"></i>
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDocument;
