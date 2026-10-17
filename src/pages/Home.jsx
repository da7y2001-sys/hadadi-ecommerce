import { useEffect, useState } from "react";
import axios from "axios";
import HeroSlider from "../components/HeroSlider/HeroSlider";
import ProductSlider from "../components/ProductList/ProductSlider";
import ProductSliderLoading from "../components/ProductList/ProductSliderLoading";
import { ErrorState } from "../components";

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
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

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

        if (!isActive) return;

        // دمج البيانات في كائن واحد
        const productsData = Object.assign({}, ...results);
        setProducts(productsData);
      } catch (err) {
        if (!isActive) return;
        console.error("Error Fetching Products:", err);
        setError(err);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isActive = false;
    };
  }, [retryCount]);

  if (error) {
    return (
      <div className="container">
        <ErrorState
          title="We couldn't load the home page"
          message="Please check your connection and try again."
          onRetry={() => setRetryCount((count) => count + 1)}
        />
      </div>
    );
  }

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
