import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { ErrorState } from "../../components";
import RiyalSymbol from "../../components/common/RiyalSymbol";
import AdminNotificationBell from "../../components/Admin/AdminNotificationBell";
import { useLanguage } from "../../context/LanguageContext";
import "./AdminOrders.css";

function AdminOrders() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [updatingOrderId, setUpdatingOrderId] = useState("");

  useEffect(() => {
    let isActive = true;

    api
      .get("/admin/orders")
      .then((res) => {
        if (isActive) setOrders(res.data);
      })
      .catch(() => {
        if (isActive) {
          setError(t("serverError") || "Could not load orders. Please try again.");
        }
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [retryCount, t]);

  const handleStatusChange = async (orderId, status) => {
    if (updatingOrderId) return;

    setUpdatingOrderId(orderId);

    try {
      const res = await api.patch(
        `/admin/orders/${orderId}/status`,
        { status },
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? res.data.order : order,
        ),
      );

      toast.success(t("orderStatusUpdated") || "Order status updated successfully");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          t("serverError") ||
          "Failed to update order status. Please try again.",
      );
    } finally {
      setUpdatingOrderId("");
    }
  };

  if (loading) {
    return <p>{t("loading")}</p>;
  }

  if (error) {
    return (
      <ErrorState
        title={t("serverError") || "Could not load orders"}
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
        <div className="admin-page-header">
          <h1 className="admin-orders-title">{t("adminOrdersTitle")}</h1>
          <AdminNotificationBell />
        </div>

        {orders.map((order) => (
          <div className="admin-order-card" key={order._id}>
            <h3 className="admin-order-id-heading">
              <span>{t("orderId")}:</span>{" "}
              <bdi className="admin-order-id-value" dir="ltr">
                #{order._id}
              </bdi>
            </h3>

            <p className="admin-order-field">
              <span className="admin-order-label">{t("orderCustomer")}</span>{" "}
              <bdi className="admin-order-value">
                {order.user?.name || order.shippingAddress?.fullName || t("anonymousCustomer")}
              </bdi>
            </p>

            <p className="admin-order-field">
              <span className="admin-order-label">{t("orderEmail")}</span>{" "}
              <bdi className="admin-order-value" dir="ltr">
                {order.user?.email || "—"}
              </bdi>
            </p>

            <p className="admin-order-field">
              <span className="admin-order-label">{t("orderTotal")}</span>{" "}
              <span className="admin-order-value">
                <bdi dir="ltr">{Number(order.total || 0).toLocaleString()}</bdi> <RiyalSymbol />
              </span>
            </p>

            <div className="admin-order-status-row">
              <label className="admin-order-label" htmlFor={`order-status-${order._id}`}>
                {t("orderStatus")}
              </label>

              <select
                id={`order-status-${order._id}`}
                className="admin-order-status-select"
                value={order.status}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                disabled={
                  updatingOrderId === order._id ||
                  order.status === "Cancelled"
                }
              >
                <option value="Processing">{t("statusProcessing")}</option>
                <option value="Shipped">{t("statusShipped")}</option>
                <option value="Delivered">{t("statusDelivered")}</option>
                <option value="Cancelled">{t("statusCancelled")}</option>
              </select>
            </div>

            <div>
              <div className="admin-order-address-box">
                <h4>{t("orderShippingAddress")}</h4>

                <p className="admin-order-field">
                  <span className="admin-order-label">{t("orderRecipientName")}</span>{" "}
                  <bdi className="admin-order-value">
                    {order.shippingAddress?.fullName || "—"}
                  </bdi>
                </p>
                <p className="admin-order-field">
                  <span className="admin-order-label">{t("orderPhone")}</span>{" "}
                  <bdi className="admin-order-value" dir="ltr">
                    {order.shippingAddress?.phone || "—"}
                  </bdi>
                </p>
                <p className="admin-order-field">
                  <span className="admin-order-label">{t("orderAddress")}</span>{" "}
                  <bdi className="admin-order-value">
                    {order.shippingAddress?.address || "—"}
                  </bdi>
                </p>
              </div>

              <h4>{t("orderItems")}</h4>

              {order.items.map((item) => (
                <div className="admin-order-item" key={item._id}>
                  <p className="admin-order-item-name">{item.name}</p>
                  <p className="admin-order-field">
                    <span className="admin-order-label">{t("orderQuantity")}</span>{" "}
                    <bdi className="admin-order-value" dir="ltr">
                      {item.quantity}
                    </bdi>
                  </p>
                  <p className="admin-order-field">
                    <span className="admin-order-label">{t("orderPrice")}</span>{" "}
                    <span className="admin-order-value">
                      <bdi dir="ltr">{Number(item.price || 0).toLocaleString()}</bdi> <RiyalSymbol />
                    </span>
                  </p>
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
