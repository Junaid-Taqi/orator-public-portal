import { useEffect, useState } from 'react';
import { useTranslation } from '../i18n';
import './RegisterCitizen.css'; 
import { serverUrl } from '../Services/Constants/Constants';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = serverUrl;

function RegisterInMunicipality({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [municipalities, setMunicipalities] = useState([]);
  const [municipalitiesStatus, setMunicipalitiesStatus] = useState('idle');
  const [groupIds, setGroupIds] = useState([]);
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [error, setError] = useState('');
  const [serverMessage, setServerMessage] = useState('');

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

    fetchMunicipalities();
  }, [t]);

  const handleSave = async (event) => {
    event.preventDefault();
    if (groupIds.length === 0) {
      setError(t('registerCitizen.errors.municipalityReq'));
      return;
    }

    setSubmitStatus('loading');
    setError('');
    setServerMessage('');

    try {
      const payload = {
        userId: String(user.userId),
        groupIds: groupIds,
      };

      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/o/endUserCitizen/addUserSites`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to add user sites');
      }

      setSubmitStatus('succeeded');
      setServerMessage(data.message || 'User sites added successfully');
      
      // Redirect to on success
      setTimeout(() => {
        window.location.href = '/web/guest/home';
      }, 1500);
    } catch (error) {
      setSubmitStatus('failed');
      setServerMessage(error.message);
    }
  };

  return (
    <div className="registration-page">
      <div className="registration-card">
        <h1>{t('registerInMunicipality.title', 'Register in Municipality')}</h1>
        <p className="registration-subtitle">{t('registerInMunicipality.subtitle', 'Select the municipalities you want to register with.')}</p>

        <form onSubmit={handleSave} noValidate>
          <div className="registration-field">
            <label>{t('registerCitizen.municipality')}</label>
            <div className="multi-checkbox-container">
              {municipalitiesStatus === 'loading' ? (
                <div className="loading-text">{t('registerCitizen.loading')}</div>
              ) : (
                municipalities.map((item) => {
                  const isChecked = groupIds.includes(String(item.groupId));
                  return (
                    <div key={item.groupId} className="multi-checkbox-item">
                      <input
                        type="checkbox"
                        id={`group-${item.groupId}`}
                        checked={isChecked}
                        onChange={() => {
                          const idStr = String(item.groupId);
                          const next = isChecked
                            ? groupIds.filter(id => id !== idStr)
                            : [...groupIds, idStr];
                          setGroupIds(next);
                          setError('');
                        }}
                      />
                      <label htmlFor={`group-${item.groupId}`}>{item.name}</label>
                    </div>
                  );
                })
              )}
            </div>
            {!!error && <span className="registration-error">{error}</span>}
          </div>

          {!!serverMessage && (
            <div className={submitStatus === 'succeeded' ? 'registration-message registration-success' : 'registration-message registration-failed'}>
              {serverMessage}
            </div>
          )}

          <button type="submit" className="registration-submit-btn" disabled={submitStatus === 'loading'}>
            {submitStatus === 'loading' ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterInMunicipality;
