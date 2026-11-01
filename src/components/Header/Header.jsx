import TopHeader from "./TopHeader";
import BitmHeader from "./BitmHeader";
import { useLanguage } from "../../context/LanguageContext";
import "./Header.css";

function Header({ categories, categoriesLoading, categoriesError }) {
  const { t } = useLanguage();

  return (
    <header className="store-header">
      {/* Top Utility Announcement Bar */}
      <div className="top-announcement">
        <div className="container announcement-content">
          <span>{t("announcement")}</span>
        </div>
      </div>

      <TopHeader />
      <BitmHeader
        categories={categories}
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
      />
    </header>
  );
}

export default Header;
