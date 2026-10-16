import TopHeader from "./TopHeader";
import BitmHeader from "./BitmHeader";
import "./Header.css";

function Header({ categories }) {
  return (
    <header className="store-header">
      <TopHeader />
      <BitmHeader categories={categories} />
    </header>
  );
}

export default Header;
