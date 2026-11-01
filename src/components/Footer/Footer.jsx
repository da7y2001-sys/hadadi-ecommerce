import { Link } from "react-router-dom";
import { FaInstagram, FaTwitter, FaYoutube, FaFacebookF } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";
import "./Footer.css";

function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="store-footer">
      {/* Top Newsletter / Updates Section */}
      <div className="footer-newsletter-banner">
        <div className="container newsletter-container">
          <div className="newsletter-text">
            <h3>{t("newsletterHeading")}</h3>
            <p>{t("newsletterSubtext")}</p>
          </div>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder={t("newsletterPlaceholder")}
              aria-label={t("email")}
              required
            />
            <button type="submit">{t("newsletterButton")}</button>
          </form>
        </div>
      </div>

      {/* Main 4-Column Navigation Layout - Only Real Existing Routes */}
      <div className="container footer-main-content">
        <div className="footer-column">
          <h4>{t("clientServicesHeading")}</h4>
          <Link to="/orders">{t("orderTracking")}</Link>
          <Link to="/contact">{t("contactSupport")}</Link>
          <span className="footer-static-item">{t("complimentaryDelivery")}</span>
          <span className="footer-static-item">{t("thirtyDayEvaluation")}</span>
        </div>

        <div className="footer-column">
          <h4>{t("cataloguesHeading")}</h4>
          <Link to="/category/phones">{t("smartphones")}</Link>
          <Link to="/category/laptops">{t("workstations")}</Link>
          <Link to="/category/audio">{t("acoustics")}</Link>
          <Link to="/category/gaming">{t("gamingHardware")}</Link>
          <Link to="/category/monitors">{t("displays")}</Link>
        </div>

        <div className="footer-column">
          <h4>{t("accountHeading")}</h4>
          <Link to="/profile">{t("myProfile")}</Link>
          <Link to="/orders">{t("orderHistory")}</Link>
          <Link to="/wishlist">{t("savedItems")}</Link>
          <Link to="/cart">{t("shoppingBag")}</Link>
        </div>

        <div className="footer-column">
          <h4>{t("aboutHeading")}</h4>
          <Link to="/about">{t("ourPhilosophy")}</Link>
          <span className="footer-static-item">{t("hardwareStandards")}</span>
          <span className="footer-static-item">{t("globalHeadquarters")}</span>
          <div className="footer-social-icons">
            <span aria-label="Instagram"><FaInstagram /></span>
            <span aria-label="Twitter"><FaTwitter /></span>
            <span aria-label="YouTube"><FaYoutube /></span>
            <span aria-label="Facebook"><FaFacebookF /></span>
          </div>
        </div>
      </div>

      {/* Bottom Subdued Monumental Brand Watermark */}
      <div className="footer-watermark">
        <span>HADADI TECH</span>
      </div>

      {/* Legal & Copyright */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>{t("copyright")}</p>
          <div className="footer-legal-links">
            <span>{t("privacyPolicy")}</span>
            <span>{t("termsOfService")}</span>
            <span>{t("cookiePreferences")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
