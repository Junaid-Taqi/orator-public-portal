import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Column 1 */}
        <div className="footer-col">
          <h3>ORATOR</h3>
          <p>
            Your digital connection to municipal services and community
            updates.
          </p>
        </div>

        {/* Column 2 */}
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li>News & Updates</li>
            <li>Report Problem</li>
            <li>Admin Portal</li>
          </ul>
        </div>

        {/* Column 3 */}
        <div className="footer-col">
          <h4>Contact</h4>
          <p>Email: info@orator.gov</p>
          <p>Phone: (555) 123-4567</p>
        </div>

      </div>

      {/* Divider */}
      <div className="footer-divider"></div>

      {/* Bottom */}
      <div className="footer-bottom">
        © 2026 ORATOR. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;