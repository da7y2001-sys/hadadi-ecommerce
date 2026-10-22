import { NavLink } from "react-router-dom";

function AdminSidebar() {
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
    </aside>
  );
}

export default AdminSidebar;
