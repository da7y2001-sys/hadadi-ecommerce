const express = require("express");
const router = express.Router();

const {
  createOrder,
  getUserOrders,
  cancelOrder,
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createOrder);

router.get("/", authMiddleware, getUserOrders);

router.patch("/:id/cancel", authMiddleware, cancelOrder);

module.exports = router;