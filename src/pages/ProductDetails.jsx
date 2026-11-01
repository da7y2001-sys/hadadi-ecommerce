import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { ProductCard, ErrorState } from "../components";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import api from "../services/api";
import toast from "react-hot-toast";
import { FaHeart, FaRegHeart, FaStar, FaRegStar } from "react-icons/fa";
import "./ProductDetails.css";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice, getEffectivePrice } from "../utils/formatPrice";
import { useLanguage } from "../context/LanguageContext";

function ProductDetails() {
  const { t } = useLanguage();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, addToFavorites, favorites, removeFromFavorites } =
    useContext(CartContext);

  // Reviews states
  const [reviews, setReviews] = useState([]);
  const [reviewVersion, setReviewVersion] = useState(0);
  const [myReview, setMyReview] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Create review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Edit review state
  const [editingReview, setEditingReview] = useState(false);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [updatingReview, setUpdatingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState(false);

  const isInFav = favorites.some((item) => item.id === product?.id);
  const isOutOfStock = product?.stock === 0;

  const discount = Number(product?.discount) || 0;

  const discountedPrice = getEffectivePrice(product);

  const handleAddToCart = () => {
    if (addToCart(product)) {
      toast.success(`${product.title} ${t("addedToCartSuccess")}`);
    }
  };

  useEffect(() => {
    let isActive = true;

    const fetchProductAndReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const [prodRes, revsRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/reviews`),
        ]);

        if (!isActive) return;

        const formattedProduct = {
          ...prodRes.data,
          id: prodRes.data._id,
          title: prodRes.data.name,
        };

        setProduct(formattedProduct);
        setSelectedImage(formattedProduct.image);
        setReviews(revsRes.data);
      } catch (err) {
        if (!isActive) return;
        setError(err);
      } finally {
        if (isActive) {
          setLoading(false);
          setLoadingReviews(false);
        }
      }
    };

    fetchProductAndReviews();

    return () => {
      isActive = false;
    };
  }, [id, retryCount, reviewVersion]);

  useEffect(() => {
    let isActive = true;

    if (!user) {
      return;
    }

    const fetchUserReview = async () => {
      try {
        const res = await api.get(`/products/${id}/reviews/my-review`);
        if (!isActive) return;
        setMyReview(res.data?.review || null);
        if (res.data?.review) {
          setEditRating(res.data.review.rating);
          setEditComment(res.data.review.comment);
        }
      } catch {
        if (!isActive) return;
        setMyReview(null);
      }
    };

    fetchUserReview();

    return () => {
      isActive = false;
    };
  }, [id, user, reviewVersion]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return;

      try {
        const res = await api.get(`/products`);

        const formattedProducts = res.data.map((item) => ({
          ...item,
          id: item._id,
          title: item.name,
        }));

        const filteredProducts = formattedProducts.filter(
          (item) => item.id !== product.id,
        );

        setRelatedProducts(filteredProducts);
      } catch {
        setRelatedProducts([]);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (submittingReview) return;

    if (comment.trim().length < 3) {
      toast.error("Comment must be at least 3 characters");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post(`/products/${id}/reviews`, {
        rating,
        comment: comment.trim(),
      });
      toast.success(res.data?.message || "Review submitted successfully");
      setComment("");
      setRating(5);
      setReviewVersion((v) => v + 1);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to submit review. Please try again.",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!myReview || updatingReview) return;

    if (editComment.trim().length < 3) {
      toast.error("Comment must be at least 3 characters");
      return;
    }

    setUpdatingReview(true);
    try {
      const res = await api.patch(`/reviews/${myReview._id}`, {
        rating: editRating,
        comment: editComment.trim(),
      });
      toast.success(res.data?.message || "Review updated successfully");
      setEditingReview(false);
      setReviewVersion((v) => v + 1);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update review. Please try again.",
      );
    } finally {
      setUpdatingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (deletingReview) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this review?",
    );
    if (!confirmed) return;

    setDeletingReview(true);
    try {
      const res = await api.delete(`/reviews/${reviewId}`);
      toast.success(res.data?.message || "Review deleted successfully");
      setEditingReview(false);
      setReviewVersion((v) => v + 1);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete review. Please try again.",
      );
    } finally {
      setDeletingReview(false);
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return (
      <div className="container">
        <ErrorState
          title="Product not available"
          message="We couldn't load this product. It may have been removed, or your connection dropped."
          onRetry={() => setRetryCount((count) => count + 1)}
        />
      </div>
    );
  }

  if (!product) {
    return <h2>Product not available</h2>;
  }

  const ratingAvg = Number(product.ratingAverage || 0);
  const ratingCnt = Number(product.ratingCount || 0);

  return (
    <div className="product-details-page-wrapper">
      <div className="container product-details-container">
        {/* Breadcrumb Navigation */}
        <nav className="details-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">{t("home")}</Link>
          <span className="breadcrumb-separator">/</span>
          {product.category && (
            <>
              <Link to={`/category/${product.category}`}>
                {t(product.category) || product.category.replace("-", " ")}
              </Link>
              <span className="breadcrumb-separator">/</span>
            </>
          )}
          <span className="breadcrumb-current">{product.title}</span>
        </nav>

        {/* Main Two-Column Showcase Grid */}
        <div className="product-showcase-grid">
          {/* LEFT: Product Image/Gallery Area */}
          <div className="product-media-column">
            <div className="product-main-media-card">
              {discount > 0 && !isOutOfStock && (
                <span className="details-badge badge-discount">-{discount}%</span>
              )}
              {isOutOfStock && (
                <span className="details-badge badge-out">{t("outOfStockBadge")}</span>
              )}
              <img
                src={selectedImage}
                alt={product.title}
                className="main-product-image"
              />
            </div>
          </div>

          {/* RIGHT: Product Info, Pricing & Intentional Separated Actions */}
          <div className="product-info-column">
            {product.brand && (
              <span className="product-details-brand">{product.brand}</span>
            )}

            <h1 className="product-details-title">{product.title}</h1>

            {/* Product rating summary with smooth scroll */}
            <div
              className="product-details-rating"
              onClick={() => {
                const section = document.getElementById("reviews-section");
                if (section) section.scrollIntoView({ behavior: "smooth" });
              }}
              title="View customer reviews"
              role="button"
              tabIndex={0}
            >
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) =>
                  star <= Math.round(ratingAvg) ? (
                    <FaStar key={star} color="#f5a623" />
                  ) : (
                    <FaRegStar key={star} color="#e0e0e0" />
                  ),
                )}
              </div>
              <span className="rating-score">
                {ratingAvg > 0 ? ratingAvg.toFixed(1) : "0.0"}
              </span>
              <span className="rating-count-label">
                ({ratingCnt} {ratingCnt === 1 ? t("reviewSingular") : t("reviewPlural")})
              </span>
            </div>

            {/* Pricing Area */}
            <div className="product-details-pricing">
              {discount > 0 ? (
                <>
                  <span className="discounted-price">
                    {formatPrice(discountedPrice)}
                  </span>
                  <span className="original-price">
                    {formatPrice(product.price)}
                  </span>
                  <span className="details-discount-pill">-{discount}% {t("offDiscount")}</span>
                </>
              ) : (
                <span className="regular-price">{formatPrice(product.price)}</span>
              )}
            </div>

            {/* Stock Status Indicator */}
            <div className="product-stock-line">
              <span className={`stock-status-pill ${isOutOfStock ? "out" : "in"}`}>
                <span className="stock-dot"></span>
                {isOutOfStock ? t("outOfStockStatus") : t("inStockCount", { count: product.stock })}
              </span>
            </div>

            {/* Description Block */}
            <div className="product-description-container">
              <h3 className="description-heading">{t("overview")}</h3>
              <p className="description-text">{product.description}</p>
            </div>

            {/* Distinct Separated Action Buttons */}
            <div className="product-actions-cluster">
              <button
                type="button"
                className="btn-action-primary"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                {t("addToCart")}
              </button>

              <button
                type="button"
                className="btn-action-secondary"
                onClick={() => {
                  handleAddToCart();
                  navigate("/checkout");
                }}
                disabled={isOutOfStock}
              >
                {t("buyNow")}
              </button>

              <button
                type="button"
                className={`btn-action-wishlist ${isInFav ? "in-fav" : ""}`}
                onClick={() => {
                  if (isInFav) {
                    removeFromFavorites(product.id);
                  } else {
                    addToFavorites(product);
                  }
                }}
                aria-label={isInFav ? "Remove from wishlist" : "Add to wishlist"}
                title={isInFav ? "Remove from wishlist" : "Add to wishlist"}
              >
                {isInFav ? <FaHeart /> : <FaRegHeart />}
                <span>{isInFav ? t("savedAction") : t("wishlistAction")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <div className="reviews-section" id="reviews-section">
        <div className="reviews-container">
          <div className="reviews-header">
            <h2>{t("customerReviews")}</h2>
            <div className="overall-rating">
              <span className="big-rating">
                {ratingAvg > 0 ? ratingAvg.toFixed(1) : "0.0"}
              </span>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) =>
                  star <= Math.round(ratingAvg) ? (
                    <FaStar key={star} color="#f5c518" />
                  ) : (
                    <FaRegStar key={star} color="#ccc" />
                  ),
                )}
              </div>
              <span className="rating-subtitle">
                {ratingCnt} {ratingCnt === 1 ? t("reviewSingular") : t("reviewPlural")}
              </span>
            </div>
          </div>

          {/* Review Form Area */}
          <div className="review-action-area">
            {!user ? (
              <div className="review-login-prompt">
                <p>
                  Have you tried this product?{" "}
                  <Link to="/login" state={{ from: `/products/${id}` }}>
                    Log in
                  </Link>{" "}
                  to write a review.
                </p>
              </div>
            ) : myReview ? (
              editingReview ? (
                <form onSubmit={handleUpdateReview} className="review-form">
                  <h3>{t("editReview")}</h3>
                  <div className="interactive-stars">
                    <label>{t("yourRating")}: </label>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="star-btn"
                        onClick={() => setEditRating(star)}
                        aria-label={`Rate ${star} stars`}
                      >
                        {star <= editRating ? (
                          <FaStar color="#f5c518" />
                        ) : (
                          <FaRegStar color="#ccc" />
                        )}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    placeholder={t("commentPlaceholder")}
                    rows={4}
                    required
                  />

                  <div className="review-form-actions">
                    <button
                      type="submit"
                      className="submit-review-btn"
                      disabled={updatingReview}
                    >
                      {updatingReview ? "..." : t("updateReview")}
                    </button>
                    <button
                      type="button"
                      className="cancel-review-btn"
                      onClick={() => setEditingReview(false)}
                      disabled={updatingReview}
                    >
                      {t("cancel")}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="my-review-card">
                  <div className="my-review-card-header">
                    <h4>Your Review</h4>
                    <div className="my-review-actions">
                      <button
                        type="button"
                        className="edit-action-btn"
                        onClick={() => {
                          setEditRating(myReview.rating);
                          setEditComment(myReview.comment);
                          setEditingReview(true);
                        }}
                      >
                        {t("editReviewBtn")}
                      </button>
                      <button
                        type="button"
                        className="delete-action-btn"
                        onClick={() => handleDeleteReview(myReview._id)}
                        disabled={deletingReview}
                      >
                        {deletingReview ? "..." : t("deleteReview")}
                      </button>
                    </div>
                  </div>

                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) =>
                      star <= myReview.rating ? (
                        <FaStar key={star} color="#f5c518" />
                      ) : (
                        <FaRegStar key={star} color="#ccc" />
                      ),
                    )}
                  </div>

                  {myReview.isVerifiedPurchase && (
                    <span className="verified-badge">✔ Verified Buyer</span>
                  )}

                  <p className="review-comment">{myReview.comment}</p>
                </div>
              )
            ) : (
              <form onSubmit={handleSubmitReview} className="review-form">
                <h3>{t("writeReview")}</h3>
                <div className="interactive-stars">
                  <label>{t("yourRating")}: </label>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="star-btn"
                      onClick={() => setRating(star)}
                      aria-label={`Rate ${star} stars`}
                    >
                      {star <= rating ? (
                        <FaStar color="#f5c518" />
                      ) : (
                        <FaRegStar color="#ccc" />
                      )}
                    </button>
                  ))}
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t("commentPlaceholder")}
                  rows={4}
                  required
                />

                <button
                  type="submit"
                  className="submit-review-btn"
                  disabled={submittingReview}
                >
                  {submittingReview ? "..." : t("submitReview")}
                </button>
              </form>
            )}
          </div>

          {/* Reviews List */}
          <div className="reviews-list">
            <h3>All Reviews ({reviews.length})</h3>
            {loadingReviews ? (
              <p>Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="no-reviews">
                {t("noReviewsYet")}
              </p>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="review-item">
                  <div className="review-item-header">
                    <div className="reviewer-info">
                      <span className="reviewer-name">
                        {rev.user?.name || "Customer"}
                      </span>
                      {rev.isVerifiedPurchase && (
                        <span className="verified-badge">
                          ✔ Verified Buyer
                        </span>
                      )}
                    </div>
                    <div className="review-right-meta">
                      <span className="review-date">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                      {user && (user._id === rev.user?._id || user.id === rev.user?._id || user.role === "admin") && (
                        <button
                          type="button"
                          className="delete-icon-btn"
                          onClick={() => handleDeleteReview(rev._id)}
                          disabled={deletingReview}
                          title="Delete review"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) =>
                      star <= rev.rating ? (
                        <FaStar key={star} color="#f5c518" />
                      ) : (
                        <FaRegStar key={star} color="#ccc" />
                      ),
                    )}
                  </div>

                  <p className="review-comment">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="related-products">
        <h2>{t("recommendedProducts")}</h2>

        <Swiper
          modules={[Pagination, Navigation, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          loop={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          spaceBetween={20}
          slidesPerView={4}
          allowTouchMove={true}
          breakpoints={{
            0: { slidesPerView: 1 },
            600: { slidesPerView: 2 },
            900: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
          }}
        >
          {relatedProducts.map((item) => (
            <SwiperSlide key={item.id}>
              <ProductCard item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default ProductDetails;
