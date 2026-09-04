// src/Pages/PostPage.jsx

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import UsersPosts from '../components/UsersPosts';

function Posts({ username = "Guest", posts = [], setPosts }) {
  const { id } = useParams();

  // Filter posts if an ID is present in the URL parameter
  const displayedPosts = id 
    ? posts.filter((p) => p.id === Number(id))
    : posts;

  // Form toggle and inputs for creating a new post
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newImage, setNewImage] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newCaption.trim()) return;

    const newPostObj = {
      id: Date.now(),
      image: newImage || "../assets/logo.png",
      caption: newCaption.trim(),
      author: username || "Guest",
      category: newCategory || "Other",
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      likes: 0,
      comments: []
    };

    if (setPosts) {
      setPosts([newPostObj, ...posts]);
    }

    setNewCaption("");
    setNewCategory("");
    setNewImage(null);
    setShowCreateForm(false);
  };

  const handleUpdatePost = (updatedPost) => {
    if (setPosts) {
      setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
    }
  };

  return (
    <main>
      <h2>Posts Feed</h2>

      {/* Button to toggle Post Creation Form */}
      <div>
        <button type="button" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? "Cancel" : "Create Post"}
        </button>
      </div>

      {/*  Filters */}
      <div>
        <select id="filter">
          <option value="global">Filters</option>
          <option value="newest">Recently Posted</option>
          <option value="mostShared">Most Liked</option>
          <option value="mostLiked">Most Commented</option>
        </select>
      </div>

      {/* Create Post Form */}
      {showCreateForm && (
        <form onSubmit={handleCreatePost}>
          <h3>Create a New Post</h3>

          <div>
            <label>Caption: </label>
            <input
              type="text"
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              placeholder="What's on your mind?"
              required
            />
          </div>

          <div>
            <label>Category: </label>
            <select 
              id="Categories-filter"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            >
              <option value="">Categories</option>
              <option value="nature">Nature</option>
              <option value="Travel">Travel</option>
              <option value="Animals">People</option>
              <option value="Fashion">Fashion</option>
              <option value="Technology">Technology</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label>Upload Image: </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          {newImage && (
            <div>
              <p>Preview:</p>
              <img src={newImage} alt="Post preview" width="120" />
            </div>
          )}

          <button type="submit">Submit Post</button>
        </form>
      )}

      <hr />

      <section>
        {displayedPosts.length > 0 ? (
          displayedPosts.map((post) => (
            <UsersPosts 
              key={post.id} 
              post={post} 
              onUpdatePost={handleUpdatePost} 
            />
          ))
        ) : (
          <p>No posts found for this ID.</p>
        )}
      </section>
    </main>
  );
}

export default Posts;