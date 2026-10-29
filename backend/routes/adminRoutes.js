const express = require("express");
const router = express.Router();

const {
  getAdminOrders,
  updateOrderStatus,
  getAdminUsers,
} = require("../controllers/adminController");
const { getAdminProducts } = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Get all products (including inactive) for admin
router.get(
  "/products",
  authMiddleware,
  adminMiddleware,
  getAdminProducts
);

// Get all orders
router.get(
  "/orders",
  authMiddleware,
  adminMiddleware,
  getAdminOrders
);

// Update order status
router.patch(
  "/orders/:id/status",
  authMiddleware,
  adminMiddleware,
  updateOrderStatus
);

// Get all users
router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  getAdminUsers
);

module.exports = router;