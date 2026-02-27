import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';

const categories = [
  'Street Lighting',
  'Potholes',
  'Garbage Collection',
  'Water/Sewage',
  'Park Maintenance',
  'Traffic Signals',
  'Graffiti',
  'Other',
];

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

const Report = ({ user }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    address: '',
    description: '',
    accept: false,
    image: null,
  });

  const [selectedCategory, setSelectedCategory] = useState('');
  const [errors, setErrors] = useState({});
  const hasLiferayUser = !!user;

  if (!hasLiferayUser) {
    return (
      <div className="report-wrapper">
        <div className="auth-popup-card">
          <h3>Login Required</h3>
          <p>Register or log in to report a problem.</p>
          <div className="auth-popup-actions">
            <a href="/web/guest/login" className="auth-popup-btn">Login</a>
            <Link to="/register" className="auth-popup-btn secondary">Register</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerMessage('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, image: file }));
    setServerMessage('');
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.subject.trim()) nextErrors.subject = t('reportForm.errors.subject');
    if (!selectedCategory) nextErrors.category = t('reportForm.errors.category');
    if (!formData.address.trim()) nextErrors.address = t('reportForm.errors.address');
    if (!formData.description.trim()) nextErrors.description = t('reportForm.errors.description');
    if (!formData.accept) nextErrors.accept = t('reportForm.errors.accept');

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      address: '',
      description: '',
      accept: false,
      image: null,
    });
    setSelectedCategory('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const groupId = user?.groups?.[0]?.id;
    const userId = user?.userId;

    if (!groupId || !userId) {
      setIsSuccess(false);
      setServerMessage('Missing user/group context. Please login again.');
      return;
    }

    setSubmitting(true);
    setServerMessage('');
    setIsSuccess(false);

    try {
      const token = sessionStorage.getItem('token');
      const payload = new FormData();
      payload.append('groupId', String(groupId));
      payload.append('userId', String(userId));
      payload.append('title', formData.subject.trim());
      payload.append('description', formData.description.trim());
      payload.append('category', selectedCategory);
      payload.append('locationText', formData.address.trim());
      if (formData.image) {
        payload.append('files', formData.image);
      }

      const response = await fetch(`${API_BASE_URL}/o/endUserCitizen/addCitizenReport`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: payload,
      });

      const raw = await response.text();
      const data = parseJsonSafely(raw);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to submit report.');
      }

      setIsSuccess(true);
      setServerMessage(data?.message || 'Report submitted successfully');
      resetForm();
    } catch (error) {
      setIsSuccess(false);
      setServerMessage(error.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="report-wrapper">
      <div className="report-card">
        <h2 className="report-title">{t('reportForm.title')}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('reportForm.subject')}</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder={t('reportForm.subjectPlaceholder')}
            />
            {errors.subject && <span className="error">{errors.subject}</span>}
          </div>

          <div className="form-group">
            <label>{t('reportForm.category')}</label>
            <div className="category-grid">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(cat);
                    if (errors.category) {
                      setErrors((prev) => ({ ...prev, category: '' }));
                    }
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            {errors.category && <span className="error">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label>{t('reportForm.address')}</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder={t('reportForm.addressPlaceholder')}
            />
            {errors.address && <span className="error">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label>{t('reportForm.description')}</label>
            <textarea
              rows="4"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('reportForm.descriptionPlaceholder')}
            />
            {errors.description && <span className="error">{errors.description}</span>}
          </div>

          <div className="photo-upload-container">
            <label className="photo-label">{t('reportForm.uploadLabel')}</label>
            <div className="upload-dropzone" onClick={() => fileInputRef.current?.click()}>
              <div className="upload-ui">
                <div className="camera-icon-wrapper">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#00D2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <p className="upload-text">
                  {formData.image ? formData.image.name : t('reportForm.uploadTextDefault')}
                </p>
                <button type="button" className="choose-photo-button">
                  <span style={{ fontSize: '18px', marginRight: '5px' }}>^</span> {t('reportForm.uploadChoose')}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*,video/*"
                  style={{ display: 'none' }}
                />
              </div>
            </div>
            <p className="upload-footer-text">{t('reportForm.uploadFooter')}</p>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="accept"
              name="accept"
              checked={formData.accept}
              onChange={handleChange}
            />
            <label htmlFor="accept">{t('reportForm.acceptText')}</label>
          </div>
          {errors.accept && <span className="error">{errors.accept}</span>}

          {!!serverMessage && (
            <p className="upload-text" style={{ color: isSuccess ? '#16a34a' : '#ff9aa2' }}>
              {serverMessage}
            </p>
          )}

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Submitting...' : t('reportForm.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Report;
