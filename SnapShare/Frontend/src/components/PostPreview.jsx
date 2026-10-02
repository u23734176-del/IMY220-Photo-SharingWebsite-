// src/components/PostPreview.jsx
import PostCommentSection from "./PostCommentSection";

const IMAGE_STYLE = { width: 300, height: 300, objectFit: "cover", display: "block" };

function PostPreview({ post, commentsList = [], onAddComment, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
      }}
    >
      <section
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", color: "#000", padding: "16px", borderRadius: "8px",
          maxWidth: "500px", width: "90%", maxHeight: "90vh", overflowY: "auto"
        }}
      >
        <div style={{ textAlign: "right" }}>
          <button type="button" onClick={onClose}>X</button>
        </div>

        <div>
          <img src={post.image || post.imageURL} alt={post.caption} style={IMAGE_STYLE} />
        </div>

        <div>
          <p><strong>Caption:</strong> {post.caption}</p>
          <p><strong>Author:</strong> {post.author}</p>
          <p><strong>Category:</strong> {post.category}</p>
          <p>
            <strong>Posted on:</strong>{" "}
            {post.createdAt ? new Date(post.createdAt).toLocaleString() : "Just now"}
          </p>
          <p><strong>Likes:</strong> {post.likes || 0}</p>
        </div>

        <PostCommentSection comments={commentsList} onAddComment={onAddComment} />

        <div>
          <button type="button" onClick={onClose}>Close Preview</button>
        </div>
      </section>
    </div>
  );
}

export default PostPreview;