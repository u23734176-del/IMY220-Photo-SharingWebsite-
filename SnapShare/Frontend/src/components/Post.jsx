import { useState } from "react";

function Post({post}){
    const [likesCount , setLikesCount] = useState(post.likes);
    const [isLiked, setIsLiked] = useState(false);
    const [commentsList, setCommentsList] = useState(post.comments || []);
    const [commentInput, setCommentInput] = useState("");

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
    return (
    <article>
      {/* Author Header, Category, & Timestamp */}
      <div>
        <p><strong>Author:</strong> {post.author}</p>
        <p><strong>Category:</strong> {post.category}</p>
        <p><strong>Posted on:</strong> {post.createdAt}</p>
      </div>

      {/* Post Image */}
      <div>
        <img src={post.image} alt={post.caption} />
      </div>

      {/* Post Caption */}
      <div>
        <p><strong>Caption:</strong> {post.caption}</p>
      </div>

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

export default Post;