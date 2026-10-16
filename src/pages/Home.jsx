import { useEffect, useState } from "react";
import axios from "axios";
import HeroSlider from "../components/HeroSlider/HeroSlider";
import ProductSlider from "../components/ProductList/ProductSlider";
import ProductSliderLoading from "../components/ProductList/ProductSliderLoading";

// التصنيفات التي نريد عرضها في الصفحة الرئيسية كسلايدرات
const categories = [
  "smartphones",
  "mobile-accessories",
  "laptops",
  "mens-watches",
  "sunglasses",
];

function Home() {
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // جلب المنتجات لكل تصنيف في نفس الوقت
        const results = await Promise.all(
          categories.map(async (category) => {
            const res = await axios.get(
              `https://dummyjson.com/products/category/${category}`,
            );
            return { [category]: res.data.products };
          }),
        );

        // دمج البيانات في كائن واحد
        const productsData = Object.assign({}, ...results);
        setProducts(productsData);
      } catch (error) {
        console.error("Error Fetching Products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      {/* 1. البانر العلوي المتحرك */}
      <HeroSlider />

      {/* 2. عرض السلايدرات (شريط التمرير) لكل تصنيف */}
      {loading
        ? categories.map((category) => <ProductSliderLoading key={category} />)
        : categories.map(
            (category) =>
              products[category] &&
              products[category].length > 0 && (
                <ProductSlider
                  key={category}
                  data={products[category]}
                  title={category.replace("-", " ")} // يزيل الشرطة لتصبح "mobile accessories"
                />
              ),
          )}
    </div>
  );
}

export default Home;
