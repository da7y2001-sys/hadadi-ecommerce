import { Link } from "react-router-dom";
import { IoIosMenu, IoIosClose, IoIosArrowForward } from "react-icons/io";
import {
  IoPhonePortraitOutline,
  IoLaptopOutline,
  IoHeadsetOutline,
  IoWatchOutline,
  IoTvOutline,
  IoGameControllerOutline,
  IoHardwareChipOutline,
  IoAppsOutline,
} from "react-icons/io5";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";

const categoryIcons = {
  phones: <IoPhonePortraitOutline />,
  laptops: <IoLaptopOutline />,
  audio: <IoHeadsetOutline />,
  watches: <IoWatchOutline />,
  monitors: <IoTvOutline />,
  gaming: <IoGameControllerOutline />,
  accessories: <IoHardwareChipOutline />,
};

function BitmHeader({ categories, categoriesLoading, categoriesError }) {
  const { t } = useLanguage();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navLinks = [
    { title: t("home"), path: "/" },
    { title: t("about"), path: "/about" },
    { title: t("contact"), path: "/contact" },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    }

    if (isCategoryOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCategoryOpen]);

  return (
    <>
      {/* Blurred Backdrop Overlay */}
      {isCategoryOpen && (
        <div
          className="category-backdrop-overlay"
          onClick={() => setIsCategoryOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="btm-header">
        <div className="container btm-header-container">
          <nav className="nav">
            <div className="nav-category" ref={dropdownRef}>
              <button
                type="button"
                className={`category-btn ${isCategoryOpen ? "btn-active" : ""}`}
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                aria-expanded={isCategoryOpen}
              >
                {isCategoryOpen ? <IoIosClose size={22} /> : <IoIosMenu size={20} />}
                <span>{t("shopByCategory")}</span>
              </button>

              {/* Jarir-style Side Category Dropdown */}
              <div
                className={`category-dropdown-panel ${isCategoryOpen ? "active" : ""}`}
              >
                <div className="category-panel-header">
                  <span>{t("exploreDepartments")}</span>
                  <button
                    type="button"
                    className="panel-close-btn"
                    onClick={() => setIsCategoryOpen(false)}
                    aria-label="Close categories"
                  >
                    <IoIosClose size={24} />
                  </button>
                </div>

                <div className="category-panel-scroll">
                  {categoriesLoading ? (
                    <span className="category-status">{t("loadingCategories")}</span>
                  ) : categoriesError ? (
                    <span className="category-status">{t("failedLoadingCategories")}</span>
                  ) : (
                    categories.map((category) => {
                      const icon = categoryIcons[category] || <IoAppsOutline />;
                      const label = t(category) || category.replace("-", " ");

                      return (
                        <Link
                          key={category}
                          to={`/category/${category}`}
                          className="category-panel-item"
                          onClick={() => setIsCategoryOpen(false)}
                        >
                          <div className="panel-item-left">
                            <span className="panel-item-icon">{icon}</span>
                            <span className="panel-item-label">{label}</span>
                          </div>
                          <IoIosArrowForward className="panel-item-arrow" />
                        </Link>
                      );
                    })
                  )}
                </div>
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
    </>
  );
}

export default BitmHeader;
