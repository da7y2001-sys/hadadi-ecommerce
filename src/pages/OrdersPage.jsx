import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { Link } from "react-router-dom";
import { ErrorState } from "../components";
import { formatPrice } from "../utils/formatPrice";

import "./OrdersPage.css";
function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [cancellingOrderId, setCancellingOrderId] = useState("");

  const handleCancelOrder = async (orderId) => {
    if (cancellingOrderId) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );
    if (!confirmed) return;

    setCancellingOrderId(orderId);

    try {
      const res = await api.patch(`/orders/${orderId}/cancel`);

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? { ...order, status: "Cancelled" }
            : order,
        ),
      );

      toast.success(res.data?.message || "Order cancelled successfully");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to cancel order. Please try again.";
      toast.error(message);
    } finally {
      setCancellingOrderId("");
    }
  };

  useEffect(() => {
    let isActive = true;

    api
      .get("/orders")
      .then((res) => {
        if (isActive) setOrders(res.data);
      })
      .catch(() => {
        if (isActive) {
          setError("We couldn't load your orders. Please try again.");
        }
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [retryCount]);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading orders...</p>;
  }

  if (error) {
    return (
      <div className="container">
        <ErrorState
          title="Could not load orders"
          message={error}
          onRetry={() => {
            setLoading(true);
            setError("");
            setRetryCount((count) => count + 1);
          }}
        />
      </div>
    );
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

          <p className="order-info">Name: {order.shippingAddress?.fullName}</p>

          <p className="order-info">Phone: {order.shippingAddress?.phone}</p>

          <p className="order-info">
            Address: {order.shippingAddress?.address}
          </p>

          <p className="order-info">
            Date: {new Date(order.createdAt).toLocaleDateString()}
          </p>
          <p>
            Status:{" "}
            <span
              className={`order-status status-${order.status?.toLowerCase()}`}
            >
              {order.status}
            </span>
          </p>
          {order.items.map((item) => (
            <div className="order-item" key={item._id}>
              <img src={item.image} alt={item.name} />

              <p>{item.name}</p>

              <p>
                {item.quantity} × {formatPrice(item.price)}
              </p>
            </div>
          ))}

          <h3 className="order-total">Total: {formatPrice(order.total)}</h3>

          {order.status === "Processing" && (
            <div className="order-actions">
              <button
                type="button"
                className="cancel-order-btn"
                onClick={() => handleCancelOrder(order._id)}
                disabled={cancellingOrderId === order._id}
              >
                {cancellingOrderId === order._id
                  ? "Cancelling..."
                  : "Cancel Order"}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default OrdersPage;
