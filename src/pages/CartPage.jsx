import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import "./CartPage.css";
function CartPage() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    addToFavorites,
  } = useContext(CartContext);
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  return (
    <div className="cart-page">
      <h1 className="cart-title">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <h2>Your Cart is Empty</h2>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/" className="continue-shopping">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          {cartItems.map((item) => (
            <div className="cart-item" key={item.id}>
              <img src={item.thumbnail} alt={item.title} />

              <div className="cart-item-info">
                <h2>{item.title}</h2>

                <p className="cart-price">${item.price}</p>
                <p className="item-total">
                  Total: ${(item.price * item.quantity).toFixed(2)}
                </p>

                <div className="quantity-controls">
                  <button onClick={() => decreaseQuantity(item.id)}>-</button>

                  <span>{item.quantity}</span>

                  <button onClick={() => increaseQuantity(item.id)}>+</button>
                </div>

                <div className="cart-actions">
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>

                  <button
                    className="save-btn"
                    onClick={() => {
                      addToFavorites(item);
                      removeFromCart(item.id);
                    }}
                  >
                    Save for later
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="order-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <hr />

            <div className="summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <Link to="/checkout" className="checkout-btn">
              Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
export default CartPage;
