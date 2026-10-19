import { useEffect, useState } from "react";
import HeroSlider from "../components/HeroSlider/HeroSlider";
import ProductSlider from "../components/ProductList/ProductSlider";
import ProductList from "../components/ProductList/ProductList";
import ProductSliderLoading from "../components/ProductList/ProductSliderLoading";
import { ErrorState } from "../components";
import api from "../services/api";
// التصنيفات التي نريد عرضها في الصفحة الرئيسية كسلايدرات
const categories = ["phones", "audio", "laptops"];
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
        const res = await api.get("/products");
        const productsData = {};

        categories.forEach((category) => {
          productsData[category] = res.data
            .filter((product) => product.category === category)
            .map((product) => ({
              ...product,
              id: product._id,
              title: product.name,
            }));
        });

        if (!isActive) return;
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
      <ProductList />

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
                  title={category.replace("-", " ")}
                />
              ),
          )}
    </div>
  );
}

export default Home;
