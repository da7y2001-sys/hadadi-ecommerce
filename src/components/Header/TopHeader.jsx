import { Link } from "react-router-dom";
import { IoMdHeartEmpty, IoMdCart, IoMdPerson } from "react-icons/io";
import SearchBox from "./SearchBox";
import "./Header.css";
import logo from "../../assets/icon.jpg";
import { useContext, useState } from "react";
import { CartContext } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

function TopHeader() {
  const [accountOpen, setAccountOpen] = useState(false);

  const { user, logout } = useAuth();
  const { cartItems, favorites } = useContext(CartContext);
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="container">
      <div className="top-header">
        {/* Logo */}
        <div className="store-branding">
          <Link to="/">
            <img src={logo} alt="Store Logo" className="store-logo" />
          </Link>
        </div>

        {/* Search Component */}
        <SearchBox />

        {/* Actions */}
        <div className="header-actions">
          {/* Language Switcher */}
          <div className="header-language-toggle" role="group" aria-label={t("language")}>
            <button
              type="button"
              className={`lang-pill-btn ${language === "ar" ? "is-active" : ""}`}
              onClick={() => setLanguage("ar")}
              aria-pressed={language === "ar"}
            >
              العربية
            </button>
            <span className="lang-pill-divider">/</span>
            <button
              type="button"
              className={`lang-pill-btn ${language === "en" ? "is-active" : ""}`}
              onClick={() => setLanguage("en")}
              aria-pressed={language === "en"}
            >
              English
            </button>
          </div>

          <Link
            to="/wishlist"
            className="header-action"
            aria-label={t("wishlistTitle")}
          >
            <IoMdHeartEmpty />
            <span>{favorites.length}</span>
          </Link>

          <Link
            to="/cart"
            className="header-action"
            aria-label={t("shoppingCart")}
          >
            <IoMdCart />
            <span>{cartItems.length}</span>
          </Link>

          <div className="account-menu">
            <button
              className="account-button"
              onClick={() => setAccountOpen(!accountOpen)}
              aria-label={t("accountHeading")}
              aria-expanded={accountOpen}
            >
              <IoMdPerson />
            </button>

            {accountOpen && (
              <div className="account-dropdown">
                {user ? (
                  <>
                    <span className="account-dropdown-greeting">
                      {t("hi")}{user.name}
                    </span>
                    {user?.role === "admin" && (
                      <Link to="/admin" onClick={() => setAccountOpen(false)}>
                        {t("adminPanel")}
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setAccountOpen(false)}>
                      {t("myProfile")}
                    </Link>

                    <Link to="/orders" onClick={() => setAccountOpen(false)}>
                      {t("myOrders")}
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setAccountOpen(false);
                      }}
                    >
                      {t("logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setAccountOpen(false)}>
                      {t("login")}
                    </Link>

                    <Link to="/register" onClick={() => setAccountOpen(false)}>
                      {t("createAccount")}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopHeader;
