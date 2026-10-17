import { Link } from "react-router-dom";
import { IoIosMenu } from "react-icons/io";
import { useState } from "react";

const navLinks = [
  { title: "Home", path: "/" },
  { title: "Blog", path: "/blog" },
  { title: "Accessories", path: "/accessories" },
  { title: "About", path: "/about" },
  { title: "Contact", path: "/contact" },
];

function BitmHeader({ categories, categoriesLoading, categoriesError }) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  return (
    <div className="btm-header">
      <div className="container">
        <nav className="nav">
          <div className="nav-category">
            <div
              className="category-btn"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            >
              <IoIosMenu />
              <span>All Categories</span>
            </div>

            <div
              className={`category-nav-list ${isCategoryOpen ? "active" : ""}`}
            >
              {categoriesLoading ? (
                <span>Loading categories...</span>
              ) : categoriesError ? (
                <span>Couldn't load categories</span>
              ) : (
                categories.map((category) => (
                  <Link
                    key={category.slug}
                    to={`/category/${category.slug}`}
                    onClick={() => setIsCategoryOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="nav-links">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                {link.title}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

export default BitmHeader;
