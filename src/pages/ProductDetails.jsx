import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { FaHeart } from "react-icons/fa";
import "./ProductDetails.css";
import { CartContext } from "../context/CartContext";
import { FaStar, FaRegStar, FaRegStarHalfStroke } from "react-icons/fa6";
function ProductDetails() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const { addToCart, addToFavorites, favorites, removeFromFavorites } =
    useContext(CartContext);
  const isInFav = favorites.some((item) => item.id === product?.id);
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`https://dummyjson.com/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return <h2>Error: {error.message}</h2>;
  }
  return (
    <div className="product-details">
      <div className="product-details-image">
        <img src={product.thumbnail} alt={product.title} />
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
        <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
          Add to Cart
        </button>
        <button
          className="favorite-btn"
          onClick={() => {
            if (isInFav) {
              removeFromFavorites(product.id);
            } else {
              addToFavorites(product);
            }
          }}
        >
          <FaHeart />
          {isInFav ? "Remove from Wishlist" : "Add to Wishlist"}
        </button>
      </div>
    </div>
  );
}

export default ProductDetails;
