const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "NEW_ORDER",
    },
    title: {
      type: String,
      required: true,
      default: "New order received!",
    },
    message: {
      type: String,
      default: "",
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, // Guarantees no duplicate notifications for the same order
    },
    orderTotal: {
      type: Number,
      required: true,
    },
    customerName: {
      type: String,
      default: "Customer",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);

