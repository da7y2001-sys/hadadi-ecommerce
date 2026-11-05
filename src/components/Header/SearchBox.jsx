import { useEffect, useState, useRef } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import ProductImage from "../common/ProductImage";

function SearchBox({ isAccountOpen = false, onSearchOpen }) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchContainerRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Reset suggestions during render if route changes (React recommended pattern)
  const [prevLocationKey, setPrevLocationKey] = useState(location.key);
  if (location.key !== prevLocationKey) {
    setPrevLocationKey(location.key);
    setSuggestions([]);
    setIsOpen(false);
  }

  // Close search suggestions during render when account menu opens
  const [prevAccountOpen, setPrevAccountOpen] = useState(isAccountOpen);
  if (isAccountOpen !== prevAccountOpen) {
    setPrevAccountOpen(isAccountOpen);
    if (isAccountOpen) {
      setIsOpen(false);
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    }
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleSelectSuggestion = () => {
    setSuggestions([]);
    setIsOpen(false);
    setSearchTerm("");
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim()) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      try {
        const res = await api.get(
          `/products/suggest?q=${encodeURIComponent(searchTerm.trim())}`
        );

        const formattedProducts = res.data.map((product) => ({
          ...product,
          id: product._id,
          title: product.name,
        }));

        setSuggestions(formattedProducts);
        if (formattedProducts.length > 0 && !isAccountOpen) {
          onSearchOpen?.();
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      } catch (error) {
        console.error("Search Error :", error);
        setSuggestions([]);
        setIsOpen(false);
      }
    };

    // Debounce to optimize API requests
    const debounce = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm, isAccountOpen, onSearchOpen]);

  return (
    <div
      ref={searchContainerRef}
      className="searchBox_Container"
      style={{ position: "relative" }}
    >
      <form onSubmit={handleSubmit} className="top-search">
        <input
          type="text"
          name="search"
          id="search"
          placeholder={t("searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onSearchOpen?.();
          }}
          onFocus={() => {
            onSearchOpen?.();
            if (suggestions.length > 0 && !isAccountOpen) setIsOpen(true);
          }}
          autoComplete="off"
        />
        {searchTerm && (
          <button
            type="button"
            className="clear-search"
            aria-label={t("clearSearch")}
            onClick={() => {
              setSearchTerm("");
              setSuggestions([]);
              setIsOpen(false);
            }}
          >
            <FaTimes />
          </button>
        )}
        <button type="submit" aria-label={t("searchPlaceholder")}>
          <FaSearch />
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((item) => (
            <Link
              key={item.id}
              to={`/products/${item.id}`}
              style={{ textDecoration: "none" }}
              onClick={handleSelectSuggestion}
            >
              <li>
                <ProductImage src={item.image} alt={item.title} />
                <span>{item.title}</span>
              </li>
            </Link>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBox;
