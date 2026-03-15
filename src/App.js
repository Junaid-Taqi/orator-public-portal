import './App.css';
import { useEffect, useMemo, useState } from 'react';
import Footer from './components/Footer';
import Header from './components/Header';
import { useTranslation } from './i18n';
import Home from './components/Home';
import News from './components/News';
import NewsDetails from './components/NewsDetails';
import Report from './components/Report';
import EventCalendar from './components/EventCalendar';
import { Routes, Route } from 'react-router-dom';
import MyReport from './components/MyReport';
import RegisterCitizen from './components/RegisterCitizen';
import Settings from './components/Settings';
import { serverUrl } from './Services/Constants/Constants';

function Login() {
  const { t } = useTranslation();

  return (
    <div className="page">
      <h1>{t('login.title')}</h1>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [expiresIn, setExpiresIn] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [citizenData, setCitizenData] = useState(null);
  const [citizenStatus, setCitizenStatus] = useState('idle');

  const user = useMemo(() => {
    const raw = sessionStorage.getItem('liferayUser');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return null;
  }, []);
  const hasLiferayUser = !!user;

  const handleLogout = () => {
    window.location.href = '/c/portal/logout';
  };

  const fetchToken = async () => {
    setStatus('loading');
    setError(null);
    try {
      const body = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: 'id-e52ebee1-08f1-daa5-cb3d-76e4510ce',
        client_secret: 'secret-569fe0f4-fe5b-92de-428f-cfba2add3ed',
      }).toString();

      const response = await fetch(`${serverUrl}/o/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      const data = await response.json();
      if (!response.ok || !data?.access_token) {
        throw new Error(data?.error_description || data?.message || 'Failed to fetch token');
      }

      sessionStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      setExpiresIn(Number(data.expires_in) || null);
      setStatus('succeeded');
    } catch (fetchError) {
      setStatus('failed');
      setError(fetchError.message || 'Failed to fetch token');
    }
  };

  const fetchCitizenData = async (userId) => {
    setCitizenStatus('loading');
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${serverUrl}/o/endUserRegistrationApplication/getCitizenData?userId=${userId}`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
      });
      const data = await response.json();
      if (data?.success) {
        setCitizenData(data.data);
        setCitizenStatus('succeeded');
      } else {
        setCitizenStatus('failed');
      }
    } catch (err) {
      setCitizenStatus('failed');
      console.error('Error fetching citizen data:', err);
    }
  };

  useEffect(() => {
    // Fetch token only when liferayUser exists in session storage
    if (!user) return;
    fetchToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    // Fetch citizen data only when liferayUser exists in session storage
    if (!user || !token) return;
    fetchCitizenData(user.userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  useEffect(() => {
    if (!user || !token || !expiresIn) return;
    const refreshTime = (expiresIn - 60) * 1000;
    if (refreshTime <= 0) return;

    const timer = setTimeout(() => {
      fetchToken();
    }, refreshTime);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, expiresIn]);

  const hasCitizenRole = citizenData?.hasCitizenRole === true;

  const isBootstrappingAuth = user && !token && (status === 'idle' || status === 'loading');
  if (isBootstrappingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div style={{ fontSize: '16px', fontWeight: 600 }}>Loading...</div>
      </div>
    );
  }

  if (user && !token && status === 'failed') {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#b91c1c' }}>
        <div>Failed to load token{error ? `: ${error}` : ''}</div>
      </div>
    );
  }

  return (
    <div className="App">
      <Header hasLiferayUser={hasLiferayUser} user={user} onLogout={handleLogout} hasCitizenRole={hasCitizenRole} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:newsId" element={<NewsDetails />} />
          <Route path="/calendar" element={<EventCalendar />} />
          <Route path="/report" element={<Report user={user} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterCitizen />} />
          <Route path="/my-report" element={<MyReport user={user} />} />
          {hasCitizenRole && <Route path="/settings" element={<Settings user={user} />} />}
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
