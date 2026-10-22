import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import "./Auth.css";
function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const token = res.data.token;

      localStorage.setItem("token", token);

      const profileRes = await api.get("/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(profileRes.data.user);

      toast.success("Logged in successfully");
      if (profileRes.data.user.role === "admin") {
        navigate(location.state?.from || "/admin");
      } else {
        navigate(location.state?.from || "/");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error(
          error.response.data?.message || "Invalid email or password",
        );
      } else if (error.response) {
        toast.error(
          error.response.data?.message || "Server error. Please try again later",
        );
      } else {
        toast.error("Unable to connect to the server. Please try again");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Login</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
          <p className="auth-link">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
