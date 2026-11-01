import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { useLanguage } from "../../context/LanguageContext";
import "./HeroSlider.css";

export default function HeroSlider() {
  const { t } = useLanguage();

  return (
    <div className="hero-slider-section">
      <div className="container">
        <Swiper
          spaceBetween={0}
          centeredSlides={true}
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="hero-swiper"
        >
          {/* Phones */}
          <SwiperSlide>
            <div className="hero-slide-grid">
              {/* Product Image Left */}
              <div className="hero-slide-image">
                <img src="/products/samsung-s26black.jpg" alt="Galaxy S26 Ultra" />
              </div>

              {/* Text & CTA Right */}
              <div className="hero-slide-content">
                <span className="hero-eyebrow">{t("heroSlide1Eyebrow")}</span>
                <h2 className="hero-headline">{t("heroSlide1Title")}</h2>
                <p className="hero-description">
                  {t("heroSlide1Desc")}
                </p>
                <Link className="hero-cta-btn" to="/category/phones">
                  {t("heroSlide1Cta")}
                </Link>
              </div>
            </div>
          </SwiperSlide>

          {/* Laptops */}
          <SwiperSlide>
            <div className="hero-slide-grid">
              {/* Product Image Left */}
              <div className="hero-slide-image">
                <img src="/products/macbook-pro-16.jpg" alt="MacBook Pro 16" />
              </div>

              {/* Text & CTA Right */}
              <div className="hero-slide-content">
                <span className="hero-eyebrow">{t("heroSlide2Eyebrow")}</span>
                <h2 className="hero-headline">{t("heroSlide2Title")}</h2>
                <p className="hero-description">
                  {t("heroSlide2Desc")}
                </p>
                <Link className="hero-cta-btn" to="/category/laptops">
                  {t("heroSlide2Cta")}
                </Link>
              </div>
            </div>
          </SwiperSlide>

          {/* Audio */}
          <SwiperSlide>
            <div className="hero-slide-grid">
              {/* Product Image Left */}
              <div className="hero-slide-image">
                <img src="/products/sony-wh1000xm6_.jpg" alt="Sony WH-1000XM6" />
              </div>

              {/* Text & CTA Right */}
              <div className="hero-slide-content">
                <span className="hero-eyebrow">{t("heroSlide3Eyebrow")}</span>
                <h2 className="hero-headline">{t("heroSlide3Title")}</h2>
                <p className="hero-description">
                  {t("heroSlide3Desc")}
                </p>
                <Link className="hero-cta-btn" to="/category/audio">
                  {t("heroSlide3Cta")}
                </Link>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
}
