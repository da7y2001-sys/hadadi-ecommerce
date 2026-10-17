import TopHeader from "./TopHeader";
import BitmHeader from "./BitmHeader";
import "./Header.css";

function Header({ categories, categoriesLoading, categoriesError }) {
  return (
    <header className="store-header">
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
