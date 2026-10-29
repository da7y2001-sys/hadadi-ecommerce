const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getBestSellingProducts,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Create product
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createProduct
);

// Get all products
router.get("/", getProducts);

// Search products
router.get("/search", searchProducts);

router.get("/best-selling", getBestSellingProducts);

// Get product by ID
router.get("/:id", getProductById);

// Update product
router.patch(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateProduct
);

// Delete product
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteProduct
);

module.exports = router;