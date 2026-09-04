// src/Pages/ProfilePage.jsx

import { useNavigate } from 'react-router-dom';

function ProfilePage({ username }) {
  const navigate = useNavigate(); //[cite: 5]

  // Dummy friend items following the wireframe list
  const friendsList = [
    { id: 1, name: "Johan", status: "Online" },
    { id: 2, name: "FriendUserName2", status: "Online" },
    { id: 3, name: "FriendUserName3", status: "Online" },
    { id: 4, name: "FriendUserName4", status: "Online" }
  ];

  

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
        <p><strong>Username :</strong> {username || "Username"}</p>
        <p><strong>Pronouns:</strong> He/him/Her</p>
        <div>
          <p><strong>Bio:</strong></p>
          <p>bluh blubh bluh bluh blibj bluh</p>
        </div>
      </section>

      {/* Friends List Block */}
      <section>
        <h2>Friends</h2>
        <ul>
          {friendsList.map((friend) => (
            <li key={friend.id}>
              <span>Picture of Friend</span>
              <br/>
              <small>{friend.status} </small>
              <br/>
              <span>{friend.name} </span>
              <br/>
              <button type="button">Accept Frined request</button>
              <br/>
            </li>
          ))}
        </ul>
        <div>
          <button type="button">+</button>
          <button type="button">✕</button>
        </div>
      </section>

      {/* Account Management Section */}
      <section>
        <h3>Account Management</h3>
        <ul>
          <li><button type="button">Change Email Address</button></li>
          <li><button type="button">Change Planning</button></li>
          <li><button type="button">Change Password</button></li>
          <li><button type="button">Edit Changes</button></li>
        </ul>
      </section>

      {/* Settings Section */}
      <section>
        <h3>Settings</h3>
        <ul>
          <li>Preferences</li>
          <li>language</li>
          <li>notification options</li>
        </ul>
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

// Friends Componenet 

// 

export default ProfilePage; //[cite: 5]