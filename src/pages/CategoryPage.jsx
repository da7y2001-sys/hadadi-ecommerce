import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
// استيراد البطاقة بطريقتك النظيفة من الـ components
import { ProductCard } from "../components";
// استيراد تنسيق الشبكة (Grid) اللي سويناه مسبقاً
import "../components/ProductList/ProductList.css";

function CategoryPage() {
  // هذا السطر يسحب اسم التصنيف من الرابط مباشرة (مثلاً: smartphones)
  const { categoryName } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // إظهار التحميل عند تغيير التصنيف
    setLoading(true);

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

        {/* شبكة المنتجات */}
        <div className="products-grid">
          {products.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryPage;
