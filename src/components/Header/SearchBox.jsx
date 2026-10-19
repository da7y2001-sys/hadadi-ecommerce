import { useEffect, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function SearchBox() {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    }
    setSuggestions([]);
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await api.get("/products");

        const search = searchTerm.toLowerCase().trim();

        const filteredProducts = res.data
          .filter((product) => {
            return (
              product.name.toLowerCase().includes(search) ||
              product.brand.toLowerCase().includes(search) ||
              product.category.toLowerCase().includes(search)
            );
          })
          .slice(0, 5)
          .map((product) => ({
            ...product,
            id: product._id,
            title: product.name,
          }));

        setSuggestions(filteredProducts);
      } catch (error) {
        console.error("Search Error :", error);
        setSuggestions([]);
      }
    };

    // تقنية Debounce لتقليل الطلبات
    const debounce = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  return (
    <div className="searchBox_Container" style={{ position: "relative" }}>
      <form onSubmit={handleSubmit} className="top-search">
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search For Products"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
        />
        {searchTerm && (
          <button
            type="button"
            className="clear-search"
            aria-label="Clear search"
            onClick={() => setSearchTerm("")}
          >
            <FaTimes />
          </button>
        )}
        <button type="submit">
          <FaSearch />
        </button>
      </form>

      {/* قائمة الاقتراحات المنسدلة */}
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((item) => (
            <Link
              key={item.id}
              to={`/products/${item.id}`}
              style={{ textDecoration: "none" }}
            >
              <li>
                <img src={item.image} alt={item.title} />
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
