// src/components/CreateAlbumForm.jsx

import { useState } from 'react';

function CreateAlbumForm({ userPosts = [], onCreateAlbum, currentUser }) {
  const [title, setTitle] = useState("");
  const [selectedPostIds, setSelectedPostIds] = useState([]);

  const handleTogglePost = (postId) => {
    setSelectedPostIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newAlbum = {
      id: Date.now(),
      title: title.trim(),
      author: currentUser,
      postIds: selectedPostIds
    };

    onCreateAlbum(newAlbum);
    setTitle("");
    setSelectedPostIds([]);
  };

  return (
    <section>
      <h3>Create New Album</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Album Title: </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter album title..."
            required
          />
        </div>

        <div>
          <h4>Select Posts to Add:</h4>
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <div key={post.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedPostIds.includes(post.id)}
                    onChange={() => handleTogglePost(post.id)}
                  />
                  {post.caption} ({post.category})
                </label>
              </div>
            ))
          ) : (
            <p>No user posts available to create an album.</p>
          )}
        </div>

        <button type="submit">Create Album</button>
      </form>
    </section>
  );
}

export default CreateAlbumForm;