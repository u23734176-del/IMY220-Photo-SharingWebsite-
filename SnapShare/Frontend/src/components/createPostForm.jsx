// src/components/CreatePostForm.jsx

import { useState } from 'react';

const CATEGORIES = ["Nature", "Travel", "People", "Fashion", "Technology", "Other"];

function CreatePostForm({ onAddPost, currentUser }) {
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("Nature");
  const [image, setImage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!caption.trim()) return;

    const newPost = {
      id: Date.now(),
      image: image.trim() || "../assets/logo.png",
      caption: caption.trim(),
      author: currentUser || "Guest",
      category,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      likes: 0,
      comments: []
    };

    onAddPost(newPost);
    setCaption("");
    setImage("");
    setCategory("Nature");
  };

  return (
    <section>
      <h3>Create New Post</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Image URL: </label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Enter image URL..."
          />
        </div>
        <div>
          <label>Caption: </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            required
          />
        </div>
        <div>
          <label>Category: </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Publish Post</button>
      </form>
    </section>
  );
}

export default CreatePostForm;