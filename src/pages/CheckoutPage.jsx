import { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { formatPrice, getEffectivePrice } from "../utils/formatPrice";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";
import toast from "react-hot-toast";
import "./CheckoutPage.css";

function CheckoutPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { cartItems, clearCart } = useContext(CartContext);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login", {
        state: { from: "/checkout" },
      });
    }
  }, [user, loading, navigate]);

  const total = cartItems.reduce(
    (sum, item) => sum + getEffectivePrice(item) * item.quantity,
    0,
  );

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target);

      const orderData = {
        items: cartItems.map((item) => ({
          product: item.id,
          quantity: item.quantity,
        })),

        shippingAddress: {
          fullName: formData.get("fullName"),
          phone: formData.get("phone"),
          address: formData.get("address"),
        },
      };

      await api.post("/orders", orderData);

      toast.success(t("orderSuccessTitle"));

      clearCart();
      e.target.reset();
      setOrderSuccess(true);
    } catch (error) {
      if (!error.response) {
        toast.error("Unable to connect to the server. Please try again");
      } else {
        toast.error(
          error.response.data?.message ||
            "Could not place your order. Please try again",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="order-success">
        <h1>{t("orderSuccessTitle")}</h1>
        <p>{t("orderSuccessDesc")}</p>

        <div className="order-success-actions">
          <button onClick={() => navigate("/")}>{t("continueShopping")}</button>

          <button onClick={() => navigate("/orders")}>{t("viewOrders")}</button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="empty-checkout">
        <h2>{t("emptyCheckoutTitle")}</h2>
        <p>{t("emptyCheckoutDesc")}</p>
        <Link to="/cart" className="empty-checkout-link">
          {t("goToCart")}
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1 className="checkout-title">{t("checkoutTitle")}</h1>

      <form className="checkout-form" onSubmit={handlePlaceOrder}>
        <div>
          <label>{t("fullName")}</label>
          <input
            name="fullName"
            type="text"
            value={user?.name || ""}
            readOnly
          />
        </div>

        <div>
          <label>{t("email")}</label>
          <input name="email" type="email" value={user?.email || ""} readOnly />
        </div>

        <div>
          <label>{t("phone")}</label>
          <input name="phone" type="tel" required />
        </div>

        <div>
          <label>{t("address")}</label>
          <input name="address" type="text" required />
        </div>
        <div className="checkout-items">
          <h2>{t("orderSummary")}</h2>

          {cartItems.map((item) => {
            const effectivePrice = getEffectivePrice(item);
            const hasDiscount = Number(item.discount) > 0;

            return (
              <div key={item.id} className="checkout-item-row">
                <p className="checkout-item-title">{item.title}</p>

                <div className="checkout-item-pricing">
                  <span className="checkout-effective-price">
                    {item.quantity} × <strong>{formatPrice(effectivePrice)}</strong>
                  </span>
                  {hasDiscount && (
                    <span className="checkout-orig-price">
                      {formatPrice(item.price)}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="checkout-discount-badge">
                      -{item.discount}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="checkout-total">
          <h2>{t("total")}: {formatPrice(total)}</h2>
        </div>

        <button
          className="place-order-btn"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? t("placingOrder") : t("placeOrder")}
        </button>
      </form>
    </div>
  );
}

export default CheckoutPage;
