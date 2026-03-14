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

const topStatusFromReport = (report, t) => {
  if (report?.status === 4) return { label: t('myReport.rejected'), className: 'status-pill status-rejected' };
  if (report?.status === 3) return { label: t('myReport.resolved'), className: 'status-pill status-finished' };
  if (report?.status === 2) return { label: t('myReport.inProgress'), className: 'status-pill status-in-progress' };
  if (report?.validationStatus === 1) return { label: t('myReport.accepted'), className: 'status-pill status-accepted' };
  if (report?.status === 1) return { label: t('myReport.notAuthorized'), className: 'status-pill status-not-authorized' };
  return { label: t('myReport.unknown'), className: 'status-pill status-unknown' };
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const getFallbackHistoryItems = (report, t) => {
  const items = [
    {
      text: t('myReport.reportSubmitted'),
      badge: t('myReport.notAuthorized'),
      badgeClass: 'status-not-authorized',
      date: formatDate(report.createDate),
    },
  ];

  if (report.validationStatus === 1) {
    items.push({
      text: t('myReport.reportAuthorized'),
      badge: t('myReport.accepted'),
      badgeClass: 'status-accepted',
      date: formatDate(report.modifiedDate || report.createDate),
    });
  }

  if (report.status >= 2) {
    items.push({
      text: report.assignedToUserName ? t('myReport.assignedTo', { name: report.assignedToUserName }) : t('myReport.assignedPublicWorks'),
      badge: t('myReport.inProgress'),
      badgeClass: 'status-in-progress',
      date: formatDate(report.modifiedDate || report.createDate),
    });
  }

  if (report.status === 3) {
    items.push({
      text: t('myReport.repaired'),
      badge: t('myReport.resolved'),
      badgeClass: 'status-finished',
      date: formatDate(report.resolvedDate || report.closedDate || report.modifiedDate),
    });
  }

  if (report.status === 4) {
    items.push({
      text: report.rejectionReason || t('myReport.reportRejected'),
      badge: t('myReport.rejected'),
      badgeClass: 'status-rejected',
      date: formatDate(report.modifiedDate),
    });
  }

  return items;
};

const badgeTypeToClass = (badgeType, badgeLabel) => {
  const normalized = String(badgeType || '').toLowerCase();
  if (normalized === 'accepted') return 'status-accepted';
  if (normalized === 'not_authorized') return 'status-not-authorized';
  if (normalized === 'in_progress') return 'status-in-progress';
  if (normalized === 'finished') return 'status-finished';
  if (normalized === 'rejected') return 'status-rejected';

  const byLabel = String(badgeLabel || '').toLowerCase();
  if (byLabel.includes('accept')) return 'status-accepted';
  if (byLabel.includes('not authorized')) return 'status-not-authorized';
  if (byLabel.includes('in progress')) return 'status-in-progress';
  if (byLabel.includes('finish')) return 'status-finished';
  if (byLabel.includes('reject')) return 'status-rejected';
  return 'status-unknown';
};

const MyReport = ({ user }) => {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('');
  const [reports, setReports] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
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
        setError(t('myReport.missingContext'));
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
          payload.status = String(statusFilter);
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
          throw new Error(data?.message || t('myReport.failedLoad'));
        }

        setReports(data?.data || []);
        setVisibleCount(5);
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
        setError(fetchError.message || t('myReport.failedLoad'));
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [groupId, userId, statusFilter]);

  const stats = useMemo(
    () => [
      { label: t('myReport.totalReports'), value: counters.total, color: 'text-white' },
      { label: t('myReport.pending'), value: counters.pending, color: 'text-warning' },
      { label: t('myReport.inProgress'), value: counters.inProgress, color: 'text-info' },
      { label: t('myReport.resolved'), value: counters.resolved, color: 'text-success' },
      { label: t('myReport.rejected'), value: counters.rejected, color: 'text-danger' },
    ],
    [counters, t]
  );

  if (!hasLiferayUser) {
    return (
      <div className="report-wrapper">
        <div className="auth-popup-card">
          <h3>{t('myReport.loginRequired')}</h3>
          <p>{t('myReport.loginPrompt')}</p>
          <div className="auth-popup-actions">
            <a href="/web/guest/login" className="auth-popup-btn">{t('myReport.login')}</a>
            <Link to="/register" className="auth-popup-btn secondary">{t('myReport.register')}</Link>
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
            <option value="1">{t('myReport.pending')}</option>
            <option value="2">{t('myReport.inProgress')}</option>
            <option value="3">{t('myReport.resolved')}</option>
            <option value="4">{t('myReport.rejected')}</option>
          </select>
        </div>

        {loading && (
          <div className="glass-card p-4 text-white-50">
            {t('myReport.loadingReports')}
          </div>
        )}

        {!loading && !!error && (
          <div className="glass-card p-4 text-danger">
            {error}
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="glass-card p-4 text-white-50">
            {t('myReport.noReports')}
          </div>
        )}

        {!loading && !error && reports.slice(0, visibleCount).map((report) => {
          const history = Array.isArray(report.statusHistory) && report.statusHistory.length > 0
            ? report.statusHistory.map((row) => ({
              text: row?.text || t('myReport.reportUpdated'),
              badge: row?.badge || t('myReport.updated'),
              badgeClass: badgeTypeToClass(row?.badgeType, row?.badge),
              date: formatDate(row?.date),
            }))
            : getFallbackHistoryItems(report, t);
          const topStatus = topStatusFromReport(report, t);
          return (
            <div key={report.reportId} className="my-report-card mb-3">
              <div className="my-report-top-row">
                <div className="my-report-top-left">
                  <span className="report-chip report-chip-category">{report.category || 'N/A'}</span>
                  <span className={topStatus.className}>{topStatus.label}</span>
                </div>
                <div className="my-report-top-right">
                  <small className="report-code">RPT-{report.reportId}</small>
                </div>
              </div>

              <h4 className="my-report-title text-capitalize">{report.title || '-'}</h4>
              <p className="my-report-description">{report.description || '-'}</p>

              <div className="my-report-meta">
                <span className='text-capitalize'>{t('myReport.location')} {report.locationText || '-'}</span>
                <span>{formatDate(report.createDate)}</span>
              </div>

              <div className="my-report-note">
                {report.status === 3 ? t('myReport.issueResolved') : t('myReport.teamWorking')}
              </div>

              <div className="my-report-divider" />

              <h6 className="my-report-history-title">{t('myReport.statusHistory')}</h6>
              <div className="my-report-history-list">
                {history.map((item, index) => (
                  <div className="my-report-history-item" key={`${report.reportId}-${index}`}>
                    <div className="history-dot" />
                    <div className="history-content">
                      <div className="history-line-main">
                        <span>{item.text}</span>
                        <span className={`history-badge ${item.badgeClass}`}>{item.badge}</span>
                      </div>
                      <small className="history-date">{item.date}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {!loading && !error && visibleCount < reports.length && (
          <div className="text-center mt-4">
            <button
              className="btn btn-outline-info px-4 py-2 rounded-pill"
              onClick={() => setVisibleCount(prev => prev + 5)}
              style={{ fontWeight: 500, letterSpacing: '0.5px' }}
            >
              {t('myReport.loadMore')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReport;
