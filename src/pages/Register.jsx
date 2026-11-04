import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      toast.success(t("registerSuccess"));
      navigate("/login");
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 409) {
        toast.error(
          message || t("emailAlreadyExists"),
        );
      } else if (status === 400) {
        toast.error(
          message || t("registrationFailed"),
        );
      } else if (error.response) {
        toast.error(message || t("serverError"));
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
        <h1>{t("registerTitle")}</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={t("namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            aria-label={t("namePlaceholder")}
          />

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
            {isSubmitting ? t("creatingAccount") : t("registerTitle")}
          </button>
          <p className="auth-link">
            {t("alreadyHaveAccount")} <Link to="/login">{t("loginLink")}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
