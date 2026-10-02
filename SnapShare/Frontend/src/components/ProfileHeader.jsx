// ProfileHeader.jsx
function ProfileHeader({ user = {} }) {
  return (
    <header className="profile-header">
      <div>
        <img 
          src={user.avatarUrl || "../assets/profile-avatar.png"} 
          alt={`${user.username || "User"}'s avatar`} 
          style={{ width: "100px", height: "100px", borderRadius: "50%" }}
        />
      </div>
      <section>
        <h2>Profile Details</h2>
        <p><strong>Username:</strong> {user.username || "Guest"}</p>
        <p><strong>Pronouns:</strong> {user.pronouns || "Not specified"}</p>
        <p><strong>Bio:</strong> {user.bio || "No bio available."}</p>
      </section>
    </header>
  );
}

export default ProfileHeader;