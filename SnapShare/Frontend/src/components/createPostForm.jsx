// src/components/CreatePostForm.jsx

import { useState } from 'react';

const CATEGORIES = ["Nature", "Travel", "People", "Fashion", "Technology", "Other"];

function CreatePostForm({ onAddPost, currentUser }) {
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("Nature");
  const [image, setImage] = useState("");
  const [hashTags, setHashTags] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!caption.trim()) return;

    // Convert raw hashtag input into array of strings prefixed with '#'
    const formattedTags = hashTags
      .split(/[\s,]+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));

    const newPost = {
      username: currentUser || "PixelNomad",
      imageURL: image.trim() || "../assets/logo.png",
      caption: caption.trim(),
      category,
      hashTags: formattedTags,
      createdAt: new Date().toISOString()
    };

    onAddPost(newPost);

    // Reset Form Fields
    setCaption("");
    setImage("");
    setCategory("Nature");
    setHashTags("");
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
        <div>
          <label>Hashtags: </label>
          <input
            type="text"
            value={hashTags}
            onChange={(e) => setHashTags(e.target.value)}
            placeholder="#sunset #nature or sunset, nature"
          />
        </div>
        <button type="submit">Publish Post</button>
      </form>
    </section>
  );
}

export default CreatePostForm;