import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { ProductCard, ErrorState } from "../components";
import { useLanguage } from "../context/LanguageContext";
import "./BestSellingPage.css";

function BestSellingPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    const fetchBestSelling = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get("/products/best-selling");

        if (!isActive) return;

        const formattedProducts = res.data.map((item) => ({
          ...item,
          id: item._id,
          title: item.name,
        }));

        setProducts(formattedProducts);
      } catch (err) {
        if (!isActive) return;
        console.error("Error Fetching Best Selling Products:", err);
        setError(err);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchBestSelling();

    return () => {
      isActive = false;
    };
  }, [retryCount]);

  if (loading) {
    return (
      <div className="container bestselling-page-container">
        <div className="bestselling-loading-state">
          <p>{t("loadingBestsellers")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container bestselling-page-container">
        <ErrorState
          title={t("bestSellingErrorTitle")}
          message={t("bestSellingErrorMessage")}
          onRetry={() => setRetryCount((count) => count + 1)}
        />
      </div>
    );
  }

  return (
    <div className="container bestselling-page-container">
      {/* Breadcrumb Navigation */}
      <nav className="bestselling-breadcrumbs" aria-label="Breadcrumbs">
        <Link to="/">{t("home")}</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{t("bestSellingBreadcrumb")}</span>
      </nav>

      {/* Header Bar */}
      <div className="bestselling-header-bar">
        <div className="bestselling-title-group">
          <h1 className="bestselling-heading">{t("bestSellingTitle")}</h1>
          <span className="bestselling-subline">{t("bestSellingSubtitle")}</span>
        </div>
        <span className="bestselling-count">
          {t("productsCountLabel", { count: products.length })}
        </span>
      </div>

      {/* Main Grid or Empty State */}
      {products.length === 0 ? (
        <div className="empty-bestselling-state">
          <h3>{t("noBestSellingTitle")}</h3>
          <p>{t("noBestSellingDesc")}</p>
          <Link to="/" className="bestselling-home-btn">
            {t("continueShopping")}
          </Link>
        </div>
      ) : (
        <div className="bestselling-products-grid">
          {products.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default BestSellingPage;

