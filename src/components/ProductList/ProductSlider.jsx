import { Link } from "react-router-dom";
import ProductCard from "../ProductCard/ProductCard";
import "./ProductList.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Autoplay, Navigation } from "swiper/modules";
import { useLanguage } from "../../context/LanguageContext";

function ProductSlider({ data, title }) {
  const { t } = useLanguage();
  const categoryKey = title.toLowerCase().replace(" ", "-");
  const translatedTitle = t(categoryKey) || title;

  return (
    <section className="product-slider-section">
      <div className="container">
        <div className="slider-header-bar">
          <div className="slider-title-group">
            <h2 className="slider-heading">{translatedTitle}</h2>
            <span className="slider-subline">{t("exploreCuratedCollection")}</span>
          </div>

          <Link to={`/category/${categoryKey}`} className="view-all-link">
            {t("viewAll")} ({data?.length || 0}) →
          </Link>
        </div>

        <Swiper
          loop={false}
          navigation={true}
          modules={[Navigation, Autoplay]}
          className="category-product-swiper"
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 14 },
            600: { slidesPerView: 2, spaceBetween: 18 },
            900: { slidesPerView: 3, spaceBetween: 22 },
            1150: { slidesPerView: 4, spaceBetween: 24 },
          }}
        >
          {data?.map((item) => (
            <SwiperSlide key={item.id}>
              <ProductCard item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

export default ProductSlider;
