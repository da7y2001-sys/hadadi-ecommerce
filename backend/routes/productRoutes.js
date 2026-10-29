const express = require("express");
const router = express.Router();

const {
  createProduct,
  getCategories,
  getProductSuggestions,
  getProducts,
  getBestSellingProducts,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const {
  getProductReviews,
  getMyProductReview,
  createProductReview,
} = require("../controllers/reviewController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Create product
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createProduct
);

// Categories
router.get("/categories", getCategories);

// Search suggestions
router.get("/suggest", getProductSuggestions);

// Get all products
router.get("/", getProducts);

// Search products
router.get("/search", searchProducts);

router.get("/best-selling", getBestSellingProducts);

// Product Reviews
router.get("/:productId/reviews/my-review", authMiddleware, getMyProductReview);
router.get("/:productId/reviews", getProductReviews);
router.post("/:productId/reviews", authMiddleware, createProductReview);

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