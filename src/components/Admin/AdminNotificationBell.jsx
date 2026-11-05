import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiBell, FiShoppingBag, FiCheck } from "react-icons/fi";
import { useAdminNotifications } from "../../context/AdminNotificationContext";
import { useLanguage } from "../../context/LanguageContext";
import RiyalSymbol from "../common/RiyalSymbol";

function formatRelativeTime(dateString, t, isRTL) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return t("justNow");
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return isRTL ? `${diffInMinutes} ${t("minutesAgo")}` : `${diffInMinutes}${t("minutesAgo")}`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return isRTL ? `${diffInHours} ${t("hoursAgo")}` : `${diffInHours}${t("hoursAgo")}`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  return isRTL ? `${diffInDays} ${t("daysAgo")}` : `${diffInDays}${t("daysAgo")}`;
}

function AdminNotificationBell() {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllAsRead,
  } = useAdminNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const bellContainerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        bellContainerRef.current &&
        !bellContainerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markNotificationRead(notif._id);
    }
    setIsOpen(false);
    navigate("/admin/orders");
  };

  return (
    <div className="dashboard-header-actions" ref={bellContainerRef}>
      <button
        type="button"
        className="dashboard-bell-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={t("notificationsTitle")}
        aria-expanded={isOpen}
      >
        <FiBell className="bell-icon" />
        {unreadCount > 0 && (
          <span className="bell-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="dashboard-notifications-panel">
          <div className="notif-panel-header">
            <div className="notif-panel-title-row">
              <h3>{t("notificationsTitle")}</h3>
              {unreadCount > 0 && (
                <span className="notif-count-pill">{unreadCount}</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="notif-mark-all-btn"
                onClick={markAllAsRead}
              >
                <FiCheck /> {t("markAllAsRead")}
              </button>
            )}
          </div>

          <div className="notif-panel-list">
            {notifications.length === 0 ? (
              <div className="notif-empty-state">
                <FiBell className="notif-empty-icon" />
                <p>{t("noNotifications")}</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif._id}
                  type="button"
                  className={`notif-item ${!notif.isRead ? "is-unread" : ""}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="notif-item-icon">
                    <FiShoppingBag />
                  </div>
                  <div className="notif-item-content">
                    <div className="notif-item-top">
                      <strong className="notif-item-title">
                        {t("newOrderNotification")}
                      </strong>
                      <span className="notif-item-time">
                        {formatRelativeTime(notif.createdAt, t, isRTL)}
                      </span>
                    </div>
                    <p className="notif-item-desc">
                      <bdi dir="ltr">#{notif.orderId?.toString().slice(-6) || "---"}</bdi> •{" "}
                      {notif.customerName || t("anonymousCustomer")}
                    </p>
                    <div className="notif-item-amount">
                      <span>{Number(notif.orderTotal || 0).toLocaleString()}</span>
                      <RiyalSymbol />
                    </div>
                  </div>
                  {!notif.isRead && <span className="notif-unread-dot" />}
                </button>
              ))
            )}
          </div>

          <div className="notif-panel-footer">
            <Link
              to="/admin/orders"
              onClick={() => setIsOpen(false)}
            >
              {t("viewAllLink")} {isRTL ? "←" : "→"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNotificationBell;

