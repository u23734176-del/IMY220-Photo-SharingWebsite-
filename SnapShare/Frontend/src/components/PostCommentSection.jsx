//  Componetes for the Commit Sections

import { useState } from 'react';

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
          {/* Parentheses added here for implicit JSX return */}
          {comments.map((comment, index) => (
            <li key={index}>{comment}</li>
          ))}
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

