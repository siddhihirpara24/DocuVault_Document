import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import Loading from '../../components/Loading';

const ViewDocument = () => {
  const { id } = useParams();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoading(true);
        const res = await documentService.getDocumentById(id);
        if (res.success && res.data) {
          setDocument(res.data);
          // If PDF or image, fetch blob preview
          const ext = res.data.fileType?.toLowerCase();
          if (['pdf', 'png', 'jpg', 'jpeg'].includes(ext)) {
            loadPreview();
          }
        } else {
          setError(res.message || 'Could not load document.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching document.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();

    return () => {
      if (previewBlobUrl) {
        window.URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [id]);

  const loadPreview = async () => {
    try {
      setPreviewLoading(true);
      const url = await documentService.previewDocumentBlob(id);
      setPreviewBlobUrl(url);
    } catch (err) {
      console.warn('Preview blob fetch failed, falling back to info view:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!document) return;
    try {
      await documentService.downloadDocument(document.id, document.originalFilename);
    } catch (err) {
      alert('Error downloading document: ' + (err.response?.data?.message || err.message));
    }
  };

  const isPdf = document?.fileType?.toLowerCase() === 'pdf';
  const isImage = ['png', 'jpg', 'jpeg'].includes(document?.fileType?.toLowerCase());

  if (loading) {
    return <Loading message="Loading document viewer..." />;
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary-subtle text-primary border px-2 py-1 rounded-pill">
              {document?.categoryName || 'General'}
            </span>
            <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill">
              {document?.fileType?.toUpperCase()}
            </span>
          </div>
          <h3 className="fw-bold text-dark mb-0">{document?.documentName}</h3>
        </div>

        <div className="d-flex gap-2">
          <Link to="/documents" className="btn btn-light border d-flex align-items-center gap-1">
            <i className="bi bi-arrow-left"></i>
            <span>Back to List</span>
          </Link>
          <Link to={`/documents/${id}/edit`} className="btn btn-outline-secondary d-flex align-items-center gap-1">
            <i className="bi bi-pencil"></i>
            <span>Edit</span>
          </Link>
          <button onClick={handleDownload} className="btn btn-primary-custom d-flex align-items-center gap-2">
            <i className="bi bi-download"></i>
            <span>Download</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 rounded-3 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <div>{error}</div>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Preview area */}
        <div className="col-lg-8">
          <div className="content-card mb-0 h-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-eye text-primary"></i> Document Viewer
              </h6>
              {previewBlobUrl && (
                <a
                  href={previewBlobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-light border text-secondary"
                >
                  <i className="bi bi-box-arrow-up-right me-1"></i> Open in New Tab
                </a>
              )}
            </div>

            <div className="flex-1 d-flex align-items-center justify-content-center">
              {previewLoading ? (
                <Loading message="Rendering preview..." />
              ) : previewBlobUrl && isPdf ? (
                <iframe
                  src={previewBlobUrl}
                  title="PDF Preview"
                  className="preview-pdf-embed"
                />
              ) : previewBlobUrl && isImage ? (
                <div className="preview-container w-100">
                  <img
                    src={previewBlobUrl}
                    alt={document?.documentName}
                    className="preview-img"
                  />
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-file-earmark-lock fs-1 text-primary mb-3 d-block"></i>
                  <h6 className="fw-bold text-dark">Direct Browser Preview Not Supported</h6>
                  <p className="text-muted small mb-3" style={{ maxWidth: '400px' }}>
                    Files with extension <strong>.{document?.fileType?.toUpperCase()}</strong> can be safely viewed
                    by downloading the original file to your device.
                  </p>
                  <button onClick={handleDownload} className="btn btn-primary-custom btn-sm">
                    <i className="bi bi-download me-1"></i> Download Original File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Metadata details */}
        <div className="col-lg-4">
          <div className="content-card mb-3">
            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Document Metadata</h6>

            <div className="mb-3">
              <span className="text-muted small d-block">Original Filename:</span>
              <span className="fw-semibold text-dark text-break small">{document?.originalFilename}</span>
            </div>

            <div className="mb-3">
              <span className="text-muted small d-block">Category:</span>
              <span className="badge bg-light text-dark border px-2 py-1 rounded-pill mt-1">
                {document?.categoryName || 'General'}
              </span>
            </div>

            <div className="mb-3">
              <span className="text-muted small d-block">File Size:</span>
              <span className="fw-semibold text-dark small">{document?.fileSizeFormatted}</span>
            </div>

            <div className="mb-3">
              <span className="text-muted small d-block">Upload Timestamp:</span>
              <span className="text-dark small">
                {document?.uploadDate && new Date(document.uploadDate).toLocaleString()}
              </span>
            </div>

            {document?.updatedAt && (
              <div className="mb-3">
                <span className="text-muted small d-block">Last Modified:</span>
                <span className="text-dark small">
                  {new Date(document.updatedAt).toLocaleString()}
                </span>
              </div>
            )}

            <div className="mb-0">
              <span className="text-muted small d-block">Description / Notes:</span>
              <p className="text-secondary small mt-1 mb-0 p-2 bg-light rounded border">
                {document?.description || 'No description provided for this document.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDocument;
