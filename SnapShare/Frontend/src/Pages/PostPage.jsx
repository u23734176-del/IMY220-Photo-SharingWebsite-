// src/Pages/PostPage.jsx

import { useState } from 'react';
import { useParams , useNavigate } from 'react-router-dom';
import Post from '../components/Post';
import CreatePostForm from '../components/createPostForm';
import FeedFilters from '../components/FeedFilters';

function Posts({ username, posts = [], setPosts }) {

  const { id } = useParams();
  const [activityFilter, setActivityFilter] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState("");

  const navigate = useNavigate();//url to the profile page 

  const activeAuthor = id || username || "tadiwanashe";

  const handleAddPost = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

  // Filter posts belonging to active user
  let userPosts = posts.filter((post) => post.author === activeAuthor);

  // Filter by selected category
  if (categoryFilter) {
    userPosts = userPosts.filter((post) => post.category === categoryFilter);
  }
  

  // Apply sorting options matching FeedFilters values
  const sortedPosts = [...userPosts].sort((a, b) => {
    if (activityFilter === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (activityFilter === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (activityFilter === "mostLiked") {
      return (b.likes || 0) - (a.likes || 0);
    }
    if (activityFilter === "mostCommented") {
      return (b.comments?.length || 0) - (a.comments?.length || 0);
    }
    return 0;
  });

 const onNavigateProfile = ()=> {
      navigate("/profile");
 }

  return (
    <main>
      <h2>Posts by {activeAuthor}</h2>

      {/* Post Creation Form */}
      <CreatePostForm onAddPost={handleAddPost} currentUser={activeAuthor} />

      <hr />

       {/* Profile Button / Link */}
      <div>
        <button type="button" onClick={onNavigateProfile}>
          My Profile ({username || "Guest"})
        </button>
      </div>

      {/* Shared Feed Filters Component */}
      <FeedFilters
        selectedActivity={activityFilter}
        onActivityChange={setActivityFilter}
        selectedCategory={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />

      <hr />

      {/* User Posts Display */}
      <section>
        {sortedPosts.length > 0 ? (
          sortedPosts.map((postItem) => (
            <Post
              key={postItem.id}
              post={postItem}
              onUpdatePost={handleUpdatePost}
              isEditable={true}
            />
          ))
        ) : (
          <p>No posts found for this user.</p>
        )}
      </section>
    </main>
  );
}

export default Posts;