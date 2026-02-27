import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const parseJsonSafely = (raw) => {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const statusLabel = (status) => {
  if (status === 1) return 'Pending';
  if (status === 2) return 'In Progress';
  if (status === 3) return 'Resolved';
  if (status === 4) return 'Rejected';
  return 'Unknown';
};

const statusClass = (status) => {
  if (status === 1) return 'bg-warning text-dark';
  if (status === 2) return 'bg-info text-dark';
  if (status === 3) return 'bg-success';
  if (status === 4) return 'bg-danger';
  return 'bg-secondary';
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
};

const MyReport = ({ user }) => {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('');
  const [reports, setReports] = useState([]);
  const [counters, setCounters] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const groupId = user?.groups?.[0]?.id;
  const userId = user?.userId;
  const hasLiferayUser = !!user;

  useEffect(() => {
    const fetchReports = async () => {
      if (!groupId || !userId) {
        setError('Missing user/group context. Please login again.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const token = sessionStorage.getItem('token');
        const payload = {
          groupId: String(groupId),
          userId: String(userId),
        };
        if (statusFilter) {
          payload.status = Number(statusFilter);
        }

        const response = await fetch(`${API_BASE_URL}/o/endUserCitizen/getMyReports`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        const raw = await response.text();
        const data = parseJsonSafely(raw);

        if (!response.ok || !data?.success) {
          throw new Error(data?.message || 'Failed to load reports.');
        }

        setReports(data?.data || []);
        setCounters(
          data?.counters || {
            total: 0,
            pending: 0,
            inProgress: 0,
            resolved: 0,
            rejected: 0,
          }
        );
      } catch (fetchError) {
        setError(fetchError.message || 'Failed to load reports.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [groupId, userId, statusFilter]);

  const stats = useMemo(
    () => [
      { label: 'Total Reports', value: counters.total, color: 'text-white' },
      { label: 'Pending', value: counters.pending, color: 'text-warning' },
      { label: 'In Progress', value: counters.inProgress, color: 'text-info' },
      { label: 'Resolved', value: counters.resolved, color: 'text-success' },
      { label: 'Rejected', value: counters.rejected, color: 'text-danger' },
    ],
    [counters]
  );

  if (!hasLiferayUser) {
    return (
      <div className="report-dashboard py-5">
        <div className="container">
          <div className="auth-popup-card auth-popup-card-wide">
            <h3>Login Required</h3>
            <p>Register or login to see your reports.</p>
            <div className="auth-popup-actions">
              <a href="/web/guest/login" className="auth-popup-btn">Login</a>
              <Link to="/register" className="auth-popup-btn secondary">Register</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="report-dashboard py-5">
      <div className="container">
        <header className="mb-4">
          <h2 className="text-white">{t('myReport.title')}</h2>
          <p className="text-info opacity-75">{t('myReport.subtitle')}</p>
        </header>

        <div className="row g-3 mb-4">
          {stats.map((stat) => (
            <div key={stat.label} className="col">
              <div className="glass-card p-3 h-100">
                <small className="d-block text-white-50 mb-2" style={{ fontSize: '0.7rem' }}>
                  {stat.label.toUpperCase()}
                </small>
                <h3 className={`fw-bold m-0 ${stat.color}`}>{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-2 mb-4 d-flex align-items-center">
          <div className="px-3 border-end border-white-10">
            <span className="text-info">{t('myReport.filter')}</span>
          </div>
          <select
            className="form-select bg-transparent border-0 text-white-50 shadow-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{t('myReport.allReports')}</option>
            <option value="1">Pending</option>
            <option value="2">In Progress</option>
            <option value="3">Resolved</option>
            <option value="4">Rejected</option>
          </select>
        </div>

        {loading && (
          <div className="glass-card p-4 text-white-50">
            Loading reports...
          </div>
        )}

        {!loading && !!error && (
          <div className="glass-card p-4 text-danger">
            {error}
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="glass-card p-4 text-white-50">
            No reports found.
          </div>
        )}

        {!loading && !error && reports.map((report) => (
          <div key={report.reportId} className="glass-card p-4 shadow-lg border-0 mb-3">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <span className="badge rounded-pill bg-purple-soft me-2">{report.category || 'N/A'}</span>
                <span className={`badge rounded-pill ${statusClass(report.status)}`}>
                  {statusLabel(report.status)}
                </span>
              </div>
              <div className="text-end">
                <small className="d-block text-info opacity-50">RPT-{report.reportId}</small>
              </div>
            </div>

            <h4 className="text-white mb-2">{report.title || '-'}</h4>
            <p className="text-white-50 small mb-3">{report.description || '-'}</p>

            <div className="d-flex gap-4 mb-3 text-white-50 small">
              <span>Location: {report.locationText || '-'}</span>
              <span>Date: {formatDate(report.createDate)}</span>
            </div>

            <div className="text-white-50 small border-top border-white-10 pt-3 d-flex gap-4 flex-wrap">
              <span>Attachments: {report.attachmentCount || 0}</span>
              <span>Validation: {report.validationStatus === 1 ? 'Validated' : 'Unvalidated'}</span>
              {report.validationRemarks ? <span>Remarks: {report.validationRemarks}</span> : null}
              {report.rejectionReason ? <span>Rejection: {report.rejectionReason}</span> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyReport;
