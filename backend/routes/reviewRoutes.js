const express = require("express");
const router = express.Router();

const {
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const authMiddleware = require("../middleware/authMiddleware");

// Update review (Owner only)
router.patch("/:id", authMiddleware, updateReview);

// Delete review (Owner or Admin)
router.delete("/:id", authMiddleware, deleteReview);

module.exports = router;
