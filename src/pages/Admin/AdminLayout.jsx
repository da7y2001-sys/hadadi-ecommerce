import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { AdminNotificationProvider } from "../../context/AdminNotificationContext";
import "./AdminLayout.css";

function AdminLayout() {
  return (
    <AdminNotificationProvider>
      <div className="admin-layout">
        <AdminSidebar />

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </AdminNotificationProvider>
  );
}

export default AdminLayout;
