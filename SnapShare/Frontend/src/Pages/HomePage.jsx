// HomePage.jsx
import Post from '../components/Post';
import { useNavigate } from 'react-router-dom';

function HomePage({ username, posts }) {
  const navigate = useNavigate();

  return (
    <main>
      {/* Profile Button / Link */}
      <div>
        <button type="button" onClick={() => navigate("/profile")}>
          My Profile ({username || "Guest"})
        </button>
      </div>

      {/* Top Search Bar */}
      <div>
        <button type="button">Search Icon</button>
        <input type="text" placeholder="Search Bar" />
      </div>

      {/* Page Description */}
      <div>
        <p>"See what people are posting"</p>
      </div>

      {/* Dropdown Filters */}
      <div>
        <select id="global-activity">
          <option value="global">Global Activity</option>
          <option value="newest">Recently Posted</option>
          <option value="mostShared">Most Liked</option>
          <option value="mostLiked">Most Commented</option>
        </select>

        <select id="Categories-filter">
          <option value="">Categories</option>
          <option value="nature">Nature</option>
          <option value="Travel">Travel</option>
          <option value="Animals">People</option>
          <option value="Fashion">Fashion</option>
          <option value="Technology">Technology</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Feed Posts Grid using central state */}
      <section>
        {posts && posts.length > 0 ? (
          posts.map((postItem) => (
            <Post key={postItem.id} post={postItem} />
          ))
        ) : (
          <p>No posts available.</p>
        )}
      </section>
    </main>
  );
}

export default HomePage;