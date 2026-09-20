
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Post from '../components/Post';
import HomeHeader from '../components/HomeHeader';
import FeedFilters from '../components/FeedFilters';

function HomePage({ username, posts = [], onUpdatePost }) {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [activityFilter, setActivityFilter] = useState("global");
  const [categoryFilter, setCategoryFilter] = useState("");

  return (
    <main>
      <HomeHeader 
        username={username} 
        onNavigateProfile={() => navigate("/profile")}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <FeedFilters 
        selectedActivity={activityFilter}
        onActivityChange={setActivityFilter}
        selectedCategory={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />

      {/* Feed Posts Grid */}
      <section>
        {posts && posts.length > 0 ? (
          posts.map((postItem) => (
            <Post 
              key={postItem.id} 
              post={postItem} 
              onUpdatePost={onUpdatePost}
            />
          ))
        ) : (
          <p>No posts available.</p>
        )}
      </section>
    </main>
  );
}

export default HomePage;