import { useEffect, useState } from 'react';
import { useTranslation } from '../i18n';
import './RegisterCitizen.css'; // Reusing styles from RegisterCitizen
import { serverUrl } from '../Services/Constants/Constants';

const API_BASE_URL = serverUrl;

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  gender: '',
  groupIds: [],
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: '',
};

function Settings({ user }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(initialForm);
  const [municipalities, setMunicipalities] = useState([]);
  const [municipalitiesStatus, setMunicipalitiesStatus] = useState('idle');
  const [loadStatus, setLoadStatus] = useState('idle');
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Account deletion state
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deleteForm, setDeleteForm] = useState({ reason: '', password: '' });
  const [deleteStatus, setDeleteStatus] = useState('idle');
  const [deleteErrors, setDeleteErrors] = useState({});
  const [deleteMessage, setDeleteMessage] = useState('');

  useEffect(() => {
    const fetchMunicipalities = async () => {
      setMunicipalitiesStatus('loading');
      try {
        const response = await fetch(`${API_BASE_URL}/o/endUserRegistrationApplication/getMunicipalities`, {
          method: 'GET',
          headers: { 
            Accept: 'application/json'
          },
        });

        const data = await response.json();
        if (!response.ok || !data?.success) {
          throw new Error(data?.message || t('registerCitizen.errors.fetchMunicipalities'));
        }

        setMunicipalities(data?.data || []);
        setMunicipalitiesStatus('succeeded');
      } catch (error) {
        setMunicipalitiesStatus('failed');
        console.error('Error fetching municipalities:', error);
      }
    };

    const fetchUserData = async () => {
      if (!user?.userId) return;
      setLoadStatus('loading');
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/o/endUserCitizen/getCitizenData?userId=${user.userId}`, {
          method: 'GET',
          headers: { 
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
        });

        const data = await response.json();
        if (!response.ok || !data?.success) {
          throw new Error(data?.message || 'Failed to load user data');
        }

        const citizen = data.data;
        setForm((prev) => ({
          ...prev,
          firstName: citizen.firstName || '',
          lastName: citizen.lastName || '',
          email: citizen.email || '',
          gender: citizen.gender || '',
          groupIds: citizen.groups ? citizen.groups.map(String) : [],
        }));
        setLoadStatus('succeeded');
      } catch (error) {
        setLoadStatus('failed');
        setServerMessage(error.message);
      }
    };

    fetchMunicipalities();
    fetchUserData();
  }, [user?.userId, t]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setServerMessage('');
    setIsSuccess(false);
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.firstName.trim()) {
      nextErrors.firstName = t('registerCitizen.errors.firstNameReq');
    }
    if (!form.lastName.trim()) {
      nextErrors.lastName = t('registerCitizen.errors.lastNameReq');
    }
    if (!form.email.trim()) {
      nextErrors.email = t('registerCitizen.errors.emailReq');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = t('registerCitizen.errors.emailInv');
    }
    if (!form.oldPassword) {
      nextErrors.oldPassword = t('settings.errors.passwordReq');
    }
    if (form.newPassword) {
      if (form.newPassword.length < 8) {
        nextErrors.newPassword = t('registerCitizen.errors.passwordMin');
      }
      if (form.newPassword !== form.confirmNewPassword) {
        nextErrors.confirmNewPassword = t('registerCitizen.errors.confirmPasswordMatch');
      }
    }
    if (form.groupIds.length === 0) {
      nextErrors.groupIds = t('registerCitizen.errors.municipalityReq');
    }
    if (!form.gender) {
      nextErrors.gender = t('registerCitizen.errors.genderReq');
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitStatus('loading');
    setErrors({});
    setServerMessage('');
    setIsSuccess(false);

    try {
      const payload = {
        userId: String(user.userId),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        oldPassword: form.oldPassword,
        newPassword: form.newPassword || '',
        groupIds: form.groupIds,
        gender: form.gender,
      };

      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/o/endUserCitizen/updateCitizen`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to update profile');
      }

      setSubmitStatus('succeeded');
      setIsSuccess(true);
      setServerMessage(t('settings.success'));
      setForm((prev) => ({ ...prev, oldPassword: '', newPassword: '', confirmNewPassword: '' }));
      
      // Reload page after a short delay to show success message
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setSubmitStatus('failed');
      setServerMessage(error.message);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!deleteForm.reason.trim()) nextErrors.reason = t('settings.deleteErrors.reasonReq');
    if (!deleteForm.password) nextErrors.password = t('settings.deleteErrors.passwordReq');

    if (Object.keys(nextErrors).length > 0) {
      setDeleteErrors(nextErrors);
      return;
    }

    setDeleteStatus('loading');
    setDeleteErrors({});
    setDeleteMessage('');

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/o/endUserCitizen/deleteAccount`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: String(user.userId),
          password: deleteForm.password,
          reason: deleteForm.reason.trim()
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to delete account');
      }

      setDeleteStatus('succeeded');
      setDeleteMessage(t('settings.deleteSuccess'));
      
      // Logout and refresh
      setTimeout(() => {
        window.location.href = '/c/portal/logout';
      }, 2000);
    } catch (error) {
      setDeleteStatus('failed');
      setDeleteMessage(error.message);
    }
  };

  if (loadStatus === 'loading') {
    return <div className="registration-page"><div className="registration-card"><h2>Loading...</h2></div></div>;
  }

  return (
    <div className="registration-page">
      <div className="registration-card">
        <h1>{t('settings.title')}</h1>
        <p className="registration-subtitle">{t('settings.subtitle')}</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="registration-grid">
            <div className="registration-field">
              <label>{t('registerCitizen.firstName')}</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder={t('registerCitizen.firstNamePlaceholder')}
              />
              {!!errors.firstName && <span className="registration-error">{errors.firstName}</span>}
            </div>

            <div className="registration-field">
              <label>{t('registerCitizen.lastName')}</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder={t('registerCitizen.lastNamePlaceholder')}
              />
              {!!errors.lastName && <span className="registration-error">{errors.lastName}</span>}
            </div>
          </div>

          <div className="registration-grid">
            <div className="registration-field">
              <label>{t('registerCitizen.email')}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder={t('registerCitizen.emailPlaceholder')}
              />
              {!!errors.email && <span className="registration-error">{errors.email}</span>}
            </div>

            <div className="registration-field">
              <label>{t('registerCitizen.gender')}</label>
              <select value={form.gender} onChange={(e) => handleChange('gender', e.target.value)}>
                <option value="">{t('registerCitizen.selectGender')}</option>
                <option value="male">{t('registerCitizen.male')}</option>
                <option value="female">{t('registerCitizen.female')}</option>
              </select>
              {!!errors.gender && <span className="registration-error">{errors.gender}</span>}
            </div>
          </div>

          <div className="registration-field">
            <label>{t('registerCitizen.municipality')}</label>
            <div className="multi-checkbox-container">
              {municipalitiesStatus === 'loading' ? (
                <div className="loading-text">{t('registerCitizen.loading')}</div>
              ) : (
                municipalities.map((item) => {
                  const isChecked = form.groupIds.includes(String(item.groupId));
                  return (
                    <div key={item.groupId} className="multi-checkbox-item">
                      <input
                        type="checkbox"
                        id={`group-${item.groupId}`}
                        checked={isChecked}
                        onChange={() => {
                          const idStr = String(item.groupId);
                          const next = isChecked
                            ? form.groupIds.filter(id => id !== idStr)
                            : [...form.groupIds, idStr];
                          handleChange('groupIds', next);
                        }}
                      />
                      <label htmlFor={`group-${item.groupId}`}>{item.name}</label>
                    </div>
                  );
                })
              )}
            </div>
            {!!errors.groupIds && <span className="registration-error">{errors.groupIds}</span>}
          </div>

          <div className="registration-field">
            <label>{t('settings.currentPassword')}</label>
            <input
              type="password"
              value={form.oldPassword}
              onChange={(e) => handleChange('oldPassword', e.target.value)}
              placeholder={t('settings.currentPasswordPlaceholder')}
            />
            {!!errors.oldPassword && <span className="registration-error">{errors.oldPassword}</span>}
          </div>

          <div className="registration-grid">
            <div className="registration-field">
              <label>{t('settings.newPassword')}</label>
              <input
                type="password"
                value={form.newPassword}
                onChange={(e) => handleChange('newPassword', e.target.value)}
                placeholder={t('settings.newPasswordPlaceholder')}
              />
              {!!errors.newPassword && <span className="registration-error">{errors.newPassword}</span>}
            </div>

            <div className="registration-field">
              <label>{t('registerCitizen.confirmPassword')}</label>
              <input
                type="password"
                value={form.confirmNewPassword}
                onChange={(e) => handleChange('confirmNewPassword', e.target.value)}
                placeholder={t('registerCitizen.confirmPasswordPlaceholder')}
              />
              {!!errors.confirmNewPassword && <span className="registration-error">{errors.confirmNewPassword}</span>}
            </div>
          </div>

          {!!serverMessage && (
            <div className={isSuccess ? 'registration-message registration-success' : 'registration-message registration-failed'}>
              {serverMessage}
            </div>
          )}

          <button type="submit" className="registration-submit-btn" disabled={submitStatus === 'loading'}>
            {submitStatus === 'loading' ? t('settings.updating') : t('settings.updateProfile')}
          </button>
        </form>

        <div className="danger-zone">
          <h2 className="danger-zone-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {t('settings.dangerZone')}
          </h2>
          <p className="danger-zone-subtitle">{t('settings.deleteSubtitle')}</p>

          {!showDeleteForm ? (
            <button 
              type="button" 
              className="delete-btn"
              onClick={() => setShowDeleteForm(true)}
            >
              {t('settings.deleteAccount')}
            </button>
          ) : (
            <div className="delete-form-wrap">
              <div className="registration-field">
                <label>{t('settings.deleteReason')}</label>
                <textarea
                  value={deleteForm.reason}
                  onChange={(e) => {
                    setDeleteForm(prev => ({ ...prev, reason: e.target.value }));
                    setDeleteErrors(prev => ({ ...prev, reason: '' }));
                  }}
                  placeholder={t('settings.deleteReasonPlaceholder')}
                  rows="3"
                />
                {!!deleteErrors.reason && <span className="registration-error">{deleteErrors.reason}</span>}
              </div>

              <div className="registration-field">
                <label>{t('settings.deleteConfirmPassword')}</label>
                <input
                  type="password"
                  value={deleteForm.password}
                  onChange={(e) => {
                    setDeleteForm(prev => ({ ...prev, password: e.target.value }));
                    setDeleteErrors(prev => ({ ...prev, password: '' }));
                  }}
                  placeholder={t('settings.currentPasswordPlaceholder')}
                />
                {!!deleteErrors.password && <span className="registration-error">{deleteErrors.password}</span>}
              </div>

              {!!deleteMessage && (
                <div className={deleteStatus === 'succeeded' ? 'registration-message registration-success' : 'registration-message registration-failed'}>
                  {deleteMessage}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button 
                  type="button" 
                  className="registration-submit-btn" 
                  style={{ background: '#ff4444', flex: 1 }}
                  onClick={handleDeleteAccount}
                  disabled={deleteStatus === 'loading'}
                >
                  {deleteStatus === 'loading' ? t('settings.deleting') : t('settings.deleteAction')}
                </button>
                <button 
                  type="button" 
                  className="registration-submit-btn secondary" 
                  style={{ flex: 1, color: '#ff4444', borderColor: '#ff4444', background: 'transparent' }}
                  onClick={() => setShowDeleteForm(false)}
                  disabled={deleteStatus === 'loading'}
                >
                  {t('newsDetails.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
