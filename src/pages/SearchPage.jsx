import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { ProductCard, ErrorState } from "../components";
import { useLanguage } from "../context/LanguageContext";
import "./SearchPage.css";

function SearchPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

  const query = searchParams.get("query") || "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const searchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(
          `/products/search?q=${encodeURIComponent(query)}`,
        );

        const formattedProducts = res.data.map((product) => ({
          ...product,
          id: product._id,
          title: product.name,
        }));

        setProducts(formattedProducts);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [query, retryCount]);

  if (loading) {
    return (
      <div className="container search-page-container">
        <div className="search-loading-state">
          <p>{t("searchingCatalog", { query })}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container search-page-container">
        <ErrorState
          title={t("searchFailedTitle")}
          message={t("searchFailedDesc")}
          onRetry={() => setRetryCount((count) => count + 1)}
        />
      </div>
    );
  }

  return (
    <div className="container search-page-container">
      {/* Breadcrumb */}
      <nav className="search-breadcrumbs" aria-label="Breadcrumbs">
        <Link to="/">{t("home")}</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{t("searchBreadcrumb")}</span>
      </nav>

      {/* Header */}
      <div className="search-header-bar">
        <div className="search-title-group">
          <h1 className="search-heading">{t("searchResultsHeading", { query })}</h1>
          <span className="search-count">{t("productsFoundCount", { count: products.length })}</span>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="empty-search-state">
          <h3>{t("noProductsFoundTitle")}</h3>
          <p>{t("noProductsFoundDesc", { query })}</p>
          <div className="empty-search-actions">
            <Link to="/category/phones" className="explore-categories-btn">
              {t("exploreCategoriesBtn")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="search-products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} item={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchPage;
