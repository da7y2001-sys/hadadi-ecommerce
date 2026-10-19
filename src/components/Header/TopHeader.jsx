import { Link } from "react-router-dom";
import { IoMdHeartEmpty, IoMdCart, IoMdPerson } from "react-icons/io";
import SearchBox from "./SearchBox"; // استيراد مكون البحث هنا
import "./Header.css";
import logo from "../../assets/icon.jpg";
import { useContext, useState } from "react";
import { CartContext } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
function TopHeader() {
  const [accountOpen, setAccountOpen] = useState(false);

  const { user, logout } = useAuth();
  const { cartItems, favorites } = useContext(CartContext);
  return (
    <div className="container">
      {" "}
      {/* يفضل وضع container هنا لضبط المحاذاة مع الهيدر السفلي */}
      <div className="top-header">
        {/* Logo */}
        <div className="store-branding">
          <Link to="/">
            <img src={logo} alt="Store Logo" className="store-logo" />
          </Link>
        </div>

        {/* Search Component - وضعناه هنا بين الشعار والأيقونات */}
        <SearchBox />

        {/* Actions */}
        <div className="header-actions">
          <Link to="/wishlist" className="header-action">
            <IoMdHeartEmpty />
            <span>{favorites.length}</span>
          </Link>

          <Link to="/cart" className="header-action">
            <IoMdCart />
            <span>{cartItems.length}</span>
          </Link>

          <div className="account-menu">
            <button
              className="account-button"
              onClick={() => setAccountOpen(!accountOpen)}
            >
              <IoMdPerson />
            </button>

            {accountOpen && (
              <div className="account-dropdown">
                {user ? (
                  <>
                    <span>Hi, {user.name}</span>
                    <Link to="/profile" onClick={() => setAccountOpen(false)}>
                      My Profile
                    </Link>

                    <Link to="/orders" onClick={() => setAccountOpen(false)}>
                      My Orders
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        setAccountOpen(false);
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setAccountOpen(false)}>
                      Login
                    </Link>

                    <Link to="/register" onClick={() => setAccountOpen(false)}>
                      Create Account
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
