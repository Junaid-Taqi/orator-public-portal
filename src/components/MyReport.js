import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useTranslation } from '../i18n';
import {
    faEye
} from "@fortawesome/free-solid-svg-icons";


const MyReport = () => {
  const { t } = useTranslation();
  const stats = [
    { label: 'Total Reports', value: 4, color: 'text-white' },
    { label: 'Not Authorized', value: 1, color: 'text-warning' },
    { label: 'Accepted', value: 1, color: 'text-info' },
    { label: 'In Progress', value: 1, color: 'text-primary' },
    { label: 'Finished', value: 1, color: 'text-success' },
  ];

  return (
    <div className="report-dashboard py-5">
      <div className="container">
        {/* Header */}
        <header className="mb-4">
          <h2 className="text-white">{t('myReport.title')}</h2>
          <p className="text-info opacity-75">{t('myReport.subtitle')}</p>
        </header>

        {/* Stats Row */}
        <div className="row g-3 mb-4">
          {stats.map((stat, i) => (
            <div key={i} className="col">
              <div className="glass-card p-3 h-100">
                <small className="d-block text-white-50 mb-2" style={{ fontSize: '0.7rem' }}>
                  {stat.label.toUpperCase()}
                </small>
                <h3 className={`fw-bold m-0 ${stat.color}`}>{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="glass-card p-2 mb-4 d-flex align-items-center">
          <div className="px-3 border-end border-white-10">
            <span className="text-info">{t('myReport.filter')}</span>
          </div>
          <select className="form-select bg-transparent border-0 text-white-50 shadow-none">
            <option>{t('myReport.allReports')}</option>
          </select>
        </div>

        {/* Main Report Detail */}
        <div className="glass-card p-4 shadow-lg border-0">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <span className="badge rounded-pill bg-purple-soft me-2">Street Lighting</span>
              <span className="badge rounded-pill bg-success-soft text-success border border-success">✓ {t('myReport.resolvedNote')}</span>
            </div>
            <div className="text-end">
              <small className="d-block text-info opacity-50">RPT-45782</small>
              <a href="#" className="text-info text-decoration-none small"><FontAwesomeIcon icon="faEye" className="me-1" /> {t('myReport.viewDetails')}</a>
            </div>
          </div>

          <h4 className="text-white mb-2">Broken Street Light on Main St</h4>
          <p className="text-white-50 small mb-4">
            The street light near 123 Main Street has been out for 3 days, creating a safety hazard for pedestrians at night.
          </p>

          <div className="d-flex gap-4 mb-4 text-white-50 small">
            <span>📍 123 Main Street</span>
            <span>🕒 February 15, 2026</span>
          </div>

          <p className="text-white-50 fst-italic mb-5 border-top border-white-10 pt-3">{t('myReport.resolvedNote')}</p>

          {/* Status History Timeline */}
          <h6 className="text-white mb-4 text-uppercase small tracking-widest">{t('myReport.statusHistory')}</h6>
          <div className="timeline-container ps-3">
            <div className="timeline-item mb-4 pb-2">
              <div className="d-flex align-items-center gap-2">
                <span className="text-white">{t('myReport.reportSubmitted')}</span>
                <span className="badge bg-warning text-dark x-small">NOT AUTHORIZED</span>
              </div>
              <small className="text-muted d-block">February 15, 2026</small>
            </div>
            <div className="timeline-item mb-4 pb-2">
              <div className="d-flex align-items-center gap-2">
                <span className="text-white">{t('myReport.reportAuthorized')}</span>
                <span className="badge bg-info text-dark x-small">ACCEPTED</span>
              </div>
              <small className="text-muted d-block">February 16, 2026</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyReport;