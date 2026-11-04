import { useContext } from "react";
import { FaCartArrowDown, FaRegHeart, FaHeart, FaCheck } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CartContext } from "../../context/CartContext";
import { formatPrice, getEffectivePrice } from "../../utils/formatPrice";
import { useLanguage } from "../../context/LanguageContext";
import ProductImage from "../common/ProductImage";

import "./ProductCard.css";

function ProductCard({ item }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Preserve all existing CartContext logic
  const {
    cartItems,
    addToCart,
    addToFavorites,
    favorites,
    removeFromFavorites,
  } = useContext(CartContext);

  const isInCart = cartItems?.some((i) => i.id === item.id);
  const isInFav = favorites?.some((i) => i.id === item.id);

  const cartEntry = cartItems?.find((i) => i.id === item.id);
  const isOutOfStock = item.stock === 0;
  const reachedStockLimit =
    Boolean(cartEntry) && cartEntry.quantity >= item.stock;

  const discount = Number(item.discount) || 0;
  const ratingAvg = Number(item.ratingAverage || 0);
  const ratingCnt = Number(item.ratingCount || 0);

  // Exact 2-decimal effective price calculation
  const discountedPrice = getEffectivePrice(item);

  const handleAddToCart = () => {
    addToCart(item);

    // Toast notification with link to cart
    toast(
      <div
        className="toast-cart-wrapper"
        style={{ display: "flex", alignItems: "center", gap: "10px" }}
      >
        <ProductImage
          src={item.image}
          alt=""
          style={{ width: "36px", height: "36px", objectFit: "contain", borderRadius: "2px" }}
        />
        <div className="toast-content">
          <strong>{item.title}</strong> {t("addedToCartSuccess")}
          <div style={{ marginTop: "4px" }}>
            <button
              style={{
                padding: "4px 8px",
                background: "#111111",
                color: "#ffffff",
                border: "none",
                borderRadius: "2px",
                cursor: "pointer",
                fontSize: "12px",
              }}
              onClick={() => navigate("/cart")}
            >
              {t("viewCart")}
            </button>
          </div>
        </div>
      </div>,
      { duration: 3500 },
    );
  };

  const handleAddToFav = (e) => {
    e.preventDefault();
    if (isInFav) {
      removeFromFavorites(item.id);
      toast.error(`${item.title} ${t("removeFromWishlist")}`);
    } else {
      addToFavorites(item);
      toast.success(`${item.title} ${t("addToWishlist")}`);
    }
  };

  return (
    <div
      className={`product ${isInCart ? "in-cart" : ""} ${
        isOutOfStock ? "out-of-stock" : ""
      }`}
    >
      <div className="product-media-container">
        {/* Badges in top-left */}
        <div className="product-badges">
          {isInCart && (
            <span className="badge badge-cart">
              <FaCheck size={9} /> {t("inCart")}
            </span>
          )}
          {isOutOfStock && <span className="badge badge-out">{t("outOfStockBadge")}</span>}
          {discount > 0 && !isOutOfStock && (
            <span className="badge badge-discount">-{discount}%</span>
          )}
        </div>

        {/* Wishlist Button in top-right */}
        <button
          type="button"
          className={`btn_wishlist ${isInFav ? "in-fav" : ""}`}
          onClick={handleAddToFav}
          aria-pressed={Boolean(isInFav)}
          aria-label={
            isInFav
              ? `${t("removeFromWishlist")} - ${item.title}`
              : `${t("addToWishlist")} - ${item.title}`
          }
        >
          {isInFav ? <FaHeart /> : <FaRegHeart />}
        </button>

        {/* Clickable Image linking to details */}
        <Link to={`/products/${item.id}`} className="product-image-link">
          <div className="img_product">
            <ProductImage src={item.image} alt={item.title} loading="lazy" />
          </div>
        </Link>
      </div>

      {/* Card Info & Pricing */}
      <div className="product-info-block">
        {item.brand && <span className="product-brand">{item.brand}</span>}

        <Link to={`/products/${item.id}`} className="product-title-link">
          <h3 className="name_product" title={item.title}>
            {item.title}
          </h3>
        </Link>

        {/* Minimalist Product Rating */}
        <div className="product-card-rating">
          <div
            className="card-stars"
            aria-label={`${t("ratingAria")}: ${ratingAvg > 0 ? ratingAvg.toFixed(1) : "0"} / 5`}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star-glyph ${
                  star <= Math.round(ratingAvg) && ratingAvg > 0
                    ? "active"
                    : "inactive"
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="card-rating-score">
            {ratingAvg > 0 ? ratingAvg.toFixed(1) : "0.0"}
          </span>
          {ratingCnt > 0 && (
            <span className="card-rating-count">({ratingCnt})</span>
          )}
        </div>

        <div className="price">
          {discount > 0 ? (
            <>
              <span className="discounted-price">
                {formatPrice(discountedPrice)}
              </span>
              <span className="original-price">{formatPrice(item.price)}</span>
            </>
          ) : (
            <span className="regular-price">{formatPrice(item.price)}</span>
          )}
        </div>
      </div>

      {/* Action buttons (Preserving original Add To Cart action) */}
      <div className="product-actions-bar">
        <button
          type="button"
          className={`btn_addtocart ${
            isOutOfStock || reachedStockLimit ? "disabled" : ""
          }`}
          onClick={handleAddToCart}
          disabled={Boolean(isInCart)}
          aria-disabled={isOutOfStock || reachedStockLimit ? "true" : undefined}
          aria-label={
            isOutOfStock
              ? `${item.title} ${t("outOfStockBadge")}`
              : reachedStockLimit
                ? `Maximum available quantity of ${item.title} reached`
                : isInCart
                  ? `${item.title} ${t("inCart")}`
                  : `${t("addToCart")} - ${item.title}`
          }
        >
          <FaCartArrowDown />
          <span>{isInCart ? t("inCart") : isOutOfStock ? t("outOfStockBadge") : t("addToCart")}</span>
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
