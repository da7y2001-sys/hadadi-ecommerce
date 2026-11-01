import { Link } from "react-router-dom";
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
import { useLanguage } from "../../context/LanguageContext";
import "./CategoryCatalog.css";

// Icons mapping for the 7 unified tech categories
const categoryIcons = {
  phones: <IoPhonePortraitOutline />,
  laptops: <IoLaptopOutline />,
  audio: <IoHeadsetOutline />,
  watches: <IoWatchOutline />,
  monitors: <IoTvOutline />,
  gaming: <IoGameControllerOutline />,
  accessories: <IoHardwareChipOutline />,
};

function CategoryCatalog({ categories = [] }) {
  const { t } = useLanguage();

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="category-catalog-strip">
      <div className="container">
        <div className="category-catalog-grid">
          {categories.map((category) => {
            const icon = categoryIcons[category] || <IoAppsOutline />;
            const label = t(category) || category.replace("-", " ");

            return (
              <Link
                key={category}
                to={`/category/${category}`}
                className="catalog-card-item"
              >
                <div className="catalog-icon-wrapper">
                  {icon}
                </div>
                <span className="catalog-label">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CategoryCatalog;
