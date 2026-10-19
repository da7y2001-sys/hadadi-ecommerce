import { useState, useEffect } from "react";
import ProductCard from "../ProductCard/ProductCard"; // استدعاء البطاقة التي صنعناها
import api from "../../services/api";
import "./ProductList.css";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب 12 منتج من الـ API للعرض في الصفحة الرئيسية
    console.log("ProductList started");
    api
      .get("/products")
      .then((res) => {
        //console.log(res.data);

        const formattedProducts = res.data.map((item) => ({
          ...item,
          id: item._id,
          title: item.name,
        }));
        console.log("Formatted Products:", formattedProducts);

        setProducts(formattedProducts);
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
            <ProductCard key={item._id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductList;
