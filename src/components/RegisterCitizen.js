import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../i18n';
import ReCAPTCHA from 'react-google-recaptcha';
import './RegisterCitizen.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY || '6Ld7PGosAAAAAKW0wruLeowTCOdG6j8c4qInVmg8';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  groupId: '',
  gender: '',
};

function RegisterCitizen() {
  const { t } = useTranslation();
  const recaptchaRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [captchaValue, setCaptchaValue] = useState('');
  const [municipalities, setMunicipalities] = useState([]);
  const [municipalitiesStatus, setMunicipalitiesStatus] = useState('idle');
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchMunicipalities = async () => {
      setMunicipalitiesStatus('loading');
      try {
        const response = await fetch(`${API_BASE_URL}/o/endUserRegistrationApplication/getMunicipalities`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });

        const data = await response.json();
        if (!response.ok || !data?.success) {
          throw new Error(data?.message || t('registerCitizen.errors.fetchMunicipalities'));
        }

        setMunicipalities(data?.data || []);
        setMunicipalitiesStatus('succeeded');
      } catch (error) {
        setMunicipalitiesStatus('failed');
        setServerMessage(error.message || t('registerCitizen.errors.fetchMunicipalities'));
      }
    };

    fetchMunicipalities();
  }, []);

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
    if (!form.password) {
      nextErrors.password = t('registerCitizen.errors.passwordReq');
    } else if (form.password.length < 8) {
      nextErrors.password = t('registerCitizen.errors.passwordMin');
    }
    if (!form.confirmPassword) {
      nextErrors.confirmPassword = t('registerCitizen.errors.confirmPasswordReq');
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = t('registerCitizen.errors.confirmPasswordMatch');
    }
    if (!form.groupId) {
      nextErrors.groupId = t('registerCitizen.errors.municipalityReq');
    }
    if (!form.gender) {
      nextErrors.gender = t('registerCitizen.errors.genderReq');
    }
    if (!captchaValue) {
      nextErrors.captcha = t('registerCitizen.errors.captchaReq');
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
        token: captchaValue,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        groupId: String(form.groupId),
        gender: form.gender,
      };

      const response = await fetch(`${API_BASE_URL}/o/endUserRegistrationApplication/registerCitizen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || t('registerCitizen.errors.failed'));
      }

      setSubmitStatus('succeeded');
      setIsSuccess(true);
      setServerMessage(data?.message || t('registerCitizen.success'));
      setForm(initialForm);
      setCaptchaValue('');
      recaptchaRef.current?.reset();
    } catch (error) {
      setSubmitStatus('failed');
      setServerMessage(error.message || t('registerCitizen.errors.failed'));
      setCaptchaValue('');
      recaptchaRef.current?.reset();
    }
  };

  return (
    <div className="registration-page">
      <div className="registration-card">
        <h1>{t('registerCitizen.title')}</h1>
        <p className="registration-subtitle">{t('registerCitizen.subtitle')}</p>

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

          <div className="registration-grid">
            <div className="registration-field">
              <label>{t('registerCitizen.password')}</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder={t('registerCitizen.passwordPlaceholder')}
              />
              {!!errors.password && <span className="registration-error">{errors.password}</span>}
            </div>

            <div className="registration-field">
              <label>{t('registerCitizen.confirmPassword')}</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder={t('registerCitizen.confirmPasswordPlaceholder')}
              />
              {!!errors.confirmPassword && <span className="registration-error">{errors.confirmPassword}</span>}
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

          <div className="registration-field registration-captcha-field">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={SITE_KEY}
              onChange={(value) => {
                setCaptchaValue(value || '');
                setErrors((prev) => ({ ...prev, captcha: '' }));
              }}
            />
            {!!errors.captcha && <span className="registration-error">{errors.captcha}</span>}
          </div>

          {!!serverMessage && (
            <div className={isSuccess ? 'registration-message registration-success' : 'registration-message registration-failed'}>
              {serverMessage}
            </div>
          )}

          <button type="submit" className="registration-submit-btn" disabled={submitStatus === 'loading'}>
            {submitStatus === 'loading' ? t('registerCitizen.registering') : t('registerCitizen.register')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterCitizen;
