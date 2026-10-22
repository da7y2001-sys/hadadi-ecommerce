import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { formatPrice } from "../utils/formatPrice";
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
        <div className="cart-layout">
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div className="cart-item" key={item.id}>
                <img src={item.image} alt={item.title} />

                <div className="cart-item-info">
                  <h2>{item.title}</h2>
                  <p className="cart-price">{formatPrice(item.price)}</p>
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
                  <span className="item-total-label">Total</span>
                  <span className="item-total-value">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>

                <div className="cart-actions">
                  <button
                    className="save-btn"
                    onClick={() => {
                      addToFavorites(item);
                      removeFromCart(item.id);
                      toast.success(`${item.title} moved to wishlist`);
                    }}
                  >
                    Save for later
                  </button>

                  <button
                    className="remove-btn"
                    onClick={() => {
                      removeFromCart(item.id);
                      toast.success(`${item.title} removed from cart`);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <hr />

            <div className="summary-total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Link to="/checkout" className="checkout-btn">
              Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
export default CartPage;
