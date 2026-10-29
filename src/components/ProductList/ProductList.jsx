import { useState, useEffect } from "react";
import ProductCard from "../ProductCard/ProductCard";
import api from "../../services/api";
import "./ProductList.css";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellingProducts = async () => {
      try {
        const res = await api.get("/products/best-selling");

        const formattedProducts = res.data.map((item) => ({
          ...item,
          id: item._id,
          title: item.name,
        }));

        setProducts(formattedProducts);
      } catch (error) {
        console.error("Error fetching best selling products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellingProducts();
  }, []);

  if (loading) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "50px" }}>
        جاري تحميل الأكثر مبيعًا...
      </h2>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="container">
      <div className="product-list-section">
        <h2 className="section-title">🔥 Best Selling Products</h2>

        <div className="products-grid">
          {products.map((item) => (
            <ProductCard key={item._id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductList;
