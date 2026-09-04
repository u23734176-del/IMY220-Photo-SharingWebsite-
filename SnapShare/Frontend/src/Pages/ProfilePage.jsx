// src/Pages/ProfilePage.jsx

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FriendsComponent from '../components/FriendsComponent';
import ProfilePreview from '../components/ProfilePreview';

function ProfilePage({ users = [], friendsList = [] }) {
  const navigate = useNavigate();
  const { id } = useParams();

  // Toggle state for Profile Preview modal/card
  const [showPreview, setShowPreview] = useState(false)

  // Helper to extract matching user or fallback to Guest
  const getProfileData = (userId) => {
    const matched = users.find((u) => u.id === Number(userId));
    return matched ? { ...matched } : {
      id: "Guest",
      username: "Guest",
      firstname: "Guest",
      surname: "User",
      email: "guest@example.com",
      pronouns: "They/Them",
      bio: "You are currently browsing in Guest Mode."
    };
  };

  // Track prevId to sync with Current ID
  const [prevId, setPrevId] = useState(id);
  const [userProfile, setUserProfile] = useState(() => getProfileData(id));

  if (id !== prevId) {
    setPrevId(id);
    setUserProfile(getProfileData(id));
  }

  // Track active field being edited and input value
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");

  const handleStartEdit = (field, currentValue = "") => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const handleSaveEdit = (field) => {
    setUserProfile((prev) => ({
      ...prev, [field]: tempValue
        }));
    setEditingField(null);
    setTempValue("");
  };

  const handleLogout = () => {
    navigate("/login");
  };

  const handleDeleteAccount = () => {
    alert("Account deletion triggered.");
  };

  

  return (
    <main>
      {/* Profile Header Avatar */}
      <div>
        <img src="../assets/profile-avatar.png" alt="Profile Avatar" />
      </div>

      {/* Profile Details Block */}
      <section>
        <h2>Profile Details:</h2>
        <p><strong>User ID:</strong> {userProfile.id || "N/A"}</p>
      </section>

      {/* Friends Section Component */}
      <FriendsComponent friendsList={friendsList} />

      {/* Account Management Section */}
      <section>
        <h3>Account Management</h3>
        <ul>
          {/* First Name */}
          <div>
            <p><strong>First Name:</strong> {userProfile.firstname}</p>
            {editingField === "firstname" ? (
              <div>
                <input 
                  type="text" 
                  value={tempValue} 
                  onChange={(e) => setTempValue(e.target.value)} 
                  placeholder="Enter new first name"
                />
                <button type="button" onClick={() => handleSaveEdit("firstname")}>Save</button>
                <button type="button" onClick={() => setEditingField(null)}>Cancel</button>
              </div>
            ) : (
              <button type="button" onClick={() => handleStartEdit("firstname", userProfile.firstname)}>
                Change First Name
              </button>
            )}
          </div>

          {/* Surname */}
          <div>
            <p><strong>Surname:</strong> {userProfile.surname}</p>
            {editingField === "surname" ? (
              <div>
                <input 
                  type="text" 
                  value={tempValue} 
                  onChange={(e) => setTempValue(e.target.value)} 
                  placeholder="Enter new surname"
                />
                <button type="button" onClick={() => handleSaveEdit("surname")}>Save</button>
                <button type="button" onClick={() => setEditingField(null)}>Cancel</button>
              </div>
            ) : (
              <button type="button" onClick={() => handleStartEdit("surname", userProfile.surname)}>
                Change Surname
              </button>
            )}
          </div>

          {/* Username */}
          <div>
            <p><strong>Username:</strong> {userProfile.username}</p>
            {editingField === "username" ? (
              <div>
                <input 
                  type="text" 
                  value={tempValue} 
                  onChange={(e) => setTempValue(e.target.value)} 
                  placeholder="Enter new username"
                />
                <button type="button" onClick={() => handleSaveEdit("username")}>Save</button>
                <button type="button" onClick={() => setEditingField(null)}>Cancel</button>
              </div>
            ) : (
              <button type="button" onClick={() => handleStartEdit("username", userProfile.username)}>
                Change Username
              </button>
            )}
          </div>

          {/* Email */}
          <div>
            <p><strong>Email Address:</strong> {userProfile.email}</p>
            {editingField === "email" ? (
              <div>
                <input 
                  type="email" 
                  value={tempValue} 
                  onChange={(e) => setTempValue(e.target.value)} 
                  placeholder="Enter new email"
                />
                <button type="button" onClick={() => handleSaveEdit("email")}>Save</button>
                <button type="button" onClick={() => setEditingField(null)}>Cancel</button>
              </div>
            ) : (
              <button type="button" onClick={() => handleStartEdit("email", userProfile.email)}>
                Change Email Address
              </button>
            )}
          </div>

          {/* Pronouns */}
          <div>
            <p><strong>Pronouns:</strong> {userProfile.pronouns}</p>
            {editingField === "pronouns" ? (
              <div>
                <input 
                  type="text" 
                  value={tempValue} 
                  onChange={(e) => setTempValue(e.target.value)} 
                  placeholder="Enter new pronouns"
                />
                <button type="button" onClick={() => handleSaveEdit("pronouns")}>Save</button>
                <button type="button" onClick={() => setEditingField(null)}>Cancel</button>
              </div>
            ) : (
              <button type="button" onClick={() => handleStartEdit("pronouns", userProfile.pronouns)}>
                Change Pronouns
              </button>
            )}
          </div>

          {/* Bio */}
          <div>
            <p><strong>Bio:</strong> {userProfile.bio}</p>
            {editingField === "bio" ? (
              <div>
                <input 
                  type="text" 
                  value={tempValue} 
                  onChange={(e) => setTempValue(e.target.value)} 
                  placeholder="Enter new bio"
                />
                <button type="button" onClick={() => handleSaveEdit("bio")}>Save</button>
                <button type="button" onClick={() => setEditingField(null)}>Cancel</button>
              </div>
            ) : (
              <button type="button" onClick={() => handleStartEdit("bio", userProfile.bio)}>
                Change Bio
              </button>
            )}
          </div>    

          <li>
            {editingField === "password" ? (
              <div>
                <input 
                  type="password" 
                  value={tempValue} 
                  onChange={(e) => setTempValue(e.target.value)} 
                  placeholder="Enter new password"
                />
                <button type="button" onClick={() => handleSaveEdit("password")}>Save Password</button>
                <button type="button" onClick={() => setEditingField(null)}>Cancel</button>
              </div>
            ) : (
              <button type="button" onClick={() => handleStartEdit("password", "")}>
                Change Password
              </button>
            )}
          </li>
        </ul>
      </section>

      {/* Settings Section */}
      <section>
        <h3>Settings</h3>
        <ul>
          <li>Preferences</li>
          <li>Language</li>
          
        </ul>
      </section>
      {/* Preview Profile Toggle Button */}
      <section>
        <div>
          <button type="button" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? "Hide Preview" : "Preview Profile"}
          </button>
        </div>

        {/* Conditionally Rendered Profile Preview Component */}
        {showPreview && (
          <div>
            <hr />
            <ProfilePreview user={userProfile} />
            <hr />
          </div>
        )}
      </section>

      {/* Bottom Actions */}
      <div>
        <button type="button" onClick={handleLogout}>
          LogOut
        </button>
        <button type="button" onClick={handleDeleteAccount}>
          Delete Account
        </button>
      </div>
    </main>
  );
}

export default ProfilePage;