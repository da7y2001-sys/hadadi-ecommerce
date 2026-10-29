import { useEffect, useState } from "react";
import api from "../../services/api";
import { ErrorState } from "../../components";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    Promise.all([
      api.get("/admin/products"),
      api.get("/admin/orders"),
      api.get("/admin/users"),
    ])
      .then(([productsRes, ordersRes, usersRes]) => {
        if (!isActive) return;

        setProducts(productsRes.data);
        setOrders(ordersRes.data);
        setUsers(usersRes.data);
      })
      .catch(() => {
        if (isActive) {
          setError("Could not load dashboard data. Please try again.");
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [retryCount]);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load dashboard"
        message={error}
        onRetry={() => {
          setLoading(true);
          setError("");
          setRetryCount((count) => count + 1);
        }}
      />
    );
  }

  const totalSales = orders.reduce(
    (total, order) => total + Number(order.total || 0),
    0,
  );

  const processingOrders = orders.filter(
    (order) => order.status === "Processing",
  ).length;

  const shippedOrders = orders.filter(
    (order) => order.status === "Shipped",
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered",
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "Cancelled",
  ).length;

  const recentOrders = [...orders].slice(-5).reverse();

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="dashboard-stats">
        <div className="dashboard-card">
          <h3>Products</h3>
          <p>{products.length}</p>
        </div>

        <div className="dashboard-card">
          <h3>Orders</h3>
          <p>{orders.length}</p>
        </div>

        <div className="dashboard-card">
          <h3>Users</h3>
          <p>{users.length}</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Sales</h3>
          <p>{totalSales.toLocaleString()} SAR</p>
        </div>
      </div>

      <div className="dashboard-sections">
        <section className="dashboard-section">
          <h2>Order Status</h2>

          <div className="order-status-list">
            <p>
              Processing <strong>{processingOrders}</strong>
            </p>

            <p>
              Shipped <strong>{shippedOrders}</strong>
            </p>

            <p>
              Delivered <strong>{deliveredOrders}</strong>
            </p>

            <p>
              Cancelled <strong>{cancelledOrders}</strong>
            </p>
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Recent Orders</h2>

          {recentOrders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            <div className="recent-orders">
              {recentOrders.map((order) => (
                <div className="recent-order" key={order._id}>
                  <div>
                    <strong>#{order._id.slice(-6)}</strong>

                    <p>{order.user?.name}</p>
                  </div>

                  <div>
                    <strong>
                      {Number(order.total || 0).toLocaleString()} SAR
                    </strong>

                    <p>{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
