import { useEffect, useState } from "react";
import HeroSlider from "../components/HeroSlider/HeroSlider";
import ProductSlider from "../components/ProductList/ProductSlider";
import ProductList from "../components/ProductList/ProductList";
import ProductSliderLoading from "../components/ProductList/ProductSliderLoading";
import CategoryCatalog from "../components/CategoryCatalog/CategoryCatalog";
import { ErrorState } from "../components";
import api from "../services/api";
import { useLanguage } from "../context/LanguageContext";

// 7 Unified tech categories
const categories = [
  "phones",
  "audio",
  "laptops",
  "watches",
  "monitors",
  "gaming",
  "accessories",
];

function Home() {
  const { t } = useLanguage();
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
      <div className="container" style={{ padding: "60px 0" }}>
        <ErrorState
          title={t("homeLoadErrorTitle")}
          message={t("homeLoadErrorMessage")}
          onRetry={() => setRetryCount((count) => count + 1)}
        />
      </div>
    );
  }

  return (
    <div className="home-page-layout">
      {/* 1. Horizontal Category Catalog Strip (Above HeroSlider) */}
      <CategoryCatalog categories={categories} />

      {/* 2. Balanced Hero Banner */}
      <HeroSlider />

      {/* 3. Curated Bestsellers Section */}
      <ProductList />

      {/* 4. Category Sections with Consistent Spacing */}
      <div className="home-categories-container">
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
    </div>
  );
}

export default Home;
