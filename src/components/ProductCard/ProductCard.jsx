import { useContext } from "react";
import { FaCartArrowDown, FaRegHeart, FaHeart, FaCheck } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CartContext } from "../../context/CartContext";
import { formatPrice } from "../../utils/formatPrice";

import "./ProductCard.css";

function ProductCard({ item }) {
  const navigate = useNavigate();
  // استدعاء الدوال من الـ Context
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

  const handleAddToCart = (e) => {
    e.preventDefault(); // لمنع الانتقال لصفحة التفاصيل عند الضغط على الزر

    if (isOutOfStock || reachedStockLimit) {
      toast.error(
        isOutOfStock
          ? `${item.title} is out of stock`
          : `Only ${item.stock} left in stock`,
      );
      return;
    }

    addToCart(item);
    toast.success(
      <div
        className="toast-wrapper"
        style={{ display: "flex", alignItems: "center", gap: "10px" }}
      >
        <img
          src={item.image}
          alt=""
          style={{ width: "40px", borderRadius: "5px" }}
        />
        <div className="toast-content">
          <strong>{item.title}</strong> added to Cart
          <div style={{ marginTop: "5px" }}>
            <button
              style={{
                padding: "5px 10px",
                background: "#0090f0",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() => navigate("/cart")}
            >
              {" "}
              View Cart{" "}
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
      toast.error(`${item.title} Removed from favorites`);
    } else {
      addToFavorites(item);
      toast.success(`${item.title} added To favorites`);
    }
  };

  return (
    <div
      className={`product ${isInCart ? "in-cart" : ""} ${
        isOutOfStock ? "out-of-stock" : ""
      }`}
    >
      <Link
        to={`/products/${item.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        {isInCart && (
          <span className="status_cart">
            <FaCheck /> in cart
          </span>
        )}

        {isOutOfStock && <span className="status_out">Out of stock</span>}

        <div className="img_product">
          <img src={item.image} alt={item.title} />
        </div>

        <p className="name_product">{item.title}</p>

        <p className="price">
          <span>{formatPrice(item.price)}</span>
        </p>
      </Link>

      <div className="icons">
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
              ? `${item.title} is out of stock`
              : reachedStockLimit
                ? `Maximum available quantity of ${item.title} reached`
                : isInCart
                  ? `${item.title} is already in the cart`
                  : `Add ${item.title} to cart`
          }
        >
          <FaCartArrowDown />
        </button>
        <button
          type="button"
          className={`btn_wishlist ${isInFav ? "in-fav" : ""}`}
          onClick={handleAddToFav}
          aria-pressed={Boolean(isInFav)}
          aria-label={
            isInFav
              ? `Remove ${item.title} from wishlist`
              : `Add ${item.title} to wishlist`
          }
        >
          {isInFav ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
