import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import "./CategoryPage.css";
// استيراد البطاقة بطريقتك النظيفة من الـ components
import { ProductCard, ErrorState } from "../components";
// استيراد تنسيق الشبكة (Grid) اللي سويناه مسبقاً
//import "../components/ProductList/ProductList.css";

function CategoryPage() {
  // هذا السطر يسحب اسم التصنيف من الرابط مباشرة (مثلاً: smartphones)
  const { categoryName } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [sortBy, setSortBy] = useState("default");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    let isActive = true;

    const fetchCategory = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get("/products");

        if (!isActive) return;

        const formattedProducts = res.data
          .filter((product) => product.category === categoryName)
          .map((product) => ({
            ...product,
            id: product._id,
            title: product.name,
          }));

        setProducts(formattedProducts);
      } catch (err) {
        if (!isActive) return;
        console.error("Error Fetching Category:", err);
        setError(err);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchCategory();

    return () => {
      isActive = false;
    };
  }, [categoryName, retryCount]); // أعد جلب البيانات كلما تغير اسم التصنيف في الرابط

  const filteredProducts = products.filter((product) => {
    const min = minPrice === "" ? 0 : Number(minPrice);
    const max = maxPrice === "" ? Infinity : Number(maxPrice);

    return product.price >= min && product.price <= max;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") {
      return a.price - b.price;
    }

    if (sortBy === "price-high") {
      return b.price - a.price;
    }

    if (sortBy === "rating") {
      return b.rating - a.rating;
    }

    return 0;
  });

  // شاشة الانتظار
  if (loading) {
    return (
      <div className="container">
        <h2 style={{ textAlign: "center", padding: "100px 0" }}>
          Loading {categoryName.replace("-", " ")} products...
        </h2>
      </div>
    );
  }

  // في حال فشل جلب البيانات نعرض رسالة واضحة مع إعادة المحاولة
  if (error) {
    return (
      <div className="container">
        <ErrorState
          title={`We couldn't load ${categoryName.replace("-", " ")}`}
          message="Please check your connection and try again."
          onRetry={() => setRetryCount((count) => count + 1)}
        />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="product-list-section">
        {/* عنوان القسم (مع إزالة الشرطة لو كانت موجودة وتكبير أول حرف) */}
        <h2 className="section-title" style={{ textTransform: "capitalize" }}>
          {categoryName.replace("-", " ")}
        </h2>

        <div className="category-filters">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="default">Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Rating: High to Low</option>
          </select>
          <div className="price-filter">
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />

            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>
        {sortedProducts.length === 0 ? (
          <div className="empty-products">
            <h2>No Products Found</h2>
            <p>Try changing your filters.</p>
          </div>
        ) : (
          <div className="products-grid">
            {sortedProducts.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryPage;
