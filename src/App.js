import './App.css';
import Footer from './components/Footer';
import Header from './components/Header';
import Home from './components/Home';
import News from './components/News';
import Report from './components/Report';
import EventCalendar from './components/EventCalendar';
import { Routes, Route } from 'react-router-dom';


function Login() {
  return (
    <div className="page">
      <h1>Log In</h1>
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
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
