import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Loading from '../../components/Loading';

// Chart.js registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDashboard();
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError(res.message || 'Could not fetch admin metrics.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error connecting to admin APIs.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <Loading message="Loading administrative intelligence dashboard..." />;
  }

  // Prepare chart data
  const categoryLabels = Object.keys(data?.categoryBreakdown || {});
  const categoryValues = Object.values(data?.categoryBreakdown || {});

  const barChartData = {
    labels: categoryLabels.length > 0 ? categoryLabels : ['No Data'],
    datasets: [
      {
        label: 'Documents in Category',
        data: categoryValues.length > 0 ? categoryValues : [0],
        backgroundColor: '#6366f1',
        borderRadius: 8,
      },
    ],
  };

  const fileTypeLabels = Object.keys(data?.fileTypeBreakdown || {});
  const fileTypeValues = Object.values(data?.fileTypeBreakdown || {});

  const doughnutData = {
    labels: fileTypeLabels.length > 0 ? fileTypeLabels : ['None'],
    datasets: [
      {
        data: fileTypeValues.length > 0 ? fileTypeValues : [1],
        backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Administrative Control Center</h2>
          <p className="text-muted mb-0 small">
            System-wide overview of user registrations, vault storage activity, and categories
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/reports" className="btn btn-outline-primary d-flex align-items-center gap-1">
            <i className="bi bi-file-earmark-bar-graph"></i>
            <span>Generate Reports</span>
          </Link>
          <Link to="/admin/users" className="btn btn-primary-custom d-flex align-items-center gap-1">
            <i className="bi bi-people"></i>
            <span>Manage Users</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 rounded-3 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <div>{error}</div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase tracking-wider">Total Users</span>
                <h3 className="fw-bold text-dark mt-1 mb-0">{data?.totalUsers || 0}</h3>
                <span className="text-success small mt-1 d-block">
                  {data?.activeUsers || 0} Active Accounts
                </span>
              </div>
              <div className="stat-icon primary">
                <i className="bi bi-people-fill"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase tracking-wider">Vault Files</span>
                <h3 className="fw-bold text-dark mt-1 mb-0">{data?.totalDocuments || 0}</h3>
                <span className="text-muted small mt-1 d-block">Across all accounts</span>
              </div>
              <div className="stat-icon success">
                <i className="bi bi-files"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase tracking-wider">Categories</span>
                <h3 className="fw-bold text-dark mt-1 mb-0">{data?.totalCategories || 0}</h3>
                <span className="text-muted small mt-1 d-block">Configured taxonomies</span>
              </div>
              <div className="stat-icon info">
                <i className="bi bi-tags-fill"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase tracking-wider">Uploaded Today</span>
                <h3 className="fw-bold text-dark mt-1 mb-0">{data?.documentsUploadedToday || 0}</h3>
                <span className="text-primary small mt-1 d-block">Today's throughput</span>
              </div>
              <div className="stat-icon warning">
                <i className="bi bi-cloud-arrow-up-fill"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="content-card h-100">
            <h5 className="fw-bold text-dark mb-1">Documents by Category</h5>
            <p className="text-muted small mb-4">Distribution of stored records per active category</p>
            <div style={{ height: '300px' }}>
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="content-card h-100">
            <h5 className="fw-bold text-dark mb-1">File Formats</h5>
            <p className="text-muted small mb-4">MIME type proportions</p>
            <div style={{ height: '260px' }} className="d-flex align-items-center justify-content-center">
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users & Recent Documents Tables */}
      <div className="row g-4">
        {/* Recent Users */}
        <div className="col-lg-6">
          <div className="content-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Newly Registered Users</h5>
              <Link to="/admin/users" className="small text-primary text-decoration-none fw-semibold">
                Manage All &rarr;
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table custom-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentUsers?.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="fw-semibold text-dark">{u.fullName}</div>
                        <div className="text-muted small">{u.email}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{u.role}</span>
                      </td>
                      <td>
                        <span className={`badge ${u.status === 'ACTIVE' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="small text-secondary">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="col-lg-6">
          <div className="content-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">System-wide Recent Files</h5>
              <Link to="/admin/documents" className="small text-primary text-decoration-none fw-semibold">
                View All &rarr;
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table custom-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Owner</th>
                    <th>Category</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentDocuments?.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '150px' }}>
                          {doc.documentName}
                        </div>
                        <span className="badge bg-light text-secondary border small">{doc.fileType?.toUpperCase()}</span>
                      </td>
                      <td className="small text-secondary">{doc.userName}</td>
                      <td>
                        <span className="badge bg-light text-dark border">{doc.categoryName}</span>
                      </td>
                      <td className="small text-secondary">
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
