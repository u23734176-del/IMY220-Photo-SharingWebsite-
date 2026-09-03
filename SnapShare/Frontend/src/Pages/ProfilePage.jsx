// src/Pages/ProfilePage.jsx

import { useNavigate } from 'react-router-dom';
import Post from '../components/Post';

function ProfilePage({ username, posts }) {
  const navigate = useNavigate();

  // Filter posts created by the current user
  const userPosts = posts ? posts.filter((post) => post.author === username) : [];

  return (
    <div>
      <h1>User Profile</h1>

      {/* Navigation back to Home */}
      <button type="button" onClick={() => navigate("/home")}>
        Go to Home
      </button>

      {/* Account Details */}
      <section>
        <h2>Account Info</h2>
        <p><strong>Username:</strong> {username || "Not logged in"}</p>
      </section>

      {/* Personal Feed */}
      <section>
        <h3>My Posts ({userPosts.length})</h3>
        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <Post key={post.id} post={post} />
          ))
        ) : (
          <p>No posts published yet.</p>
        )}
      </section>
    </div>
  );
}

// Crucial: Export the component as default
export default ProfilePage;