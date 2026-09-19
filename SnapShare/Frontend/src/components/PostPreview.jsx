//Compoenont Preview the posts
// src/components/PostPreview.jsx

import PostCommentSection from "./PostCommentSection";

function PostPreview({ post, commentsList, onAddComment, onClose }) {
  return (
    <section>
      <hr />
      <div>
        <button type="button" onClick={onClose}>
           X
        </button>
      </div>

      <div>
        <img src={post.image} alt={post.caption} />
      </div>

      <div>
        <p><strong>Caption:</strong> {post.caption}</p>
        <p><strong>Author:</strong> {post.author}</p>
        <p><strong>Category:</strong> {post.category}</p>
        <p><strong>Posted on:</strong> {post.createdAt}</p>
      </div>

      <PostCommentSection 
        comments={commentsList} 
        onAddComment={onAddComment} 
      />

      <div>
        <button type="button" onClick={onClose}>
          Close Preview
        </button>
      </div>
      <hr />
    </section>
  );
}

export default PostPreview;