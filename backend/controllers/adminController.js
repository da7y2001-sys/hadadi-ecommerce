const mongoose = require("mongoose");
const Order = require("../models/Order");

const User = require("../models/User");
const Notification = require("../models/Notification");
const { restoreOrderInventory, OrderError } = require("./orderController");

// Get all orders for admin
const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Failed to get admin orders:", error);

    res.status(500).json({
      message: "Failed to get orders",
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  const { status } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      message: "Invalid order ID",
    });
  }

  const allowedStatuses = [
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid order status",
    });
  }

  let session;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      await session.abortTransaction();

      return res.status(404).json({
        message: "Order not found",
      });
    }

    const validTransitions = {
      Processing: ["Shipped", "Delivered", "Cancelled"],
      Shipped: ["Delivered", "Cancelled"],
      Delivered: [],
      Cancelled: [],
    };

    const allowedNextStatuses = validTransitions[order.status] || [];

    if (!allowedNextStatuses.includes(status)) {
      await session.abortTransaction();

      if (order.status === "Cancelled") {
        return res.status(400).json({
          message: "Cancelled orders cannot be changed to another status",
        });
      }

      if (order.status === "Delivered") {
        return res.status(400).json({
          message:
            "Delivered orders cannot be changed to Cancelled or any other status",
        });
      }

      if (order.status === status) {
        return res.status(400).json({
          message: `Order is already in '${status}' status`,
        });
      }

      return res.status(400).json({
        message: `Cannot transition order status from '${order.status}' to '${status}'`,
      });
    }

    // Restore stock and decrease sold count atomically when transitioning to Cancelled
    if (status === "Cancelled" && order.status !== "Cancelled") {
      await restoreOrderInventory(order.items, session);
    }

    order.status = status;

    await order.save({ session });
    await session.commitTransaction();

    res.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    if (session?.inTransaction()) {
      await session.abortTransaction();
    }

    if (error instanceof OrderError) {
      return res.status(error.status).json({
        message: error.message,
      });
    }

    console.error("Failed to update order status:", error);

    res.status(500).json({
      message: "Failed to update order status",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

// Get all users for admin
const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error("Failed to get admin users:", error);

    res.status(500).json({
      message: "Failed to get users",
    });
  }
};

// Get all notifications for admin
const getAdminNotifications = async (req, res) => {
  try {
    // Backfill from existing orders if notification collection is empty
    const count = await Notification.countDocuments();
    if (count === 0) {
      const recentOrders = await Order.find()
        .populate("user", "name")
        .sort({ createdAt: -1 })
        .limit(10);

      if (recentOrders.length > 0) {
        const backfill = recentOrders.map((ord) => ({
          type: "NEW_ORDER",
          title: "New order received!",
          message: `Order #${ord._id.toString().slice(-6)} received with total ${ord.total} SAR`,
          orderId: ord._id,
          orderTotal: ord.total,
          customerName: ord.shippingAddress?.fullName || ord.user?.name || "Customer",
          isRead: true, // Historical orders are marked as read so they do not show as new unread orders
          createdAt: ord.createdAt,
        }));
        await Notification.insertMany(backfill, { ordered: false }).catch(() => {});
      }
    }

    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Failed to get admin notifications:", error);
    res.status(500).json({
      message: "Failed to get notifications",
    });
  }
};

// Mark single notification as read
const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.json({
      notification,
      unreadCount,
    });
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    res.status(500).json({
      message: "Failed to mark notification as read",
    });
  }
};

// Mark all notifications as read
const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });

    res.json({
      message: "All notifications marked as read",
      unreadCount: 0,
    });
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    res.status(500).json({
      message: "Failed to mark all notifications as read",
    });
  }
};

module.exports = {
  getAdminOrders,
  updateOrderStatus,
  getAdminUsers,
  getAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};