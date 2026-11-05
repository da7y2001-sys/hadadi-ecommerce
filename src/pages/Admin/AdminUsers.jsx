import { useEffect, useState } from "react";
import api from "../../services/api";
import { ErrorState } from "../../components";
import AdminNotificationBell from "../../components/Admin/AdminNotificationBell";
import { useLanguage } from "../../context/LanguageContext";
import "./AdminUsers.css";

function AdminUsers() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    api
      .get("/admin/users")
      .then((res) => {
        if (isActive) setUsers(res.data);
      })
      .catch(() => {
        if (isActive) {
          setError(t("serverError") || "Could not load users. Please try again.");
        }
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [retryCount, t]);

  if (loading) {
    return <p>{t("loading")}</p>;
  }

  if (error) {
    return (
      <ErrorState
        title={t("serverError") || "Could not load users"}
        message={error}
        onRetry={() => {
          setLoading(true);
          setError("");
          setRetryCount((count) => count + 1);
        }}
      />
    );
  }

  return (
    <div className="admin-users-page">
      <div className="admin-page-header">
        <h1 className="admin-users-title">{t("dashboardUsers")}</h1>
        <AdminNotificationBell />
      </div>

      <div className="admin-users-table-wrapper">
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>{t("userColName")}</th>
              <th>{t("userColEmail")}</th>
              <th>{t("userColRole")}</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  <bdi>{user.name}</bdi>
                </td>
                <td>
                  <bdi dir="ltr">{user.email}</bdi>
                </td>
                <td>
                  <bdi>{user.role}</bdi>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;
