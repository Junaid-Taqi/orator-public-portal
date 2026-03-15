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
    faGlobe,
    faUserCircle,
    faChevronDown,
    faChevronUp,
    faGear
} from "@fortawesome/free-solid-svg-icons";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { useTranslation } from '../i18n';

const Header = ({ hasLiferayUser, user, onLogout, hasCitizenRole }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { t, lang, setLang } = useTranslation();
    const { pathname } = useLocation();
    const headerRef = useRef(null);
    const userMenuRef = useRef(null);

    const isCurrentPath = (path) => pathname === path;

    // Close menu when clicking outside the header or user menu
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (headerRef.current && !headerRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
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
                            <>
                                {hasCitizenRole && (
                                    <NavLink to="/settings" className="header-action-btn" onClick={() => { setMenuOpen(false); }}>
                                        <FontAwesomeIcon icon={faGear} /> {t('header.settings')}
                                    </NavLink>
                                )}
                                <button type="button" className="header-action-btn" onClick={() => { onLogout(); setMenuOpen(false); }}>
                                    <FontAwesomeIcon icon={faRightToBracket} /> {t('header.logout')}
                                </button>
                            </>
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
                        <div className="header-user-wrap" ref={userMenuRef}>
                            <button
                                type="button"
                                className="header-user-btn"
                                onClick={() => setUserMenuOpen((v) => !v)}
                                aria-expanded={userMenuOpen}
                            >
                                <FontAwesomeIcon icon={faUserCircle} className="header-user-icon" />
                                <div className="header-user-info">
                                    <span className="header-user-name">{user?.fullName}</span>
                                    <span className="header-user-email">{user?.email}</span>
                                </div>
                                <FontAwesomeIcon icon={userMenuOpen ? faChevronUp : faChevronDown} className="header-user-chevron" />
                            </button>

                            {userMenuOpen && (
                                <div className="header-user-dropdown">
                                    {hasCitizenRole && (
                                        <NavLink to="/settings" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                            <FontAwesomeIcon icon={faGear} />
                                            {t('header.settings')}
                                        </NavLink>
                                    )}
                                    <button type="button" className="dropdown-item dropdown-logout" onClick={onLogout}>
                                        <FontAwesomeIcon icon={faRightToBracket} />
                                        {t('header.logout')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
};

export default Header;
