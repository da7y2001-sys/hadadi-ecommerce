import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="store-footer">
      <div className="footer-container">
        <div className="footer-column">
          <h2>Hadai</h2>
          <p>Hadai Online Store</p>
          <p>Your trusted online store for quality products.</p>
        </div>

        <div className="footer-column">
          <h3>Quick Links</h3>

          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-column">
          <h3>Customer</h3>

          <Link to="/orders">My Orders</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/cart">Cart</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Hadai Online Store. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
