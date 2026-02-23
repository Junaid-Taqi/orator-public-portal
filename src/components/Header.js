import React, { useState } from "react";
import { NavLink, Link } from 'react-router-dom';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faHouse, 
    faNewspaper, 
    faTriangleExclamation, 
    faRightToBracket 
} from "@fortawesome/free-solid-svg-icons";

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="header">
            <div className="header-container">

                {/* Logo */}
                <div className="logo">
                    <span className="logo-main">ORATOR</span>
                    <span className="logo-sub">Public Portal</span>
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
                        <FontAwesomeIcon icon={faHouse} /> Home
                    </NavLink>
                    <NavLink to="/news" className={({isActive})=>"nav-link" + (isActive? " active":"")} onClick={()=>setMenuOpen(false)}>
                        <FontAwesomeIcon icon={faNewspaper} /> News & Updates
                    </NavLink>
                    <NavLink to="/report" className={({isActive})=>"nav-link" + (isActive? " active":"")} onClick={()=>setMenuOpen(false)}>
                        <FontAwesomeIcon icon={faTriangleExclamation} /> Report Problem
                    </NavLink>
                </nav>

                {/* Login Button */}
                <div className="login-btn">
                    <Link to="/login">
                      <button>
                          <FontAwesomeIcon icon={faRightToBracket} /> Log In
                      </button>
                    </Link>
                </div>

            </div>
        </header>
    );
};

export default Header;