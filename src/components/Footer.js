import React from "react";
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Column 1 */}
        <div className="footer-col">
          <h3>{t('footer.brandTitle')}</h3>
          <p>{t('footer.brandDesc')}</p>
        </div>

        {/* Column 2 */}
        <div className="footer-col">
          <h4>{t('footer.quickLinks')}</h4>
          <ul>
            <li><Link to="/news">{t('footer.news')}</Link></li>
            <li><Link to="/report">{t('footer.report')}</Link></li>
            <li><a href="/web/guest/login">{t('footer.admin')}</a></li>
          </ul>
        </div>

        {/* Column 3 */}
        <div className="footer-col">
          <h4>{t('footer.contact')}</h4>
          <p>{t('footer.email')}</p>
          <p>{t('footer.phone')}</p>
        </div>

      </div>

      {/* Divider */}
      <div className="footer-divider"></div>

      {/* Bottom */}
      <div className="footer-bottom">{t('footer.copyright')}</div>
    </footer>
  );
};

export default Footer;
