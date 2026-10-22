import { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { formatPrice } from "../utils/formatPrice";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";
import "./CheckoutPage.css";

function CheckoutPage() {
  const navigate = useNavigate();
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
    (sum, item) => sum + item.price * item.quantity,
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

      const token = localStorage.getItem("token");

      await api.post("/orders", orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Order placed successfully");

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
        <h1>🎉 Order placed successfully!</h1>
        <p>Your order has been placed successfully.</p>

        <div className="order-success-actions">
          <button onClick={() => navigate("/")}>Continue Shopping</button>

          <button onClick={() => navigate("/orders")}>View Orders</button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="empty-checkout">
        <h2>Your Cart is Empty</h2>
        <p>Add products to your cart before checking out.</p>
        <Link to="/cart" className="empty-checkout-link">
          Go to Cart
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1 className="checkout-title">Checkout</h1>

      <form className="checkout-form" onSubmit={handlePlaceOrder}>
        <div>
          <label>Full Name</label>
          <input
            name="fullName"
            type="text"
            value={user?.name || ""}
            readOnly
          />
        </div>

        <div>
          <label>Email</label>
          <input name="email" type="email" value={user?.email || ""} readOnly />
        </div>

        <div>
          <label>Phone</label>
          <input name="phone" type="tel" required />
        </div>

        <div>
          <label>Address</label>
          <input name="address" type="text" required />
        </div>
        <div className="checkout-items">
          <h2>Order Summary</h2>

          {cartItems.map((item) => (
            <div key={item.id}>
              <p>{item.title}</p>
              <p>
                {item.quantity} × {formatPrice(item.price)}
              </p>
            </div>
          ))}
        </div>
        <div className="checkout-total">
          <h2>Total: {formatPrice(total)}</h2>
        </div>

        <button
          className="place-order-btn"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Placing Order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}

export default CheckoutPage;
