// src/components/CreatePostForm.jsx

import { useState, useRef, useEffect } from 'react';

const CATEGORIES = ["Nature", "Travel", "People", "Fashion", "Technology", "Other"];
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB (the server enforces the same limit)

function CreatePostForm({ onAddPost, currentUser }) {
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("Nature");
  const [hashTags, setHashTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [fileError, setFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const previewRef = useRef("");

  // Create the preview URL, and free the previous one so memory isn't leaked
  const updatePreview = (file) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = file ? URL.createObjectURL(file) : "";
    setPreview(previewRef.current);
  };

  // Free the preview URL when the form unmounts
  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const clearImage = () => {
    setImageFile(null);
    updatePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileError("");

    if (!file) {
      clearImage();
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError("Please choose a JPG, PNG, GIF or WEBP image.");
      clearImage();
      return;
    }

    if (file.size > MAX_BYTES) {
      setFileError("Image is too large (max 5 MB).");
      clearImage();
      return;
    }

    setImageFile(file);
    updatePreview(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // The page sends this to the server. It resolves to true when the post was saved.
      const saved = await onAddPost({
        caption: caption.trim(),
        category,
        hashTags: hashTags.trim(), // the server turns this into ["#tag", ...]
        imageFile,                 // the chosen file (or null)
        imageURL: imageFile ? "" : imageUrl.trim(),
      });

      // Only clear the form when the post really saved
      if (saved) {
        setCaption("");
        setCategory("Nature");
        setHashTags("");
        setImageUrl("");
        setFileError("");
        clearImage();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <h3>Create New Post</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Image: </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
          />
          {fileError && <p style={{ color: "red" }}>{fileError}</p>}
        </div>

        {preview && (
          <div>
            <img
              src={preview}
              alt="Selected preview"
              style={{ width: 200, height: 200, objectFit: "cover", display: "block" }}
            />
            <button type="button" onClick={clearImage}>
              Remove image
            </button>
          </div>
        )}

        {!imageFile && (
          <div>
            <label>Or image URL (optional): </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        )}

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
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
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

        <button type="submit" disabled={isSubmitting || !currentUser}>
          {isSubmitting ? "Publishing..." : "Publish Post"}
        </button>
        {!currentUser && <p>Log in to publish a post.</p>}
      </form>
    </section>
  );
}

export default CreatePostForm;