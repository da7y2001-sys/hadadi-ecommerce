import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ProductCard } from "../components";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";

import { FaHeart, FaRegHeart } from "react-icons/fa";
import "./ProductDetails.css";
import { CartContext } from "../context/CartContext";
import { FaStar, FaRegStar, FaRegStarHalfStroke } from "react-icons/fa6";
function ProductDetails() {
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, addToFavorites, favorites, removeFromFavorites } =
    useContext(CartContext);
  const isInFav = favorites.some((item) => item.id === product?.id);
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`https://dummyjson.com/products/${id}`);
        setProduct(res.data);
        setSelectedImage(res.data.thumbnail);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return;

      try {
        const res = await axios.get(
          `https://dummyjson.com/products/category/${product.category}`,
        );

        const filteredProducts = res.data.products.filter(
          (item) => item.id !== product.id,
        );

        setRelatedProducts(filteredProducts);
      } catch (err) {
        console.log(err);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return <h2>Error: {error.message}</h2>;
  }
  return (
    <>
      <div className="product-details">
        <div className="product-details-image">
          <img
            src={selectedImage}
            alt={product.title}
            className="main-product-image"
          />

          <div className="product-thumbnails">
            {product.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.title} ${index + 1}`}
                onClick={() => setSelectedImage(image)}
              />
            ))}
          </div>
        </div>

        <div className="product-details-info">
          <h1>{product.title}</h1>

          <p className="product-price">{product.price} $</p>

          <p>{product.description}</p>

          <div className="product-rating">
            <div className="stars">
              {[0, 1, 2, 3, 4].map((star) => {
                if (product.rating >= star + 1) {
                  return <FaStar key={star} />;
                }

                if (product.rating >= star + 0.5) {
                  return <FaRegStarHalfStroke key={star} />;
                }

                return <FaRegStar key={star} />;
              })}
            </div>

            <span>{product.rating}</span>
          </div>
          <button
            className="add-to-cart-btn"
            onClick={() => addToCart(product)}
          >
            Add to Cart
          </button>
          <button
            className="go-to-cart-btn"
            onClick={() => {
              addToCart(product);
              navigate("/checkout");
            }}
          >
            Buy Now
          </button>
          <button
            className={`favorite-btn ${isInFav ? "in-fav" : ""}`}
            onClick={() => {
              if (isInFav) {
                removeFromFavorites(product.id);
              } else {
                addToFavorites(product);
              }
            }}
          >
            {isInFav ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>
      </div>
      <div className="related-products">
        <h2>Recommended Products</h2>

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
    </>
  );
}

export default ProductDetails;
