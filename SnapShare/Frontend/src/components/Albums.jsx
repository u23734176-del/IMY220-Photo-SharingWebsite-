// src/components/Album.jsx

import { useState } from 'react';

function Album({ album, userPosts = [], onUpdateAlbum, onDeleteAlbum }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(album.title);
  const [selectedPostIds, setSelectedPostIds] = useState(album.postIds || []);

  const handleTogglePost = (postId) => {
    setSelectedPostIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onUpdateAlbum({
      ...album,
      title: title.trim(),
      postIds: selectedPostIds
    });
    setIsEditing(false);
  };

  // Resolve post objects associated with this album
  const albumPosts = userPosts.filter((post) => album.postIds.includes(post.id));

  return (
    <article>
      {isEditing ? (
        <form onSubmit={handleSave}>
          <div>
            <label>Album Title: </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <h4>Add or Remove Posts:</h4>
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
              <p>No available posts to add.</p>
            )}
          </div>

          <button type="submit">Save Album</button>
          <button type="button" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <>
          <h3>{album.title}</h3>
          <p><strong>Total Posts:</strong> {albumPosts.length}</p>

          <div>
            <button type="button" onClick={() => setIsEditing(true)}>
              Edit Album
            </button>
            <button type="button" onClick={() => onDeleteAlbum(album.id)}>
              Delete Album
            </button>
          </div>

          <section>
            {albumPosts.length > 0 ? (
              <ul>
                {albumPosts.map((post) => (
                  <li key={post.id}>
                    <div>
                      <img src={post.image} alt={post.caption} />
                    </div>
                    <p><strong>Caption:</strong> {post.caption}</p>
                    <p><strong>Category:</strong> {post.category}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>This album is empty.</p>
            )}
          </section>
        </>
      )}
    </article>
  );
}

export default Album;