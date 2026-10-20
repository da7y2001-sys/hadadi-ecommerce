import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import api from "./services/api";
import { Header, ErrorBoundary, Footer } from "./components";
import ProductDetails from "./pages/ProductDetails";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import SearchPage from "./pages/SearchPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import AdminPage from "./pages/AdminPage";
import AdminRoute from "./components/AdminRoute/AdminRoute";
import "./App.css";

function App() {
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getCategories() {
      try {
        const res = await api.get("/products");

        const uniqueCategories = [
          ...new Set(res.data.map((product) => product.category)),
        ];

        setCategories(uniqueCategories);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    getCategories();
  }, []);

  return (
    <div className="app-container">
      <Header
        categories={categories}
        categoriesLoading={loading}
        categoriesError={error}
      />

      <ErrorBoundary key={location.pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
        </Routes>
      </ErrorBoundary>
      <Footer />
    </div>
  );
}

export default App;
