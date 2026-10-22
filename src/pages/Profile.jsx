import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Profile.css";

function Profile() {
  const { user, setUser } = useAuth();

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
      const token = localStorage.getItem("token");

      const res = await api.patch(
        "/profile",
        {
          name,
          email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUser(res.data.user);
      setEditing(false);

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update profile. Please try again.",
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
      const token = localStorage.getItem("token");

      await api.patch(
        "/profile/password",
        {
          currentPassword,
          newPassword,
          confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Password updated successfully");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update password. Please try again.",
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };
  return (
    <div className="profile-page">
      <h1 className="profile-title">My Profile</h1>

      <div className="profile-card">
        <h2>Personal Information</h2>

        {!editing ? (
          <>
            <div className="profile-info">
              <strong>Name:</strong> {user?.name}
            </div>

            <div className="profile-info">
              <strong>Email:</strong> {user?.email}
            </div>

            <button
              className="profile-edit-btn"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleUpdate} className="profile-form">
            <label>Name</label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="profile-form-actions">
              <button type="submit" disabled={isUpdatingProfile}>
                {isUpdatingProfile ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={isUpdatingProfile}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="profile-actions">
        <Link to="/orders">My Orders</Link>
      </div>

      <div className="profile-card">
        <h2>Change Password</h2>

        <form onSubmit={handlePasswordUpdate} className="profile-form">
          <label>Current Password</label>

          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <label>New Password</label>

          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <label>Confirm New Password</label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="profile-form-actions">
            <button type="submit" disabled={isUpdatingPassword}>
              {isUpdatingPassword ? "Updating..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
