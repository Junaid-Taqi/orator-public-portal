import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useLocation } from 'react-router-dom';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHouse,
    faNewspaper,
    faTriangleExclamation,
    faRightToBracket,
    faUserPlus,
    faHandshake,
    faCalendarAlt,
    faFileAlt,
    faGlobe
} from "@fortawesome/free-solid-svg-icons";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { useTranslation } from '../i18n';

const Header = ({ hasLiferayUser, onLogout }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { t, lang, setLang } = useTranslation();
    const { pathname } = useLocation();
    const headerRef = useRef(null);

    const isCurrentPath = (path) => pathname === path;

    // Close menu when clicking outside the header
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (headerRef.current && !headerRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    return (
        <header className="header" ref={headerRef}>
            <div className="header-container">

                {/* Logo */}
                <div className="logo">
                    <span className="logo-main">{t('header.title')}</span>
                    <span className="logo-sub text-info text-nowrap">{t('header.subTitle')}</span>
                </div>

                {/* Hamburger - toggles open/close */}
                <div
                    className={`hamburger ${menuOpen ? "active" : ""}`}
                    onClick={() => setMenuOpen(prev => !prev)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                {/* Navigation — uses .header-nav (not .nav) to avoid Bootstrap conflict */}
                <nav className={`header-nav ${menuOpen ? "show" : ""}`}>
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
                    {hasLiferayUser && (
                        <NavLink to="/my-report" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} onClick={() => setMenuOpen(false)}>
                            <FontAwesomeIcon icon={faFileAlt} /> {t('header.myReport')}
                        </NavLink>
                    )}

                    {/* Mobile-only actions inside the dropdown */}
                    <div className="mobile-actions">
                        <div className="lang-select-wrapper">
                            <FontAwesomeIcon icon={faGlobe} className="lang-icon" />
                            <select
                                className="header-lang-select"
                                value={lang}
                                onChange={(e) => setLang(e.target.value)}
                            >
                                <option value="en">English</option>
                                <option value="hr">Croatian</option>
                            </select>
                        </div>

                        {!hasLiferayUser && (
                            <>
                                <a href="/web/guest/login" className="header-action-btn" onClick={() => setMenuOpen(false)}>
                                    <FontAwesomeIcon icon={faRightToBracket} /> {t('header.login')}
                                </a>
                                <Link to="/register" className="header-action-btn" onClick={() => setMenuOpen(false)}>
                                    <FontAwesomeIcon icon={faUserPlus} /> {t('header.register')}
                                </Link>
                            </>
                        )}

                        {hasLiferayUser && (
                            <button type="button" className="header-action-btn" onClick={() => { onLogout(); setMenuOpen(false); }}>
                                <FontAwesomeIcon icon={faRightToBracket} /> {t('header.logout')}
                            </button>
                        )}
                    </div>
                </nav>

                {/* Desktop-only actions */}
                <div className="header-actions">
                    <div className="lang-select-wrapper">
                        <FontAwesomeIcon icon={faGlobe} className="lang-icon" />
                        <select
                            className="header-lang-select"
                            value={lang}
                            onChange={(e) => setLang(e.target.value)}
                        >
                            <option value="en">English</option>
                            <option value="hr">Croatian</option>
                        </select>
                    </div>

                    {!hasLiferayUser && (
                        <>
                            <a href="/web/guest/login" className="header-action-btn">
                                <FontAwesomeIcon icon={faRightToBracket} /> {t('header.login')}
                            </a>
                            <Link to="/register" className="header-action-btn">
                                <FontAwesomeIcon icon={faUserPlus} /> {t('header.register')}
                            </Link>
                        </>
                    )}

                    {hasLiferayUser && (
                        <button type="button" className="header-action-btn" onClick={onLogout}>
                            <FontAwesomeIcon icon={faRightToBracket} /> {t('header.logout')}
                        </button>
                    )}
                </div>

            </div>
        </header>
    );
};

export default Header;
