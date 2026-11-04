import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import "./Profile.css";

function Profile() {
  const { user, setUser } = useAuth();
  const { t } = useLanguage();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (isUpdatingProfile) return;

    setIsUpdatingProfile(true);

    try {
      const res = await api.patch(
        "/profile",
        {
          name,
          email,
        },
      );

      setUser(res.data.user);
      setEditing(false);

      toast.success(t("profileUpdateSuccess"));
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          t("profileUpdateFailed"),
      );
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (isUpdatingPassword) return;

    setIsUpdatingPassword(true);

    try {
      await api.patch(
        "/profile/password",
        {
          currentPassword,
          newPassword,
          confirmPassword,
        },
      );

      toast.success(t("passwordUpdateSuccess"));

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          t("passwordUpdateFailed"),
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };
  return (
    <div className="profile-page">
      <h1 className="profile-title">{t("profileTitle")}</h1>

      <div className="profile-card">
        <h2>{t("personalInfoHeading")}</h2>

        {!editing ? (
          <>
            <div className="profile-info">
              <strong>{t("fullName")}:</strong> {user?.name}
            </div>

            <div className="profile-info">
              <strong>{t("email")}:</strong> {user?.email}
            </div>

            <button
              className="profile-edit-btn"
              onClick={() => setEditing(true)}
            >
              {t("editProfileBtn")}
            </button>
          </>
        ) : (
          <form onSubmit={handleUpdate} className="profile-form">
            <label>{t("fullName")}</label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              aria-label={t("fullName")}
            />

            <label>{t("email")}</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label={t("email")}
            />

            <div className="profile-form-actions">
              <button type="submit" disabled={isUpdatingProfile}>
                {isUpdatingProfile ? t("savingProfile") : t("saveChanges")}
              </button>

              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={isUpdatingProfile}
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="profile-actions">
        <Link to="/orders">{t("myOrders")}</Link>
      </div>

      <div className="profile-card">
        <h2>{t("changePasswordHeading")}</h2>

        <form onSubmit={handlePasswordUpdate} className="profile-form">
          <label>{t("currentPassword")}</label>

          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            aria-label={t("currentPassword")}
          />

          <label>{t("newPassword")}</label>

          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            aria-label={t("newPassword")}
          />

          <label>{t("confirmNewPassword")}</label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            aria-label={t("confirmNewPassword")}
          />

          <div className="profile-form-actions">
            <button type="submit" disabled={isUpdatingPassword}>
              {isUpdatingPassword ? t("updatingPassword") : t("changePasswordBtn")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
