// src/Pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import FriendsComponent from '../components/FriendsComponent';
import EditableField from '../components/EditableField';
import ProfileHeader from '../components/ProfileHeader';
import AccountActions from '../components/AccountActions';

const ACCOUNT_FIELDS = [
  { fieldName: "firstname", label: "First Name" },
  { fieldName: "surname", label: "Surname" },
  { fieldName: "username", label: "Username" },
  { fieldName: "email", label: "Email Address", type: "email" },
  { fieldName: "pronouns", label: "Pronouns" },
  { fieldName: "bio", label: "Bio" },
];

const JSON_HEADERS = { "Content-Type": "application/json" };

function ProfilePage({ username, setUsername, users = [], friendsList = [] }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const activeUser = id || username || "Guest";
  const isLoggedIn = !!username;
  const isOwnProfile = !id || id === username;

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");

  // The fetched profile is stored with the username it was loaded for,
  // so nothing needs to be reset synchronously inside the effect.
  const [fetched, setFetched] = useState({ forUser: "", profile: null, error: "" });

  // Same placeholder profile as the original page
  const defaultProfile = {
    id: activeUser,
    username: activeUser,
    firstname: activeUser !== "Guest" ? activeUser : "Guest",
    surname: "User",
    email: "user@example.com",
    pronouns: "They/Them",
    bio: "Welcome to my profile!",
  };

  const localUser = users.find((u) => u.username === activeUser || u.id === activeUser);
  const isCurrent = fetched.forUser === activeUser;
  const userProfile = (isCurrent && fetched.profile) || localUser || defaultProfile;
  const error = actionError || (isCurrent ? fetched.error : "");

  // ---------- LOAD PROFILE ----------
  useEffect(() => {
    if (!activeUser || activeUser === "Guest") return undefined;

    let cancelled = false;

    async function fetchProfile() {
      try {
        const response = await fetch(`/api/profile/${encodeURIComponent(activeUser)}`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load profile.");
        if (!cancelled) setFetched({ forUser: activeUser, profile: data.user, error: "" });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        if (!cancelled) setFetched({ forUser: activeUser, profile: null, error: err.message });
      }
    }

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [activeUser]);

  // ---------- EDIT ----------
  const handleStartEdit = (field, currentValue = "") => {
    setActionError("");
    setSuccess("");
    setEditingField(field);
    setTempValue(currentValue);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValue("");
  };

  const handleSaveEdit = async (field) => {
    setActionError("");
    setSuccess("");

    if (!isLoggedIn) {
      setActionError("Please log in to edit your profile.");
      return;
    }

    const value = field === "password" ? tempValue : tempValue.trim();

    try {
      const response = await fetch(`/api/profile/${encodeURIComponent(activeUser)}`, {
        method: "PUT",
        headers: JSON_HEADERS,
        body: JSON.stringify({
          requesterUsername: username,
          [field]: value,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not update profile.");

      // Only update the screen once the server has accepted the change
      const renamedSelf = field === "username" && isOwnProfile;
      setFetched({
        forUser: renamedSelf ? data.user.username : activeUser,
        profile: data.user,
        error: "",
      });
      setEditingField(null);
      setTempValue("");
      setSuccess(field === "password" ? "Password updated." : "Profile updated.");

      // Keep the app in sync if the logged-in user renamed themselves
      if (renamedSelf && setUsername) {
        setUsername(data.user.username);
        if (id) navigate("/profile", { replace: true });
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      setActionError(err.message);
    }
  };

  // ---------- LOG OUT ----------
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ username }),
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    }

    if (setUsername) setUsername("");
    navigate("/login");
  };

  // ---------- DELETE ----------
  const handleDeleteAccount = async () => {
    if (!isLoggedIn || activeUser === "Guest") {
      setActionError("Please log in to delete an account.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmed) return;

    setActionError("");

    try {
      const response = await fetch(`/api/profile/${encodeURIComponent(activeUser)}`, {
        method: "DELETE",
        headers: JSON_HEADERS,
        body: JSON.stringify({ requesterUsername: username }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not delete account.");

      if (isOwnProfile) {
        if (setUsername) setUsername("");
        navigate("/signUp");
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      setActionError(err.message);
    }
  };

  return (
    <div id="main_page">
      <ProfileHeader user={userProfile} />

      {/* Only load real friends / pending requests on your own profile,
          so other people's requests are never shown or actionable */}
      <FriendsComponent
        username={isOwnProfile ? username : ""}
        friendsList={friendsList}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <section>
        <h3>Account Management</h3>
        <div>
          {ACCOUNT_FIELDS.map(({ fieldName, label, type }) => (
            <EditableField
              key={fieldName}
              fieldName={fieldName}
              label={label}
              type={type}
              value={userProfile[fieldName] || ""}
              editingField={editingField}
              tempValue={tempValue}
              onStartEdit={handleStartEdit}
              onSaveEdit={handleSaveEdit}
              onCancel={handleCancelEdit}
              onChange={setTempValue}
            />
          ))}

          <EditableField
            fieldName="password"
            label="Password"
            type="password"
            value="••••••••"
            editingField={editingField}
            tempValue={tempValue}
            onStartEdit={handleStartEdit}
            onSaveEdit={handleSaveEdit}
            onCancel={handleCancelEdit}
            onChange={setTempValue}
          />
        </div>
      </section>

      {/* Actions allowed for active user */}
      <AccountActions
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
      />
    </div>
  );
}

export default ProfilePage;