import ProductCard from "../ProductCard/ProductCard";
import "./ProductList.css"; // سنضع كل التنسيقات هنا
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Autoplay, Navigation } from "swiper/modules";

function ProductSlider({ data, title }) {
  return (
    <div className="slide_products slide">
      <div className="container">
        <div className="top_slide">
          <h2>{title}</h2>
          <p>Add bestselling products to weekly line up</p>
        </div>

        <Swiper
          loop={true}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          navigation={true}
          modules={[Navigation, Autoplay]}
          className="mySwiper"
          breakpoints={{
            // لجعل السلايدر متجاوب (Responsive)
            320: { slidesPerView: 1, spaceBetween: 10 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            768: { slidesPerView: 3, spaceBetween: 30 },
            1024: { slidesPerView: 5, spaceBetween: 20 },
          }}
        >
          {data?.map((item) => (
            <SwiperSlide key={item.id}>
              <ProductCard item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default ProductSlider;
