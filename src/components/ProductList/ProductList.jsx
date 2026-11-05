import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../ProductCard/ProductCard";
import api from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import "./ProductList.css";

function ProductList() {
  const { t, isRTL } = useLanguage();
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

          <Link to="/best-selling" className="view-all-link">
            {t("viewAll")} {isRTL ? "←" : "→"}
          </Link>
        </div>

        <Swiper
          key={isRTL ? "rtl" : "ltr"}
          dir={isRTL ? "rtl" : "ltr"}
          loop={false}
          navigation={true}
          modules={[Navigation]}
          className="category-product-swiper"
          slidesPerView={1.15}
          spaceBetween={14}
          breakpoints={{
            600: { slidesPerView: 2, spaceBetween: 18 },
            900: { slidesPerView: 3, spaceBetween: 22 },
            1150: { slidesPerView: 4, spaceBetween: 24 },
          }}
        >
          {products.slice(0, 4).map((item) => (
            <SwiperSlide key={item.id}>
              <ProductCard item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

export default ProductList;
