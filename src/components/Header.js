import React, { useState } from "react";
import { NavLink, Link } from 'react-router-dom';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHouse,
    faNewspaper,
    faTriangleExclamation,
    faRightToBracket,
    faUserPlus,
    faHandshake,
    faCalendarAlt,
    faFileAlt
} from "@fortawesome/free-solid-svg-icons";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

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
                    <NavLink to="/" end className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} onClick={() => setMenuOpen(false)}>
                        <FontAwesomeIcon icon={faHouse} /> {t('header.home')}
                    </NavLink>
                    <NavLink to="/news" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} onClick={() => setMenuOpen(false)}>
                        <FontAwesomeIcon icon={faNewspaper} /> {t('header.news')}
                    </NavLink>
                    <NavLink to="/calendar" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} onClick={() => setMenuOpen(false)}>
                        <FontAwesomeIcon icon={faCalendarAlt} /> {t('header.calendar')}
                    </NavLink>
                    <NavLink to="/report" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} onClick={() => setMenuOpen(false)}>
                        <FontAwesomeIcon icon={faTriangleExclamation} /> {t('header.report')}
                    </NavLink>
                    <NavLink to="/my-report" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} onClick={() => setMenuOpen(false)}>
                        <FontAwesomeIcon icon={faFileAlt} /> {t('header.myReport')}
                    </NavLink>
                </nav>

                <div className="header-actions">
                    <select
                        className="form-select form-select-sm header-lang-select"
                        value={lang}
                        onChange={(e) => setLang(e.target.value)}
                    >
                        <option value="en">English</option>
                        <option value="hr">Croatian</option>
                    </select>

                    <Link to="/login" className="header-action-btn">
                        <FontAwesomeIcon icon={faRightToBracket} /> {t('header.login')}
                    </Link>

                    <Link to="/register" className="header-action-btn">
                        <FontAwesomeIcon icon={faUserPlus} /> {t('header.register')}
                    </Link>

                    <a href="partnership" rel="noopener noreferrer" className="header-action-btn">
                        <FontAwesomeIcon icon={faHandshake} /> {t('header.partnership')}
                    </a>
                </div>

            </div>
        </header>
    );
};

export default Header;
