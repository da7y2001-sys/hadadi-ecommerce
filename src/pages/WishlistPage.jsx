import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import { ProductCard } from "../components";
import { useLanguage } from "../context/LanguageContext";
import "./WishlistPage.css";

function WishlistPage() {
  const { t } = useLanguage();
  const { favorites } = useContext(CartContext);

  return (
    <div className="wishlist-page">
      <h1 className="wishlist-title">{t("wishlistTitle")}</h1>

      {favorites.length === 0 ? (
        <div className="empty-wishlist">
          <h2>{t("emptyWishlistTitle")}</h2>
          <p>{t("emptyWishlistDesc")}</p>
          <Link to="/" className="continue-shopping">
            {t("continueShopping")}
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
