import { useContext } from "react";
import { FaStar, FaRegStar, FaRegStarHalfStroke } from "react-icons/fa6";
import {
  FaCartArrowDown,
  FaRegHeart,
  FaHeart,
  FaShare,
  FaCheck,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CartContext } from "../../context/CartContext";

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

  const handleAddToCart = (e) => {
    e.preventDefault(); // لمنع الانتقال لصفحة التفاصيل عند الضغط على الزر
    addToCart(item);
    toast.success(
      <div
        className="toast-wrapper"
        style={{ display: "flex", alignItems: "center", gap: "10px" }}
      >
        <img
          src={item.thumbnail || item.images[0]}
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
    <div className={`product ${isInCart ? "in-cart" : ""}`}>
      <Link
        to={`/products/${item.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        {isInCart && (
          <span className="status_cart">
            <FaCheck /> in cart
          </span>
        )}

        <div className="img_product">
          <img src={item.thumbnail || item.images[0]} alt={item.title} />
        </div>

        <p className="name_product">{item.title}</p>
        <div className="stars">
          {[0, 1, 2, 3, 4].map((star) => {
            if (item.rating >= star + 1) {
              return <FaStar key={star} />;
            }

            if (item.rating >= star + 0.5) {
              return <FaRegStarHalfStroke key={star} />;
            }

            return <FaRegStar key={star} />;
          })}
        </div>

        <p className="price">
          <span>$ {item.price}</span>
        </p>
      </Link>

      <div className="icons">
        <span className="btn_addtocart" onClick={handleAddToCart}>
          <FaCartArrowDown />
        </span>
        <span className={`${isInFav ? "in-fav" : ""}`} onClick={handleAddToFav}>
          {isInFav ? <FaHeart /> : <FaRegHeart />}
        </span>
        <span>
          <FaShare />
        </span>
      </div>
    </div>
  );
}

export default ProductCard;
