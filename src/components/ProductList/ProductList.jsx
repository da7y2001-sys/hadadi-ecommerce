import { useState, useEffect } from "react";
import ProductCard from "../ProductCard/ProductCard";
import api from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import "./ProductList.css";

function ProductList() {
  const { t } = useLanguage();
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
      <div className="container" style={{ padding: "40px 0" }}>
        <p style={{ textAlign: "center", color: "#888", fontSize: "14px" }}>
          {t("loadingBestsellers")}
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="bestsellers-section">
      <div className="container">
        <div className="slider-header-bar">
          <div className="slider-title-group">
            <h2 className="slider-heading">{t("curatedBestsellers")}</h2>
            <span className="slider-subline">{t("topPerformingTech")}</span>
          </div>
        </div>

        <div className="bestsellers-grid">
          {products.slice(0, 4).map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProductList;
