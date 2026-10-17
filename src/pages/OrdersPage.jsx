import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import { formatPrice } from "../utils/formatPrice";

import "./OrdersPage.css";
function OrdersPage() {
  const { orders } = useContext(CartContext);
  if (orders.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <h1>My Orders</h1>
        <p>No Orders Yet</p>
        <Link to="/" className="shop-now-btn">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1>My Orders</h1>

      {orders.map((order, index) => (
        <div className="order-card" key={index}>
          <h2>Order #{order.id}</h2>
          <p className="order-info">Name: {order.customer.fullName}</p>
          <p className="order-info">Email: {order.customer.email}</p>
          <p className="order-info">
            Date: {new Date(order.date).toLocaleDateString()}
          </p>
          <p>
            Status: <span className="order-status">{order.status}</span>
          </p>
          {order.items.map((item) => (
            <div className="order-item" key={item.id}>
              <img src={item.thumbnail} alt={item.title} />
              <p>{item.title}</p>
              <p>
                {item.quantity} × {formatPrice(item.price)}
              </p>
            </div>
          ))}

          <h3 className="order-total">Total: {formatPrice(order.total)}</h3>
        </div>
      ))}
    </div>
  );
}

export default OrdersPage;
