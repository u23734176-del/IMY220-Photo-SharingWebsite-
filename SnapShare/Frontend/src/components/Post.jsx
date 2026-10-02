// src/components/Post.jsx
import { useState } from "react";
import PostEditForm from "./PostEditForm";
import PostActions from "./PostActions";
import PostPreview from "./PostPreview";
import ReportButton from "./ReportButton";
import useIsAdmin from "../hooks/useIsAdmin";

const getPostId = (post) => {
  if (!post) return null;
  if (typeof post._id === 'object' && post._id?.$oid) {
    return post._id.$oid;
  }
  return post._id || post.id;
};

const IMAGE_STYLE = { width: 300, height: 300, objectFit: "cover", display: "block" };

function Post({ post, onUpdatePost, onDeletePost, isEditable = false, currentUser }) {
  const postId = getPostId(post);
  const isAdmin = useIsAdmin(currentUser);

  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(
    !!currentUser && Array.isArray(post.likedBy) && post.likedBy.includes(currentUser)
  );
  const [commentsList, setCommentsList] = useState(post.comments || []);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(post.caption || "");
  const [category, setCategory] = useState(post.category || "");

  // Own posts page (isEditable) or an admin anywhere
  const canDelete = !!currentUser && (isEditable || isAdmin);

  // ---------- LIKE ----------
  const handleLikeToggle = async () => {
    if (!currentUser) {
      setError("Please log in to like posts.");
      return;
    }
    setError("");

    const prevLikes = likesCount;
    const prevLiked = isLiked;
    const action = prevLiked ? "unlike" : "like";

    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(prevLikes - 1, 0) : prevLikes + 1);

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser, action }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not update like.");

      setLikesCount(data.likes);
      setIsLiked(!!data.liked);

      if (onUpdatePost) {
        onUpdatePost({
          ...post,
          likes: data.likes,
          likedBy: data.likedBy,
          caption,
          category,
          comments: commentsList,
        });
      }
    } catch (err) {
      console.error("Failed to update like:", err);
      setLikesCount(prevLikes);
      setIsLiked(prevLiked);
      setError(err.message);
    }
  };

  // ---------- COMMENT ----------
  const handleAddComment = async (newComment) => {
    if (!currentUser) {
      setError("Please log in to comment.");
      return;
    }

    const text =
      typeof newComment === "string"
        ? newComment
        : newComment?.comment || newComment?.text || "";
    if (!text.trim()) return;
    setError("");

    const previousComments = commentsList;
    const optimistic = {
      _id: `temp-${Date.now()}`,
      username: currentUser,
      comment: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setCommentsList([...previousComments, optimistic]);

    try {
      const response = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser, comment: text.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not save comment.");

      const saved = Array.isArray(data.comments) ? data.comments : [...previousComments, optimistic];
      setCommentsList(saved);

      if (onUpdatePost) {
        onUpdatePost({ ...post, comments: saved, likes: likesCount, caption, category });
      }
    } catch (err) {
      console.error("Failed to save comment:", err);
      setCommentsList(previousComments);
      setError(err.message);
    }
  };

  // ---------- EDIT ----------
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser, caption, category }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not update post.");

      if (onUpdatePost) {
        onUpdatePost({ ...post, caption, category, likes: likesCount, comments: commentsList });
      }
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update post:", err);
      setError(err.message);
    }
  };

  // ---------- DELETE ----------
  const handleDelete = async () => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not delete post.");

      if (onDeletePost) onDeletePost(postId);
    } catch (err) {
      console.error("Failed to delete post:", err);
      setError(err.message);
      setIsDeleting(false);
    }
  };

  // ---------- REPORT (admin only, see ReportButton) ----------
  const handleReported = (updated) => {
    if (onUpdatePost) {
      onUpdatePost({
        ...post,
        caption,
        category,
        likes: likesCount,
        comments: commentsList,
        reported: updated?.reported ?? true,
        reportMessage: updated?.reportMessage ?? "",
      });
    }
  };

  return (
    <article style={{ border: "1px solid #ddd", margin: "10px", padding: "10px", width: "fit-content", maxWidth: "100%" }}>
      <button
        type="button"
        onClick={() => setShowPreview(true)}
        style={{ background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: 0 }}
      >
        <div>
          <img
            src={post.image || post.imageURL || "../assets/default-post.png"}
            alt={caption}
            style={IMAGE_STYLE}
          />
        </div>
        <div>
          <p><strong>Caption:</strong> {caption}</p>
          <p><strong>Author:</strong> {post.author}</p>
          <p><strong>Category:</strong> {category}</p>
          <p>
            <strong>Posted on:</strong>{" "}
            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Just now"}
          </p>
        </div>
      </button>

      {/* Edit button: only shown where the page sets isEditable (the Posts page) */}
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
        isEditable && (
          <div>
            <button type="button" onClick={() => setIsEditing(true)}>
              Edit Post
            </button>
          </div>
        )
      )}

      {/* Delete button: own posts page, or admin */}
      {canDelete && (
        <div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            style={{ backgroundColor: "#dc3545", color: "#fff" }}
          >
            {isDeleting ? "Deleting..." : "Delete Post"}
          </button>
        </div>
      )}

      <PostActions
        likesCount={likesCount}
        isLiked={isLiked}
        onLikeToggle={handleLikeToggle}
      />

      <div>
        <p><strong>Comments:</strong> {commentsList.length}</p>
      </div>

      {/* Visible to admins only */}
      <ReportButton
        postId={postId}
        currentUser={currentUser}
        reported={post.reported}
        reportMessage={post.reportMessage}
        onReported={handleReported}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      {showPreview && (
        <PostPreview
          post={{ ...post, caption, category, likes: likesCount }}
          commentsList={commentsList}
          onAddComment={handleAddComment}
          onClose={() => setShowPreview(false)}
        />
      )}
    </article>
  );
}

export default Post;