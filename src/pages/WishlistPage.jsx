import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import "./WishlistPage.css";
import { ProductCard } from "../components";
function WishlistPage() {
  const { favorites } = useContext(CartContext);

  return (
    <div className="wishlist-page">
      <h1 className="wishlist-title">Wishlist</h1>

      {favorites.length === 0 ? (
        <div className="empty-wishlist">
          <h2>Your Wishlist is Empty</h2>
          <p>Looks like you haven't added any favorites yet.</p>
          <Link to="/" className="continue-shopping">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="wishlist-products">
          {favorites.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
export default WishlistPage;
