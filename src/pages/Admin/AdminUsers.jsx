import { useEffect, useState } from "react";
import api from "../../services/api";
import { ErrorState } from "../../components";
import "./AdminUsers.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    let isActive = true;

    api
      .get("/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (isActive) setUsers(res.data);
      })
      .catch(() => {
        if (isActive) {
          setError("Could not load users. Please try again.");
        }
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [retryCount]);

  if (loading) {
    return <p>Loading users...</p>;
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load users"
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
      <h1 className="admin-users-title">Users</h1>

      <table className="admin-users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsers;
