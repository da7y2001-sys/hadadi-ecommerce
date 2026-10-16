import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";
import { Header } from "./components";
import ProductDetails from "./pages/ProductDetails";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import SearchPage from "./pages/SearchPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import "./App.css";

function App() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getCategories() {
      try {
        const res = await axios.get(
          "https://dummyjson.com/products/categories",
        );

        setCategories(res.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    getCategories();
  }, []);

  if (loading) {
    return <h2>جاري تحميل المتجر...</h2>;
  }

  if (error) {
    return <h2>حدث خطأ أثناء تحميل التصنيفات ❌</h2>;
  }

  return (
    <div className="app-container">
      <Header categories={categories} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Routes>
    </div>
  );
}

export default App;
