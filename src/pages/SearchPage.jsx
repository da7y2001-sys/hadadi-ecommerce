import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ProductCard } from "../components";
import "./SearchPage.css";
function SearchPage() {
  const [searchParams] = useSearchParams();

  const query = searchParams.get("query");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const searchProducts = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `https://dummyjson.com/products/search?q=${query}`,
        );
        setProducts(res.data.products);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [query]);
  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return <h2>Error: {error.message}</h2>;
  }

  if (products.length === 0) {
    return (
      <div className="product_title">
        <h1>No Products Found</h1>
        <p>No products found for: {query}</p>
      </div>
    );
  }
  return (
    <>
      <div className="product_title">
        <h1>Search Results</h1>
        <p>Search for: {query}</p>
      </div>
      <div className="search-products">
        {products.map((product) => (
          <ProductCard key={product.id} item={product} />
        ))}
      </div>
    </>
  );
}

export default SearchPage;
