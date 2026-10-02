// src/components/PostCommentSection.jsx
import { useState } from 'react';

// Comments can be plain strings (old data) or { username, comment, createdAt } objects
const normalizeComment = (c) => {
  if (typeof c === "string") return { name: "", text: c, date: "" };
  return {
    name: String(c?.username || c?.author || ""),
    text: String(c?.comment || c?.text || c?.content || ""),
    date: c?.createdAt ? new Date(c.createdAt).toLocaleString() : ""
  };
};

function PostCommentSection({ comments = [], onAddComment }) {
  const [commentInput, setCommentInput] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(commentInput.trim());
    setCommentInput("");
  };

  return (
    <div>
      <section>
        <h4>Comments ({comments.length})</h4>
        <ul>
          {comments.map((c, index) => {
            const { name, text, date } = normalizeComment(c);
            return (
              <li key={(c && c._id) || index}>
                {name && <strong>{name}: </strong>}
                {text}
                {date && <small> ({date})</small>}
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Write a comment..."
          />
          <button type="submit">Post Comment</button>
        </form>
      </section>
    </div>
  );
}

export default PostCommentSection;