import { useRef } from "react";
import { Link } from "react-router-dom";
// استيراد Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

// استيراد التنسيقات
import "./HeroSlider.css";

export default function HeroSlider() {
  const progressCircle = useRef(null);
  const progressContent = useRef(null);

  const onAutoplayTimeLeft = (s, time, progress) => {
    progressCircle.current.style.setProperty("--progress", 1 - progress);
    progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
  };

  return (
    <div className="hero-container container">
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 4000, // خليتها 4 ثواني ليلحق المستخدم يقرأ
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        onAutoplayTimeLeft={onAutoplayTimeLeft}
        className="mySwiper hero-swiper"
      >
        {/* الشريحة الأولى */}
        <SwiperSlide>
          <div className="slide-content">
            <h2>Latest Tech Devices</h2>
            <p>Discover the new generation of smartphones</p>
            <Link className="shop-now-btn" to="/category/phones">
              Shop Now
            </Link>
          </div>
          <img
            src="https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=1200&q=80"
            alt="Iphone"
          />
        </SwiperSlide>

        {/* الشريحة الثانية */}
        <SwiperSlide>
          <div className="slide-content">
            <h2>Powerful Laptops</h2>
            <p>For work, gaming, and everything in between</p>
            <Link className="shop-now-btn" to="/category/laptops">
              Shop Now
            </Link>
          </div>
          <img
            src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80"
            alt="Laptop"
          />
        </SwiperSlide>

        {/* الشريحة الثالثة */}
        <SwiperSlide>
          <div className="slide-content">
            <h2>Premium Audio</h2>
            <p>Experience sound like never before</p>
            <Link className="shop-now-btn" to="/category/audio">
              Shop Now
            </Link>
          </div>
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80"
            alt="Headphones"
          />
        </SwiperSlide>

        {/* العداد الدائري */}
        <div className="autoplay-progress" slot="container-end">
          <svg viewBox="0 0 48 48" ref={progressCircle}>
            <circle cx="24" cy="24" r="20"></circle>
          </svg>
          <span ref={progressContent}></span>
        </div>
      </Swiper>
    </div>
  );
}
