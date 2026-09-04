import { useState } from "react";


function UsersPosts({ post, onUpdatePost }) {
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [commentsList, setCommentsList] = useState(post.comments || []);
  const [commentInput, setCommentInput] = useState("");

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(post.caption || "");
  const [category, setCategory] = useState(post.category || "");

  // Toggle Like functionality
  const handleLikeToggle = () => {
    if (isLiked) {
      setLikesCount(likesCount - 1);
      setIsLiked(false);
    } else {
      setLikesCount(likesCount + 1);
      setIsLiked(true);
    }
  };

  // Add Comment functionality
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setCommentsList([...commentsList, commentInput.trim()]);
    setCommentInput("");
  };

  // Save Edit functionality
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (onUpdatePost) {
      onUpdatePost({
        ...post,
        caption,
        category
      });
    }
    setIsEditing(false);
  };

  return (
    <article>
      {/* Post Image */}
      <div>
        <img src={post.image} alt={post.caption} />
      </div>

      {/* Inline Edit Mode Form or Normal Display */}
      {isEditing ? (
        <form onSubmit={handleSaveEdit}>
          <div>
            <label>Caption: </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
          <div>
            <label>Category: </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      ) : (
        <>
          {/* Post Caption */}
          <div>
            <p><strong>Caption:</strong> {caption}</p>
          </div>

          {/* Author Header, Category, & Timestamp */}
          <div>
            <p><strong>Author:</strong> {post.author}</p>
            <p><strong>Category:</strong> {category}</p>
            <p><strong>Posted on:</strong> {post.createdAt}</p>
          </div>

          {/* Edit Post Button */}
          <div>
            <button type="button" onClick={() => setIsEditing(true)}>
              Edit Post
            </button>
          </div>
        </>
      )}

      {/* Likes Section */}
      <div>
        <button type="button" onClick={handleLikeToggle}>
          {isLiked ? "Unlike" : "Like"}
        </button>
        <span> {likesCount} Likes</span>
      </div>

      {/* Comment Section */}
      <section>
        <h4>Comments ({commentsList.length})</h4>

        {/* Display Comments */}
        <ul>
          {commentsList.map((comment, index) => (
            <li key={index}>{comment}</li>
          ))}
        </ul>

        {/* Add Comment Input */}
        <form onSubmit={handleAddComment}>
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Write a comment..."
          />
          <button type="submit">Post</button>
        </form>
      </section>
    </article>
  );
}

export default UsersPosts;