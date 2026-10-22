import { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminOrders.css";
function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    api
      .get("/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setOrders(res.data);
      })
      .catch(() => {
        setError("Failed to load orders");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleStatusChange = async (orderId, status) => {
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
    } catch (error) {
      console.error(error);
    }
  };
  if (loading) {
    return <p>Loading orders...</p>;
  }

  if (error) {
    return <p>{error}</p>;
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
