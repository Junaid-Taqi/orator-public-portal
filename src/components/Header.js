import React, { useState } from "react";

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
                    <a href="#" className="nav-link active">
                        <FontAwesomeIcon icon={faHouse} /> Home
                    </a>
                    <a href="#" className="nav-link">
                        <FontAwesomeIcon icon={faNewspaper} /> News & Updates
                    </a>
                    <a href="#" className="nav-link">
                        <FontAwesomeIcon icon={faTriangleExclamation} /> Report Problem
                    </a>
                </nav>

                {/* Login Button */}
                <div className="login-btn">
                    <button>
                        <FontAwesomeIcon icon={faRightToBracket} /> Log In
                    </button>
                </div>

            </div>
        </header>
    );
};

export default Header;