import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

function AdminSidebar() {
  const { logout } = useAuth();
  const { t } = useLanguage();

  return (
    <aside className="admin-sidebar">
      <h2>{t("adminBrand")}</h2>

      <nav>
        <NavLink to="/admin" end>
          {t("sidebarDashboard")}
        </NavLink>

        <NavLink to="/admin/products">{t("sidebarProducts")}</NavLink>

        <NavLink to="/admin/orders">{t("sidebarOrders")}</NavLink>

        <NavLink to="/admin/users">{t("sidebarUsers")}</NavLink>
      </nav>

      <div className="admin-sidebar-actions">
        <button type="button" onClick={logout}>
          {t("logout")}
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
