import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { Link } from "react-router-dom";
import { ErrorState } from "../components";
import { formatPrice } from "../utils/formatPrice";
import { useLanguage } from "../context/LanguageContext";
import ProductImage from "../components/common/ProductImage";

import "./OrdersPage.css";

function OrdersPage() {
  const { t } = useLanguage();
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

      toast.success(res.data.message || "Order cancelled successfully");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Could not cancel order. Please try again",
      );
    } finally {
      setCancellingOrderId("");
    }
  };

  useEffect(() => {
    let isActive = true;

    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get("/orders");

        if (!isActive) return;

        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (!isActive) return;

        setError(
          err.response?.data?.message ||
            "Could not load orders. Please try again",
        );
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isActive = false;
    };
  }, [retryCount]);

  if (loading) {
    return <p style={{ textAlign: "center", padding: "60px 0" }}>{t("loadingCategories")}</p>;
  }

  if (error) {
    return (
      <div className="container">
        <ErrorState
          title={t("ordersTitle")}
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
        <h1>{t("ordersTitle")}</h1>
        <p>{t("noOrdersDesc")}</p>
        <Link to="/" className="shop-now-btn">
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  const getTranslatedStatus = (status) => {
    switch (status?.toLowerCase()) {
      case "processing":
        return t("statusProcessing");
      case "shipped":
        return t("statusShipped");
      case "delivered":
        return t("statusDelivered");
      case "cancelled":
        return t("statusCancelled");
      default:
        return status;
    }
  };

  return (
    <div className="orders-page">
      <h1>{t("ordersTitle")}</h1>

      {orders.map((order) => (
        <div className="order-card" key={order._id}>
          <h2>{t("orderId")} #{order._id}</h2>

          <p className="order-info">{t("fullName")}: {order.shippingAddress?.fullName}</p>

          <p className="order-info">{t("phone")}: {order.shippingAddress?.phone}</p>

          <p className="order-info">
            {t("orderAddress")} {order.shippingAddress?.address}
          </p>

          <p className="order-info">
            {t("orderDate")} {new Date(order.createdAt).toLocaleDateString()}
          </p>
          <p>
            {t("orderStatus")}{" "}
            <span
              className={`order-status status-${order.status?.toLowerCase()}`}
            >
              {getTranslatedStatus(order.status)}
            </span>
          </p>
          {order.items.map((item) => (
            <div className="order-item" key={item._id}>
              <ProductImage src={item.image} alt={item.name} />

              <p>{item.name}</p>

              <p>
                {item.quantity} × {formatPrice(item.price)}
              </p>
            </div>
          ))}

          <h3 className="order-total">{t("total")}: {formatPrice(order.total)}</h3>

          {order.status === "Processing" && (
            <div className="order-actions">
              <button
                type="button"
                className="cancel-order-btn"
                onClick={() => handleCancelOrder(order._id)}
                disabled={cancellingOrderId === order._id}
              >
                {cancellingOrderId === order._id
                  ? t("cancellingOrder")
                  : t("cancelOrder")}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default OrdersPage;
