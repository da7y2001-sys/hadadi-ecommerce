import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import "./CheckoutPage.css";

function CheckoutPage() {
  const { cartItems, clearCart, addOrder } = useContext(CartContext);
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  return (
    <div className="checkout-page">
      <h1 className="checkout-title">Checkout</h1>

      <form
        className="checkout-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (cartItems.length === 0) {
            alert("Your cart is empty!");
            return;
          }

          const formData = new FormData(e.target);
          const orderData = {
            customer: Object.fromEntries(formData),
            items: cartItems,
            total: total,
            date: new Date().toISOString(),
          };

          console.log("Order Data:", orderData);

          addOrder(orderData);
          clearCart();
          alert("Order placed successfully!");
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
                {item.quantity} × ${item.price}
              </p>
            </div>
          ))}
        </div>
        <div className="checkout-total">
          <h2>Total: ${total.toFixed(2)}</h2>
        </div>

        <button className="place-order-btn" type="submit">
          Place Order
        </button>
      </form>
    </div>
  );
}

export default CheckoutPage;
