import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import { formatPrice } from "../utils/formatPrice";

import "./OrdersPage.css";
function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    api
      .get("/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setOrders(res.data);
      })
      .catch((error) => {
        console.log("Failed to get orders:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading orders...</p>;
  }
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

      {orders.map((order) => (
        <div className="order-card" key={order._id}>
          <h2>Order #{order._id}</h2>

          <p className="order-info">Name: {order.shippingAddress.fullName}</p>

          <p className="order-info">Phone: {order.shippingAddress.phone}</p>

          <p className="order-info">Address: {order.shippingAddress.address}</p>

          <p className="order-info">
            Date: {new Date(order.createdAt).toLocaleDateString()}
          </p>
          <p>
            Status: <span className="order-status">{order.status}</span>
          </p>
          {order.items.map((item) => (
            <div className="order-item" key={item._id}>
              <img src={item.product.image} alt={item.product.name} />

              <p>{item.product.name}</p>

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
