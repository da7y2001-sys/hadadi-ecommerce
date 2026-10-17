import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./CategoryPage.css";
// استيراد البطاقة بطريقتك النظيفة من الـ components
import { ProductCard } from "../components";
// استيراد تنسيق الشبكة (Grid) اللي سويناه مسبقاً
//import "../components/ProductList/ProductList.css";

function CategoryPage() {
  // هذا السطر يسحب اسم التصنيف من الرابط مباشرة (مثلاً: smartphones)
  const { categoryName } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  useEffect(() => {
    // جلب المنتجات بناءً على التصنيف الموجود في الرابط
    axios
      .get(`https://dummyjson.com/products/category/${categoryName}`)
      .then((res) => {
        setProducts(res.data.products);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error Fetching Category:", err);
        setLoading(false);
      });
  }, [categoryName]); // أعد جلب البيانات كلما تغير اسم التصنيف في الرابط
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
