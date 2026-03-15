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
  groupId: '',
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

  useEffect(() => {
    const fetchMunicipalities = async () => {
      setMunicipalitiesStatus('loading');
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/o/endUserRegistrationApplication/getMunicipalities`, {
          method: 'GET',
          headers: { 
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
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
        const response = await fetch(`${API_BASE_URL}/o/endUserRegistrationApplication/getCitizenData?userId=${user.userId}`, {
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
          groupId: citizen.groups?.[0] ? String(citizen.groups[0]) : '',
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
    if (!form.groupId) {
      nextErrors.groupId = t('registerCitizen.errors.municipalityReq');
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
        groupId: String(form.groupId),
        gender: form.gender,
      };

      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/o/endUserRegistrationApplication/updateCitizen`, {
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
            <select
              value={form.groupId}
              onChange={(e) => handleChange('groupId', e.target.value)}
              disabled={municipalitiesStatus === 'loading'}
            >
              <option value="">{t('registerCitizen.selectMunicipality')}</option>
              {municipalities.map((item) => (
                <option key={item.groupId} value={item.groupId}>
                  {item.name}
                </option>
              ))}
            </select>
            {!!errors.groupId && <span className="registration-error">{errors.groupId}</span>}
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
      </div>
    </div>
  );
}

export default Settings;
