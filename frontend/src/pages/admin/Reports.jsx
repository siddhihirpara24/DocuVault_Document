import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Loading from '../../components/Loading';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await adminService.getReports();
        if (res.success && res.data) {
          setReport(res.data);
        } else {
          setError(res.message || 'Error compiling administrative report.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to retrieve reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!report) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'DOCUVAULT ADMINISTRATIVE REPORT\r\n';
    csvContent += `Generated On: ${new Date().toLocaleString()}\r\n\r\n`;

    csvContent += 'OVERVIEW METRICS\r\n';
    csvContent += `Total Users,${report.totalUsers}\r\n`;
    csvContent += `Active Users,${report.activeUsers}\r\n`;
    csvContent += `Inactive Users,${report.inactiveUsers}\r\n`;
    csvContent += `Total Documents,${report.totalDocuments}\r\n`;
    csvContent += `Most Used Category,${report.mostUsedCategory}\r\n\r\n`;

    csvContent += 'DOCUMENTS BY CATEGORY\r\n';
    csvContent += 'Category,Count\r\n';
    Object.entries(report.documentsByCategory || {}).forEach(([cat, count]) => {
      csvContent += `"${cat}",${count}\r\n`;
    });
    csvContent += '\r\n';

    csvContent += 'DOCUMENTS BY FILE TYPE\r\n';
    csvContent += 'File Type,Count\r\n';
    Object.entries(report.documentsByFileType || {}).forEach(([type, count]) => {
      csvContent += `"${type}",${count}\r\n`;
    });
    csvContent += '\r\n';

    csvContent += 'MONTHLY UPLOAD TIMELINE\r\n';
    csvContent += 'Month,Uploads\r\n';
    Object.entries(report.documentsByMonth || {}).forEach(([month, count]) => {
      csvContent += `"${month}",${count}\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DocuVault_Audit_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <Loading message="Compiling administrative intelligence report..." />;
  }

  const totalDocs = report?.totalDocuments || 1;

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Audit Reports & Analytics</h3>
          <p className="text-muted mb-0 small">
            Consolidated intelligence metrics on user volume, document growth, and repository composition
          </p>
        </div>

        <div className="d-flex gap-2">
          <button onClick={handlePrint} className="btn btn-light border d-flex align-items-center gap-2">
            <i className="bi bi-printer"></i>
            <span>Print Report</span>
          </button>
          <button onClick={handleExportCSV} className="btn btn-primary-custom d-flex align-items-center gap-2">
            <i className="bi bi-file-earmark-spreadsheet"></i>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 rounded-3 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <div>{error}</div>
        </div>
      )}

      {/* Summary Stat Highlights */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <span className="text-muted small fw-semibold text-uppercase tracking-wider">Total Accounts</span>
            <h3 className="fw-bold text-dark mt-1 mb-0">{report?.totalUsers || 0}</h3>
            <span className="text-success small mt-1 d-block">
              {report?.activeUsers || 0} active ({Math.round(((report?.activeUsers || 0) / (report?.totalUsers || 1)) * 100)}%)
            </span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <span className="text-muted small fw-semibold text-uppercase tracking-wider">Total Stored Files</span>
            <h3 className="fw-bold text-dark mt-1 mb-0">{report?.totalDocuments || 0}</h3>
            <span className="text-muted small mt-1 d-block">Across all accounts</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <span className="text-muted small fw-semibold text-uppercase tracking-wider">Top Taxonomy</span>
            <h3 className="fw-bold text-primary mt-1 mb-0 text-truncate" style={{ fontSize: '1.4rem' }}>
              {report?.mostUsedCategory || 'None'}
            </h3>
            <span className="text-muted small mt-1 d-block">Most utilized classification</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <span className="text-muted small fw-semibold text-uppercase tracking-wider">Inactive Accounts</span>
            <h3 className="fw-bold text-dark mt-1 mb-0">{report?.inactiveUsers || 0}</h3>
            <span className="text-danger small mt-1 d-block">Deactivated by admin</span>
          </div>
        </div>
      </div>

      {/* Report Tables */}
      <div className="row g-4">
        {/* Category Breakdown Table */}
        <div className="col-lg-6">
          <div className="content-card h-100">
            <h5 className="fw-bold text-dark mb-3">Repository Documents by Category</h5>
            <div className="table-responsive">
              <table className="table custom-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Count</th>
                    <th>Proportion</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report?.documentsByCategory || {}).map(([cat, count]) => {
                    const percentage = Math.round((count / totalDocs) * 100);
                    return (
                      <tr key={cat}>
                        <td className="fw-semibold text-dark">{cat}</td>
                        <td>{count} files</td>
                        <td style={{ width: '40%' }}>
                          <div className="d-flex align-items-center gap-2">
                            <div className="progress flex-1" style={{ height: '6px', width: '100%' }}>
                              <div
                                className="progress-bar bg-primary"
                                role="progressbar"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="small text-muted">{percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* File Format Distribution */}
        <div className="col-lg-6">
          <div className="content-card h-100">
            <h5 className="fw-bold text-dark mb-3">Format & MIME Distribution</h5>
            <div className="table-responsive">
              <table className="table custom-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Extension</th>
                    <th>Count</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report?.documentsByFileType || {}).map(([type, count]) => {
                    const percentage = Math.round((count / totalDocs) * 100);
                    return (
                      <tr key={type}>
                        <td>
                          <span className="badge bg-light text-dark border">{type}</span>
                        </td>
                        <td>{count} files</td>
                        <td style={{ width: '40%' }}>
                          <div className="d-flex align-items-center gap-2">
                            <div className="progress flex-1" style={{ height: '6px', width: '100%' }}>
                              <div
                                className="progress-bar bg-success"
                                role="progressbar"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="small text-muted">{percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Monthly Upload Timeline */}
        <div className="col-12">
          <div className="content-card">
            <h5 className="fw-bold text-dark mb-3">Monthly Ingestion Cadence</h5>
            {Object.keys(report?.documentsByMonth || {}).length > 0 ? (
              <div className="table-responsive">
                <table className="table custom-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Uploads Ingested</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(report.documentsByMonth).map(([month, count]) => (
                      <tr key={month}>
                        <td className="fw-bold text-dark">{month}</td>
                        <td>{count} document(s)</td>
                        <td>
                          <span className="badge bg-success-subtle text-success border">Normal Ingestion</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted small mb-0">No monthly metrics logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
