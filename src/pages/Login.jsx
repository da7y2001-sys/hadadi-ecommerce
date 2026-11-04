import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useLanguage } from "../context/LanguageContext";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const { t } = useLanguage();

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

      const profileRes = await api.get("/profile");

      setUser(profileRes.data.user);

      toast.success(t("loginSuccess"));
      if (profileRes.data.user.role === "admin") {
        navigate(location.state?.from || "/admin");
      } else {
        navigate(location.state?.from || "/");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error(
          error.response.data?.message || t("invalidEmailOrPassword"),
        );
      } else if (error.response) {
        toast.error(
          error.response.data?.message || t("serverError"),
        );
      } else {
        toast.error(t("networkError"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{t("loginTitle")}</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label={t("emailPlaceholder")}
          />

          <input
            type="password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-label={t("passwordPlaceholder")}
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("loggingIn") : t("loginTitle")}
          </button>
          <p className="auth-link">
            {t("dontHaveAccount")} <Link to="/register">{t("registerLink")}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
