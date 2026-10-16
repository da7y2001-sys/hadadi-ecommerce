import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../ProductCard/ProductCard"; // استدعاء البطاقة التي صنعناها
import "./ProductList.css";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب 12 منتج من الـ API للعرض في الصفحة الرئيسية
    axios
      .get("https://dummyjson.com/products?limit=12")
      .then((res) => {
        setProducts(res.data.products);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error Fetching Products:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "50px" }}>
        جاري تحميل المنتجات...
      </h2>
    );
  }

  return (
    <div className="container">
      <div className="product-list-section">
        <h2 className="section-title">Latest Products</h2>

        {/* شبكة المنتجات */}
        <div className="products-grid">
          {products.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductList;
