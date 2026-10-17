import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { formatPrice } from "../utils/formatPrice";
import "./CheckoutPage.css";

function CheckoutPage() {
  const navigate = useNavigate();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const { cartItems, clearCart, addOrder } = useContext(CartContext);
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
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

      <form
        className="checkout-form"
        onSubmit={(e) => {
          e.preventDefault();

          const formData = new FormData(e.target);
          const orderData = {
            id: Date.now(),
            customer: Object.fromEntries(formData),
            items: cartItems,
            total: total,
            date: new Date().toISOString(),
            status: "Processing",
          };

          console.log("Order Data:", orderData);

          addOrder(orderData);
          clearCart();
          e.target.reset();
          setOrderSuccess(true);
        }}
      >
        <div>
          <label>Full Name</label>
          <input name="fullName" type="text" required />
        </div>

        <div>
          <label>Email</label>
          <input name="email" type="email" required />
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

        <button className="place-order-btn" type="submit">
          Place Order
        </button>
      </form>
    </div>
  );
}

export default CheckoutPage;
