import { Link } from "react-router-dom";
import { IoMdHeartEmpty, IoMdCart } from "react-icons/io";
import SearchBox from "./SearchBox"; // استيراد مكون البحث هنا
import "./Header.css";
import logo from "../../assets/icon.jpg";
import { useContext } from "react";
import { CartContext } from "../../context/CartContext";

function TopHeader() {
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
        </div>
      </div>
    </div>
  );
}

export default TopHeader;
