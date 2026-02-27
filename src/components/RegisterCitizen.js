import { useEffect, useRef, useState } from 'react';
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
          throw new Error(data?.message || 'Failed to load municipalities');
        }

        setMunicipalities(data?.data || []);
        setMunicipalitiesStatus('succeeded');
      } catch (error) {
        setMunicipalitiesStatus('failed');
        setServerMessage(error.message || 'Unable to fetch municipalities');
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
      nextErrors.firstName = 'First name is required.';
    }
    if (!form.lastName.trim()) {
      nextErrors.lastName = 'Last name is required.';
    }
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!form.password) {
      nextErrors.password = 'Password is required.';
    } else if (form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }
    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Confirm password is required.';
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    if (!form.groupId) {
      nextErrors.groupId = 'Please select a municipality.';
    }
    if (!form.gender) {
      nextErrors.gender = 'Please select gender.';
    }
    if (!captchaValue) {
      nextErrors.captcha = 'Please complete the captcha.';
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
        throw new Error(data?.message || 'Registration failed.');
      }

      setSubmitStatus('succeeded');
      setIsSuccess(true);
      setServerMessage(data?.message || 'Citizen registered successfully.');
      setForm(initialForm);
      setCaptchaValue('');
      recaptchaRef.current?.reset();
    } catch (error) {
      setSubmitStatus('failed');
      setServerMessage(error.message || 'Registration failed.');
      setCaptchaValue('');
      recaptchaRef.current?.reset();
    }
  };

  return (
    <div className="registration-page">
      <div className="registration-card">
        <h1>Citizen Registration</h1>
        <p className="registration-subtitle">Create your account and select your municipality.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="registration-grid">
            <div className="registration-field">
              <label>First Name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Enter first name"
              />
              {!!errors.firstName && <span className="registration-error">{errors.firstName}</span>}
            </div>

            <div className="registration-field">
              <label>Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Enter last name"
              />
              {!!errors.lastName && <span className="registration-error">{errors.lastName}</span>}
            </div>
          </div>

          <div className="registration-grid">
            <div className="registration-field">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter email"
              />
              {!!errors.email && <span className="registration-error">{errors.email}</span>}
            </div>

            <div className="registration-field">
              <label>Gender</label>
              <select value={form.gender} onChange={(e) => handleChange('gender', e.target.value)}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {!!errors.gender && <span className="registration-error">{errors.gender}</span>}
            </div>
          </div>

          <div className="registration-grid">
            <div className="registration-field">
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Enter password"
              />
              {!!errors.password && <span className="registration-error">{errors.password}</span>}
            </div>

            <div className="registration-field">
              <label>Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Re-enter password"
              />
              {!!errors.confirmPassword && <span className="registration-error">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="registration-field">
            <label>Municipality</label>
            <select
              value={form.groupId}
              onChange={(e) => handleChange('groupId', e.target.value)}
              disabled={municipalitiesStatus === 'loading'}
            >
              <option value="">Select municipality</option>
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
            {submitStatus === 'loading' ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterCitizen;
