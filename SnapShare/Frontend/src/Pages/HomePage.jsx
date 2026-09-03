// HomePage.jsx
function HomePage({ username }) {
  // Array representing the posts grid shown in the wireframe
  const posts = [1, 2, 3, 4, 5, 6];

  return (
    <main>
      {/* Top Search Bar */}
      <div>
        <button type="button">Search Icon</button>
        <input type="text" placeholder="Search Bar" />
      </div>
      {/* Add Profile Componetnet */}

      {/* Page Description */}
      <div>
        <p>Short Text Description of Page , like : "See what people are posting"</p>
      </div>

      {/* Dropdown Filters */}
      <div>
        <select id="global-activity">
          <option value="global">Global Activity</option>
            <option value="newest">Recently Posted</option>
            <option value="mostShared">Most Liked</option>
            <option value="mostLiked">Most Commented</option>
            <option></option>
        </select>

        <select id="Categories-filter">
          <option value="">Categories</option>
            <option value="nature">Nature</option>
            <option value="Travel">Travel</option>
            <option value="Animals">People</option>
            <option value="Fashion">Fashion</option>
            <option value = "Technology">Technology</option>
            <option value="Other">Other</option>
        </select>
      </div>

      {/* Feed Posts Grid */}
      <section>
        {posts.map((item) => (
          <article key={item}>
            {/* Post Image */}
            <img src="../assets/placeholder.png" alt="feed Post Image" />

            {/* Post Caption */}
            <h4>feed Post Caption</h4>

            {/* Post Description */}
            <p>feed Posts Description</p>

            {/* Author Footer */}
            <div>
              <p>By: {username || "Username"}</p>
              <img src="../assets/avatar.png" alt="Author Avatar" />
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default HomePage;