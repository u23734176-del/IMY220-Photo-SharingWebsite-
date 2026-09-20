// src/components/Post.jsx

// src/components/Post.jsx

import { useState } from "react";
import PostEditForm from "./PostEditForm";
import PostActions from "./PostActions";
import PostPreview from "./PostPreview";

function Post({ post, onUpdatePost, isEditable = false }) {
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [commentsList, setCommentsList] = useState(post.comments || []);
  const [showPreview, setShowPreview] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(post.caption || "");
  const [category, setCategory] = useState(post.category || "");

  const handleLikeToggle = () => {
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    setIsLiked(!isLiked);
  };

  const handleAddComment = (newComment) => {
    setCommentsList((prev) => [...prev, newComment]);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (onUpdatePost) {
      onUpdatePost({ ...post, caption, category });
    }
    setIsEditing(false);
  };

  return (
    <article style={{ border: "1px solid #ddd", margin: "10px", padding: "10px" }}>
      {/* Clickable Post Trigger */}
      <button 
        type="button" 
        onClick={() => setShowPreview(true)} 
        style={{ background: "none", border: "none", textAlign: "left", cursor: "pointer", width: "100%" }}
      >
        <div>
          <img src={post.image} alt={caption} style={{ maxWidth: "100%" }} />
        </div>
        <div>
          <p><strong>Caption:</strong> {caption}</p>
          <p><strong>Author:</strong> {post.author}</p>
          <p><strong>Category:</strong> {category}</p>
          <p><strong>Posted on:</strong> {post.createdAt}</p>
        </div>
      </button>

      {/* Edit Mode Controls */}
      {isEditing ? (
        <PostEditForm
          caption={caption}
          category={category}
          onCaptionChange={setCaption}
          onCategoryChange={setCategory}
          onSave={handleSaveEdit}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        (isEditable || onUpdatePost) && (
          <div>
            <button type="button" onClick={() => setIsEditing(true)}>
              Edit Post
            </button>
          </div>
        )
      )}

      {/* Likes Bar */}
      <PostActions 
        likesCount={likesCount} 
        isLiked={isLiked} 
        onLikeToggle={handleLikeToggle} 
      />

      {/* Comment Count Indicator Only */}
      <div>
        <p><strong>Comments:</strong> {commentsList.length}</p>
      </div>

      {/* Modal / Preview Display */}
      {showPreview && (
        <PostPreview 
          post={{ ...post, caption, category }} 
          commentsList={commentsList} 
          onAddComment={handleAddComment} 
          onClose={() => setShowPreview(false)} 
        />
      )}
    </article>
  );
}

export default Post;