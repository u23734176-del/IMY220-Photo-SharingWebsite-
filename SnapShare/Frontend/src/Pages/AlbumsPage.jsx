// src/Pages/AlbumsPage.jsx

import { useState } from 'react';
import Album from '../components/Albums';
import CreateAlbumForm from '../components/CreateAlbumForm';

function AlbumsPage({ username, posts = [] }) {
  const activeAuthor = username  || " Guest";

  const [albums, setAlbums] = useState([ ]);

  // Filter posts created by the current user
  const userPosts = posts.filter((post) => post.author === activeAuthor);

  // Filter albums belonging to current user
  const userAlbums = albums.filter((album) => album.author === activeAuthor);

  const handleCreateAlbum = (newAlbum) => {
    setAlbums((prev) => [newAlbum, ...prev]);
  };

  const handleUpdateAlbum = (updatedAlbum) => {
    setAlbums((prev) =>
      prev.map((album) => (album.id === updatedAlbum.id ? updatedAlbum : album))
    );
  };

  const handleDeleteAlbum = (albumId) => {
    setAlbums((prev) => prev.filter((album) => album.id !== albumId));
  };

  return (
    <main>
      <h2>{activeAuthor}'s Albums</h2>

      {/* Create New Album Section */}
      <CreateAlbumForm
        userPosts={userPosts}
        onCreateAlbum={handleCreateAlbum}
        currentUser={activeAuthor}
      />

      <hr />

      {/* List of User Albums */}
      <section>
        <h3>Your Collections</h3>
        {userAlbums.length > 0 ? (
          userAlbums.map((albumItem) => (
            <div key={albumItem.id}>
              <Album
                album={albumItem}
                userPosts={userPosts}
                onUpdateAlbum={handleUpdateAlbum}
                onDeleteAlbum={handleDeleteAlbum}
              />
              <hr />
            </div>
          ))
        ) : (
          <p>No albums created yet.</p>
        )}
      </section>
    </main>
  );
}

export default AlbumsPage;