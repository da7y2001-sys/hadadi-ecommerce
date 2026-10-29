const mongoose = require("mongoose");
const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");

// Recalculates rating statistics from Review documents for a product
async function updateProductRatingStats(productId, session = null) {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$product",
        ratingCount: { $sum: 1 },
        ratingAverage: { $avg: "$rating" },
      },
    },
  ]).session(session);

  const ratingCount = stats.length > 0 ? stats[0].ratingCount : 0;
  const ratingAverage =
    stats.length > 0 ? Math.round(stats[0].ratingAverage * 10) / 10 : 0;

  await Product.findByIdAndUpdate(
    productId,
    { ratingAverage, ratingCount },
    { session }
  );

  return { ratingAverage, ratingCount };
}

// GET /products/:productId/reviews (Public)
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const reviews = await Review.find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Failed to get product reviews:", error);
    res.status(500).json({
      message: "Failed to get reviews",
    });
  }
};

// GET /products/:productId/reviews/my-review (Authenticated)
const getMyProductReview = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const userId = req.user?.userId || req.user?.id;
    const review = await Review.findOne({
      product: productId,
      user: userId,
    }).populate("user", "name");

    res.json({ review: review || null });
  } catch (error) {
    console.error("Failed to get user review:", error);
    res.status(500).json({
      message: "Failed to get review",
    });
  }
};

// POST /products/:productId/reviews (Authenticated)
const createProductReview = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        message: "Cannot review an inactive product",
      });
    }

    const { rating, comment } = req.body || {};

    if (
      typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be a whole number between 1 and 5",
      });
    }

    if (
      typeof comment !== "string" ||
      comment.trim().length < 3 ||
      comment.trim().length > 1000
    ) {
      return res.status(400).json({
        message: "Comment must be between 3 and 1000 characters",
      });
    }

    const userId = req.user?.userId || req.user?.id;
    // Check if user already reviewed
    const existingReview = await Review.findOne({
      product: productId,
      user: userId,
    });

    if (existingReview) {
      return res.status(409).json({
        message: "You have already reviewed this product",
      });
    }

    // Check if user has purchased this product (qualifies if order contains product and status !== Cancelled)
    const hasPurchased = await Order.exists({
      user: userId,
      "items.product": productId,
      status: { $ne: "Cancelled" },
    });

    const review = await Review.create({
      user: userId,
      product: productId,
      rating,
      comment: comment.trim(),
      isVerifiedPurchase: Boolean(hasPurchased),
    });

    await updateProductRatingStats(productId);
    await review.populate("user", "name");

    res.status(201).json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already reviewed this product",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    console.error("Failed to create review:", error);
    res.status(500).json({
      message: "Failed to submit review",
    });
  }
};

// PATCH /reviews/:id (Authenticated - Owner only)
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid review ID",
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    const userId = (req.user?.userId || req.user?.id)?.toString();
    // Ownership check
    if (review.user.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to update this review",
      });
    }

    const { rating, comment } = req.body || {};

    if (rating !== undefined) {
      if (
        typeof rating !== "number" ||
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
      ) {
        return res.status(400).json({
          message: "Rating must be a whole number between 1 and 5",
        });
      }
      review.rating = rating;
    }

    if (comment !== undefined) {
      if (
        typeof comment !== "string" ||
        comment.trim().length < 3 ||
        comment.trim().length > 1000
      ) {
        return res.status(400).json({
          message: "Comment must be between 3 and 1000 characters",
        });
      }
      review.comment = comment.trim();
    }

    await review.save();
    await updateProductRatingStats(review.product);
    await review.populate("user", "name");

    res.json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    console.error("Failed to update review:", error);
    res.status(500).json({
      message: "Failed to update review",
    });
  }
};

// DELETE /reviews/:id (Authenticated - Owner or Admin)
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid review ID",
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    const userId = (req.user?.userId || req.user?.id)?.toString();
    const isOwner = review.user.toString() === userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You are not authorized to delete this review",
      });
    }

    const productId = review.product;

    await Review.findByIdAndDelete(id);
    await updateProductRatingStats(productId);

    res.json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete review:", error);
    res.status(500).json({
      message: "Failed to delete review",
    });
  }
};

module.exports = {
  updateProductRatingStats,
  getProductReviews,
  getMyProductReview,
  createProductReview,
  updateReview,
  deleteReview,
};
