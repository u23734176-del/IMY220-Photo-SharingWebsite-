// src/Pages/AlbumsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Album from '../components/Albums';
import CreateAlbumForm from '../components/CreateAlbumForm';

const JSON_HEADERS = { "Content-Type": "application/json" };

const getPostId = (post) => {
  if (!post) return null;
  if (typeof post._id === 'object' && post._id?.$oid) return post._id.$oid;
  return post._id || post.id;
};

// Server album  ->  the shape Albums.jsx / CreateAlbumForm.jsx expect
// (server uses _id + postsIDs, the components use id + postIds)
const normalizeAlbum = (album, author) => ({
  ...album,
  id: String(album._id || album.id),
  author,
  title: album.title || "",
  postIds: (album.postsIDs || album.postIds || []).map(String),
});

function AlbumsPage({ username, posts = [], setPosts }) {
  const navigate = useNavigate();

  // Albums are stored with the username they were loaded for,
  // so switching users never shows the previous user's albums
  const [loaded, setLoaded] = useState({ forUser: "", albums: [], error: "" });
  const [actionError, setActionError] = useState("");

  const isCurrent = !!username && loaded.forUser === username;
  const albums = isCurrent ? loaded.albums : [];
  const isLoading = !!username && !isCurrent;
  const error = actionError || (isCurrent ? loaded.error : "");

  const updateAlbums = (updater) =>
    setLoaded((prev) => ({ ...prev, albums: updater(prev.albums) }));

  // ---------- LOAD ALBUMS + THIS USER'S POSTS ----------
  // Posts are fetched here too, so the page works straight after a refresh
  useEffect(() => {
    if (!username) return undefined;

    let cancelled = false;

    async function loadData() {
      const name = encodeURIComponent(username);

      try {
        const [albumsRes, postsRes] = await Promise.all([
          fetch(`/api/albums/${name}`),
          fetch(`/api/posts/user/${name}`),
        ]);

        const albumsData = await albumsRes.json().catch(() => ({}));
        if (!albumsRes.ok) throw new Error(albumsData.error || "Could not load albums.");

        if (postsRes.ok && setPosts) {
          const postsData = await postsRes.json().catch(() => ({}));
          const fromServer = Array.isArray(postsData) ? postsData : postsData.posts || [];

          if (!cancelled) {
            setPosts((prev) => {
              const uniqueMap = new Map();
              [...fromServer, ...prev].forEach((p) => {
                const id = getPostId(p);
                if (id && !uniqueMap.has(id)) uniqueMap.set(id, p);
              });
              return Array.from(uniqueMap.values());
            });
          }
        }

        if (!cancelled) {
          setLoaded({
            forUser: username,
            albums: (albumsData.albums || []).map((a) => normalizeAlbum(a, username)),
            error: "",
          });
        }
      } catch (err) {
        console.error("Failed to load albums:", err);
        if (!cancelled) setLoaded({ forUser: username, albums: [], error: err.message });
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [username, setPosts]);

  // ---------- CREATE ----------
  const handleCreateAlbum = async (newAlbum) => {
    setActionError("");
    try {
      const response = await fetch("/api/albums", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
          username,
          title: newAlbum.title,
          description: newAlbum.description || "",
          postsIDs: (newAlbum.postIds || []).map(String),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not create album.");

      updateAlbums((prev) => [normalizeAlbum(data.album, username), ...prev]);
    } catch (err) {
      console.error("Failed to create album:", err);
      setActionError(err.message);
    }
  };

  // ---------- UPDATE ----------
  const handleUpdateAlbum = async (updatedAlbum) => {
    setActionError("");
    try {
      const response = await fetch(`/api/albums/${updatedAlbum.id}`, {
        method: "PUT",
        headers: JSON_HEADERS,
        body: JSON.stringify({
          username,
          title: updatedAlbum.title,
          postsIDs: (updatedAlbum.postIds || []).map(String),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not update album.");

      const saved = normalizeAlbum(data.album, username);
      updateAlbums((prev) => prev.map((a) => (a.id === saved.id ? saved : a)));
    } catch (err) {
      console.error("Failed to update album:", err);
      setActionError(err.message);
    }
  };

  // ---------- DELETE ----------
  const handleDeleteAlbum = async (albumId) => {
    setActionError("");
    try {
      const response = await fetch(`/api/albums/${albumId}`, {
        method: "DELETE",
        headers: JSON_HEADERS,
        body: JSON.stringify({ username }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not delete album.");

      updateAlbums((prev) => prev.filter((a) => a.id !== albumId));
    } catch (err) {
      console.error("Failed to delete album:", err);
      setActionError(err.message);
    }
  };

  // Not logged in
  if (!username) {
    return (
      <main>
        <h2>Albums</h2>
        <p>You are not logged in. Please log in to view and create albums.</p>
        <button type="button" onClick={() => navigate("/login")}>
          Go to Login
        </button>
        <button type="button" onClick={() => navigate("/signUp")}>
          Create an Account
        </button>
      </main>
    );
  }

  // This user's posts, with a string `id` so the album components can match them
  const userPosts = posts
    .filter((post) => post.author === username)
    .map((post) => ({ ...post, id: String(getPostId(post)) }));

  return (
    <main>
      <h2>{username}'s Albums</h2>

      {/* Create New Album Section */}
      <CreateAlbumForm
        userPosts={userPosts}
        onCreateAlbum={handleCreateAlbum}
        currentUser={username}
      />
      <hr />

      {error && <p style={{ color: "red" }}>{error}</p>}
      {isLoading && <p>Loading albums...</p>}

      {/* List of User Albums */}
      <section>
        <h3>Your Collections</h3>
        {!isLoading && albums.length > 0 ? (
          albums.map((albumItem) => (
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
          !isLoading && <p>No albums created yet.</p>
        )}
      </section>
    </main>
  );
}

export default AlbumsPage;