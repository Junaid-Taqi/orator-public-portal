import './App.css';
import Footer from './components/Footer';
import Header from './components/Header';
import { useTranslation } from './i18n';
import Home from './components/Home';
import News from './components/News';
import Report from './components/Report';
import EventCalendar from './components/EventCalendar';
import { Routes, Route } from 'react-router-dom';
import MyReport from './components/MyReport';
import RegisterCitizen from './components/RegisterCitizen';

function Login() {
  const { t } = useTranslation();
  return (
    <div className="page">
      <h1>{t('login.title')}</h1>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<News />} />
          <Route path="/calendar" element={<EventCalendar />} />
          <Route path="/report" element={<Report />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterCitizen />} />
          <Route path="/my-report" element={<MyReport />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
