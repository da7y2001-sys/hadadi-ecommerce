import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import "./CategoryPage.css";
import { ProductCard, ErrorState } from "../components";
import { getEffectivePrice, RiyalSymbol } from "../utils/formatPrice";
import { useLanguage } from "../context/LanguageContext";

function CategoryPage() {
  const { categoryName } = useParams();
  const { t } = useLanguage();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Existing Filter/Sort States - Preserving all existing functionality
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
  }, [categoryName, retryCount]);

  // Existing Price & EffectivePrice Filter logic
  const filteredProducts = products.filter((product) => {
    const min = minPrice === "" ? 0 : Number(minPrice);
    const max = maxPrice === "" ? Infinity : Number(maxPrice);

    const effectivePrice = getEffectivePrice(product);
    return effectivePrice >= min && effectivePrice <= max;
  });

  // Existing Sorting logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") {
      return getEffectivePrice(a) - getEffectivePrice(b);
    }

    if (sortBy === "price-high") {
      return getEffectivePrice(b) - getEffectivePrice(a);
    }

    return 0;
  });

  const categoryTitle = t(categoryName) || categoryName.replace("-", " ");

  if (loading) {
    return (
      <div className="container category-page-container">
        <div className="category-loading-state">
          <p>{t("categoryLoadingCatalog", { category: categoryTitle })}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container category-page-container">
        <ErrorState
          title={t("categoryFailedTitle", { category: categoryTitle })}
          message="Please check your connection and try again."
          onRetry={() => setRetryCount((count) => count + 1)}
        />
      </div>
    );
  }

  return (
    <div className="container category-page-container">
      {/* Breadcrumb Navigation */}
      <nav className="category-breadcrumbs" aria-label="Breadcrumbs">
        <Link to="/">{t("home")}</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{categoryTitle}</span>
      </nav>

      {/* Category Header */}
      <div className="category-header-bar">
        <div className="category-title-group">
          <h1 className="category-heading">{categoryTitle}</h1>
          <span className="category-count">{t("productsCountLabel", { count: sortedProducts.length })}</span>
        </div>

        {/* Existing Sort Dropdown */}
        <div className="category-sort-group">
          <label htmlFor="category-sort" className="sort-label">{t("sortByLabel")}</label>
          <select
            id="category-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="minimal-select"
          >
            <option value="default">{t("sortFeatured")}</option>
            <option value="price-low">{t("sortPriceLow")}</option>
            <option value="price-high">{t("sortPriceHigh")}</option>
          </select>
        </div>
      </div>

      {/* Main 2-Column Listing Layout: Sidebar Facets + Grid */}
      <div className="category-layout">
        <aside className="category-sidebar">
          <div className="filter-group">
            <h3 className="filter-group-title">{t("filterByPriceTitle")}</h3>
            <div className="price-filter-inputs">
              <div className="price-input-wrapper">
                <span className="currency-prefix"><RiyalSymbol /></span>
                <input
                  type="number"
                  placeholder={t("minPricePlaceholder")}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  aria-label="Minimum price"
                />
              </div>
              <span className="price-dash">—</span>
              <div className="price-input-wrapper">
                <span className="currency-prefix"><RiyalSymbol /></span>
                <input
                  type="number"
                  placeholder={t("maxPricePlaceholder")}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  aria-label="Maximum price"
                />
              </div>
            </div>

            {(minPrice !== "" || maxPrice !== "") && (
              <button
                type="button"
                className="clear-filter-btn"
                onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                }}
              >
                {t("clearPriceFilterBtn")}
              </button>
            )}
          </div>
        </aside>

        {/* Products Grid */}
        <main className="category-products-area">
          {sortedProducts.length === 0 ? (
            <div className="empty-products-state">
              <h3>{t("noFilterMatchesTitle")}</h3>
              <p>{t("noFilterMatchesDesc")}</p>
              <button
                type="button"
                className="reset-filters-btn"
                onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                  setSortBy("default");
                }}
              >
                {t("resetAllFiltersBtn")}
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {sortedProducts.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CategoryPage;
