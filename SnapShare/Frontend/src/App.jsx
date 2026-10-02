// App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import LandingPage from './Pages/LandingPage';
import HomePage from './Pages/HomePage';
import ThemeOfDay from './Pages/ThemeOfDay';
import Posts from './Pages/PostPage';
import Albums from './Pages/AlbumsPage';
import Friends from './Pages/FriendsPage';
import ProfilePage from './Pages/ProfilePage';

// Components
import Navigation from './components/navigation';
import Login from './components/Login';
import SignUp from './components/SignUp';

// Styling
import './App.css';

const USERNAME_KEY = "snapshare_username";

const getPostId = (post) => {
  if (!post) return null;
  if (typeof post._id === 'object' && post._id?.$oid) return post._id.$oid;
  return post._id || post.id;
};

// Read the saved session (if any). Safe if storage is blocked.
function loadStoredUsername() {
  try {
    return localStorage.getItem(USERNAME_KEY) || "";
  } catch {
    return "";
  }
}

// Fresh server posts win over what is already in state
function mergePosts(fresh, prev) {
  const uniqueMap = new Map();
  [...fresh, ...prev].forEach((item) => {
    const id = getPostId(item);
    if (id && !uniqueMap.has(id)) uniqueMap.set(id, item);
  });
  return Array.from(uniqueMap.values());
}

function App() {
  // Start from the saved session so a refresh keeps the user logged in
  const [username, setUsername] = useState(loadStoredUsername);
  const [users, setUsers] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [posts, setPosts] = useState([]);

  // Keep storage in sync: logging in saves, logging out ("") clears
  useEffect(() => {
    try {
      if (username) {
        localStorage.setItem(USERNAME_KEY, username);
      } else {
        localStorage.removeItem(USERNAME_KEY);
      }
    } catch {
      // storage unavailable: the session just won't survive a refresh
    }
  }, [username]);

  // On startup: confirm the saved user still exists, and preload the feed
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      const stored = loadStoredUsername();

      if (stored) {
        try {
          const res = await fetch(`/api/profile/${encodeURIComponent(stored)}`);
          // Account was deleted elsewhere: drop the stale session
          if (res.status === 404 && !cancelled) {
            setUsername((current) => (current === stored ? "" : current));
          }
        } catch {
          // Server unreachable: keep the session
        }
      }

      try {
        const res = await fetch("/api/posts");
        if (res.ok) {
          const data = await res.json();
          const loaded = Array.isArray(data) ? data : data.posts || [];
          if (!cancelled) setPosts((prev) => mergePosts(loaded, prev));
        }
      } catch {
        // Feed will load when the Home page fetches it
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  // Central Post Update Handler (Likes, Comments, Edits)
  const handleUpdatePost = (updatedPost) => {
    const targetId = getPostId(updatedPost);
    setPosts((prevPosts) =>
      prevPosts.map((post) => (getPostId(post) === targetId ? updatedPost : post))
    );
  };

  // Central Handler to Add New Post
  const handleAddPost = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  return (
    <BrowserRouter>
      <Navigation username={username} />

      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={<Login username={username} setUsername={setUsername} />}
        />

        <Route
          path="/signUp"
          element={<SignUp setUsername={setUsername} />}
        />

        {/* Home Feed */}
        <Route
          path="/home"
          element={
            <HomePage
              username={username}
              posts={posts}
              setPosts={setPosts}
              onUpdatePost={handleUpdatePost}
            />
          }
        />

        <Route
          path="/themeOfDay"
          element={<ThemeOfDay username={username} posts={posts} />}
        />

        {/* User Profiles */}
        <Route
          path="/profile"
          element={
            <ProfilePage
              username={username}
              setUsername={setUsername}
              friendsList={friendsList}
              setFriendsList={setFriendsList}
              posts={posts}
            />
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProfilePage
              username={username}
              setUsername={setUsername}
              friendsList={friendsList}
              setFriendsList={setFriendsList}
              posts={posts}
            />
          }
        />

        {/* User Posts Page */}
        <Route
          path="/posts"
          element={
            <Posts
              username={username}
              posts={posts}
              setPosts={setPosts}
              onAddPost={handleAddPost}
              onUpdatePost={handleUpdatePost}
            />
          }
        />
        <Route
          path="/posts/:id"
          element={
            <Posts
              username={username}
              posts={posts}
              setPosts={setPosts}
              onAddPost={handleAddPost}
              onUpdatePost={handleUpdatePost}
            />
          }
        />

        {/* Friends Page */}
        <Route
          path="/friends"
          element={
            <Friends
              username={username}
              friendsList={friendsList}
              setFriendsList={setFriendsList}
              users={users}
              setUsers={setUsers}
            />
          }
        />

        {/* Albums Page */}
        <Route
          path="/albums"
          element={<Albums username={username} posts={posts} setPosts={setPosts} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;