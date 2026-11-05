import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useLanguage } from "./LanguageContext";

const AdminNotificationContext = createContext(null);

export function AdminNotificationProvider({ children }) {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const seenNotificationIds = useRef(new Set());
  const initialLoadDone = useRef(false);

  // Core fetch function
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get("/admin/notifications");
      if (!res.data) return;

      const latestNotifs = res.data.notifications || [];
      setNotifications(latestNotifs);
      setUnreadCount(res.data.unreadCount || 0);

      // On initial load, record all existing IDs so we never toast historical orders
      if (!initialLoadDone.current) {
        latestNotifs.forEach((n) => seenNotificationIds.current.add(n._id));
        initialLoadDone.current = true;
      } else {
        // Subsequent polling checks for newly arrived unread notifications
        latestNotifs.forEach((n) => {
          if (!n.isRead && !seenNotificationIds.current.has(n._id)) {
            seenNotificationIds.current.add(n._id);

            const orderSnippet = n.orderId
              ? n.orderId.toString().slice(-6)
              : "";
            const toastMsg = isRTL
              ? `تم استلام طلب جديد! #${orderSnippet} بقيمة ${n.orderTotal} ر.س`
              : `New order received! #${orderSnippet} (${n.orderTotal} SAR)`;

            toast.success(toastMsg, {
              duration: 6000,
              position: isRTL ? "top-left" : "top-right",
              icon: "🛍️",
            });
          }
        });
      }
    } catch (err) {
      console.warn("Admin notifications fetch notice:", err.message);
    } finally {
      setLoading(false);
    }
  }, [isRTL]);

  // Periodic polling every 15 seconds while AdminLayout is mounted
  useEffect(() => {
    let isSubscribed = true;

    const poll = async () => {
      if (isSubscribed) {
        await fetchNotifications();
      }
    };

    poll();

    const intervalId = setInterval(poll, 15000);

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  }, [fetchNotifications]);

  // Mark single notification as read
  const markNotificationRead = async (id) => {
    try {
      const res = await api.patch(`/admin/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isRead: true } : item
        )
      );
      if (typeof res.data?.unreadCount === "number") {
        setUnreadCount(res.data.unreadCount);
      } else {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.warn("Failed to mark notification as read:", err.message);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isRead: true } : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await api.patch("/admin/notifications/read-all");
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.warn("Failed to mark all notifications as read:", err.message);
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true }))
      );
      setUnreadCount(0);
    }
  };

  return (
    <AdminNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markNotificationRead,
        markAllAsRead,
      }}
    >
      {children}
    </AdminNotificationContext.Provider>
  );
}

// This module intentionally exports the provider and its hook together.
// eslint-disable-next-line react-refresh/only-export-components
export function useAdminNotifications() {
  const context = useContext(AdminNotificationContext);
  if (!context) {
    return {
      notifications: [],
      unreadCount: 0,
      loading: false,
      fetchNotifications: () => {},
      markNotificationRead: () => {},
      markAllAsRead: () => {},
    };
  }
  return context;
}
