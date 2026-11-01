import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { formatPrice, getEffectivePrice } from "../utils/formatPrice";
import { useLanguage } from "../context/LanguageContext";
import "./CartPage.css";

function CartPage() {
  const { t } = useLanguage();
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    addToFavorites,
  } = useContext(CartContext);

  const total = cartItems.reduce(
    (sum, item) => sum + getEffectivePrice(item) * item.quantity,
    0,
  );

  return (
    <div className="cart-page">
      <h1 className="cart-title">{t("shoppingCart")}</h1>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <h2>{t("emptyCartTitle")}</h2>
          <p>{t("emptyCartDesc")}</p>
          <Link to="/" className="continue-shopping">
            {t("continueShopping")}
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-list">
            {cartItems.map((item) => {
              const effectivePrice = getEffectivePrice(item);
              const hasDiscount = Number(item.discount) > 0;

              return (
                <div className="cart-item" key={item.id}>
                  <img src={item.image} alt={item.title} />

                  <div className="cart-item-info">
                    <h2>{item.title}</h2>
                    <div className="cart-price-container">
                      {hasDiscount ? (
                        <>
                          <span className="cart-price discounted">
                            {formatPrice(effectivePrice)}
                          </span>
                          <span className="cart-original-price">
                            {formatPrice(item.price)}
                          </span>
                          <span className="cart-discount-badge">
                            -{item.discount}%
                          </span>
                        </>
                      ) : (
                        <span className="cart-price">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="quantity-controls">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() => increaseQuantity(item.id)}
                      disabled={item.quantity >= item.stock}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <div className="item-total">
                    <span className="item-total-label">{t("itemTotalLabel")}</span>
                    <span className="item-total-value">
                      {formatPrice(effectivePrice * item.quantity)}
                    </span>
                  </div>

                  <div className="cart-actions">
                    <button
                      className="save-btn"
                      onClick={() => {
                        addToFavorites(item);
                        removeFromCart(item.id);
                        toast.success(`${item.title} ${t("movedToWishlist")}`);
                      }}
                    >
                      {t("saveForLater")}
                    </button>

                    <button
                      className="remove-btn"
                      onClick={() => {
                        removeFromCart(item.id);
                        toast.success(`${item.title} ${t("removedFromCart")}`);
                      }}
                    >
                      {t("remove")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="order-summary">
            <h2>{t("orderSummary")}</h2>

            <div className="summary-row">
              <span>{t("subtotal")}</span>
              <span>{formatPrice(total)}</span>
            </div>

            <div className="summary-row">
              <span>{t("shipping")}</span>
              <span>{t("free")}</span>
            </div>

            <hr />

            <div className="summary-total">
              <span>{t("total")}</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Link to="/checkout" className="checkout-btn">
              {t("checkout")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
