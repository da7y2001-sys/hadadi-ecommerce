import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { ErrorState } from "../../components";
import "./AdminOrders.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [updatingOrderId, setUpdatingOrderId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    let isActive = true;

    api
      .get("/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (isActive) setOrders(res.data);
      })
      .catch(() => {
        if (isActive) {
          setError("Could not load orders. Please try again.");
        }
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [retryCount]);

  const handleStatusChange = async (orderId, status) => {
    if (updatingOrderId) return;

    setUpdatingOrderId(orderId);

    try {
      const token = localStorage.getItem("token");

      const res = await api.patch(
        `/admin/orders/${orderId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? res.data.order : order,
        ),
      );

      toast.success("Order status updated successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update order status. Please try again.",
      );
    } finally {
      setUpdatingOrderId("");
    }
  };

  if (loading) {
    return <p>Loading orders...</p>;
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load orders"
        message={error}
        onRetry={() => {
          setLoading(true);
          setError("");
          setRetryCount((count) => count + 1);
        }}
      />
    );
  }

  return (
    <div>
      <div className="admin-orders-page">
        <h1 className="admin-orders-title">Admin Orders</h1>

        {orders.map((order) => (
          <div className="admin-order-card" key={order._id}>
            <h3>Order: {order._id}</h3>

            <p>Customer: {order.user?.name}</p>

            <p>Email: {order.user?.email}</p>

            <p>Total: {order.total}</p>

            <div>
              <label>Status: </label>

              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                disabled={
                  updatingOrderId === order._id ||
                  order.status === "Cancelled"
                }
              >
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <div>
                <h4>Shipping Address</h4>

                <p>Name: {order.shippingAddress?.fullName}</p>
                <p>Phone: {order.shippingAddress?.phone}</p>
                <p>Address: {order.shippingAddress?.address}</p>
              </div>
              <h4>Items</h4>

              {order.items.map((item) => (
                <div className="admin-order-item" key={item._id}>
                  <p>{item.name}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Price: {item.price}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminOrders;
