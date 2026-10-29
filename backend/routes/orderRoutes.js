const express = require("express");
const router = express.Router();

const {
  createOrder,
  getUserOrders,
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createOrder);

router.get("/", authMiddleware, getUserOrders);

module.exports = router;