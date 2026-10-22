import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminSidebar() {
  const { logout } = useAuth();

  return (
    <aside className="admin-sidebar">
      <h2>Hadai Admin</h2>

      <nav>
        <NavLink to="/admin" end>
          Dashboard
        </NavLink>

        <NavLink to="/admin/products">Products</NavLink>

        <NavLink to="/admin/orders">Orders</NavLink>

        <NavLink to="/admin/users">Users</NavLink>
      </nav>

      <div className="admin-sidebar-actions">
        <Link to="/">Back to Store</Link>
        <button type="button" onClick={logout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
