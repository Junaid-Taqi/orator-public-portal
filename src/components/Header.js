import React, { useState } from "react";
import { NavLink, Link } from 'react-router-dom';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faHouse, 
    faNewspaper, 
    faTriangleExclamation, 
    faRightToBracket, 
    faCalendarAlt,
    faFile,
    faFileAlt
} from "@fortawesome/free-solid-svg-icons";

import { useTranslation } from '../i18n';

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { t, lang, setLang } = useTranslation();

    return (
        <header className="header">
            <div className="header-container">

                {/* Logo */}
                <div className="logo">
                    <span className="logo-main">{t('header.title')}</span>
                    <span className="logo-sub text-info">{t('header.subTitle')}</span>
                </div>

                {/* Hamburger */}
                <div 
                    className={`hamburger ${menuOpen ? "active" : ""}`} 
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                {/* Navigation */}
                <nav className={`nav ${menuOpen ? "show" : ""}`}>
                    <NavLink to="/" end className={({isActive})=>"nav-link" + (isActive? " active":"")} onClick={()=>setMenuOpen(false)}>
                        <FontAwesomeIcon icon={faHouse} /> {t('header.home')}
                    </NavLink>
                    <NavLink to="/news" className={({isActive})=>"nav-link" + (isActive? " active":"")} onClick={()=>setMenuOpen(false)}>
                        <FontAwesomeIcon icon={faNewspaper} /> {t('header.news')}
                    </NavLink>
                    <NavLink to="/calendar" className={({isActive})=>"nav-link" + (isActive? " active":"")} onClick={()=>setMenuOpen(false)}>
                        <FontAwesomeIcon icon={faCalendarAlt} /> {t('header.calendar')}
                    </NavLink>
                    <NavLink to="/report" className={({isActive})=>"nav-link" + (isActive? " active":"")} onClick={()=>setMenuOpen(false)}>
                        <FontAwesomeIcon icon={faTriangleExclamation} /> {t('header.report')}
                    </NavLink>
                    <NavLink to="/my-report" className={({isActive})=>"nav-link" + (isActive? " active":"")} onClick={()=>setMenuOpen(false)}>
                        <FontAwesomeIcon icon={faFileAlt} /> {t('header.myReport')}
                    </NavLink>
                </nav>

                {/* Login Button */}
                <div className="login-btn d-flex align-items-center gap-2">
                    <div className="language-switch">
                        <button className={`btn btn-sm ${lang === 'hr' ? 'btn-info text-dark' : 'btn-light'}`} onClick={() => setLang('hr')}>HR</button>
                        <button className={`btn btn-sm ms-1 ${lang === 'en' ? 'btn-info text-dark' : 'btn-light'}`} onClick={() => setLang('en')}>EN</button>
                    </div>
                    <Link to="/login">
                      <button>
                          <FontAwesomeIcon icon={faRightToBracket} /> {t('header.login')}
                      </button>
                    </Link>
                </div>

            </div>
        </header>
    );
};

export default Header;