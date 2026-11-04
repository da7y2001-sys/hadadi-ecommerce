import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import RouteLoading from "../common/RouteLoading";

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <RouteLoading />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

export default AdminRoute;
