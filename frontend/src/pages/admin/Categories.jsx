import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Loading from '../../components/Loading';
import ConfirmModal from '../../components/ConfirmModal';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal form state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [categoryId, setCategoryId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCategories();
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

  const openAddModal = () => {
    setModalMode('add');
    setCategoryId(null);
    setName('');
    setDescription('');
    setShowModal(true);
    setError('');
  };

  const openEditModal = (cat) => {
    setModalMode('edit');
    setCategoryId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
    setShowModal(true);
    setError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Category name is required.');
      return;
    }

    try {
      setFormLoading(true);
      if (modalMode === 'add') {
        const res = await adminService.createCategory({ name: name.trim(), description: description.trim() });
        if (res.success) {
          setSuccess(`Category "${name}" created successfully.`);
          setShowModal(false);
          fetchCategories();
        }
      } else {
        const res = await adminService.updateCategory(categoryId, { name: name.trim(), description: description.trim() });
        if (res.success) {
          setSuccess(`Category "${name}" updated successfully.`);
          setShowModal(false);
          fetchCategories();
        }
      }
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.documentCount > 0) {
      alert(`Safety constraint: Cannot delete category "${deleteTarget.name}" because it currently contains ${deleteTarget.documentCount} document(s). Please move or delete the associated documents first.`);
      setDeleteTarget(null);
      return;
    }

    try {
      setDeleteLoading(true);
      const res = await adminService.deleteCategory(deleteTarget.id);
      if (res.success) {
        setSuccess(`Category "${deleteTarget.name}" deleted.`);
        setDeleteTarget(null);
        fetchCategories();
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete category.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading category management..." />;
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Manage Categories</h3>
          <p className="text-muted mb-0 small">
            Configure taxonomies and view real-time document counts per classification
          </p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary-custom d-flex align-items-center gap-2">
          <i className="bi bi-plus-lg"></i>
          <span>Add New Category</span>
        </button>
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
                <th>Category Name</th>
                <th>Description</th>
                <th>Active Documents</th>
                <th>Created Date</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="small text-muted">#{cat.id}</td>
                  <td>
                    <span className="fw-bold text-dark">{cat.name}</span>
                  </td>
                  <td className="small text-secondary" style={{ maxWidth: '300px' }}>
                    {cat.description || '—'}
                  </td>
                  <td>
                    <span className={`badge ${cat.documentCount > 0 ? 'bg-primary-subtle text-primary border' : 'bg-light text-muted border'}`}>
                      {cat.documentCount} {cat.documentCount === 1 ? 'file' : 'files'}
                    </span>
                  </td>
                  <td className="small text-secondary">
                    {new Date(cat.createdAt).toLocaleDateString()}
                  </td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => openEditModal(cat)}
                        title="Edit Category"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => setDeleteTarget(cat)}
                        title="Delete Category"
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

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {modalMode === 'add' ? 'Add New Category' : 'Edit Category'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body py-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Category Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Travel Visas"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-secondary">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Brief summary of records under this classification..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light px-4 rounded-3" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-custom px-4 rounded-3" disabled={formLoading}>
                    {formLoading && <span className="spinner-border spinner-border-sm me-1" role="status"></span>}
                    {modalMode === 'add' ? 'Create Category' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirm Modal */}
      <ConfirmModal
        show={!!deleteTarget}
        title="Delete Category"
        message={
          deleteTarget?.documentCount > 0
            ? `Cannot delete "${deleteTarget?.name}"! It currently has ${deleteTarget?.documentCount} active document(s). Reassign or delete them first.`
            : `Are you sure you want to delete category "${deleteTarget?.name}"? This action cannot be reversed.`
        }
        confirmText={deleteTarget?.documentCount > 0 ? 'Understood' : 'Delete Category'}
        confirmVariant={deleteTarget?.documentCount > 0 ? 'secondary' : 'danger'}
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminCategories;
