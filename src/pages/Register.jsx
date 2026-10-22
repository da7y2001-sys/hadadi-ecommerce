import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import "./Auth.css";
function Register() {
  const navigate = useNavigate();

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

      toast.success("Account created successfully. Please log in");
      navigate("/login");
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 409) {
        toast.error(
          message || "An account with this email already exists",
        );
      } else if (status === 400) {
        toast.error(
          message || "Registration failed. Please check your details",
        );
      } else if (error.response) {
        toast.error("Server error. Please try again later");
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
        <h1>Create Account</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
