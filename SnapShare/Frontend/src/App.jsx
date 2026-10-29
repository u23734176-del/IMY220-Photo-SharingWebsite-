// U23734176 Tadiwanashe Chigeza
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route , Navigate  } from "react-router-dom";
import { getCookie , setCookie ,deleteCookie } from './utils/cookie';

// Pages
import LandingPage from './Pages/LandingPage';
import HomePage from './Pages/HomePage';
import ThemeOfDay from './Pages/ThemeOfDay';
import Posts from './Pages/PostPage';
import Albums from './Pages/AlbumsPage';
import Friends from './Pages/FriendsPage';
import ProfilePage from './Pages/ProfilePage';

// Components
import Shell from './components/Shell';
import Login from './components/Login';
import SignUp from './components/SignUp';

// Styling
import './App.css';

const SESSION_COOKIE  = "snapshare_username";

const getPostId = (post) => {
  if (!post) return null;
  if (typeof post._id === 'object' && post._id?.$oid) return post._id.$oid;
  return post._id || post.id;
};

// Fresh server posts win over what is already in state
function mergePosts(fresh, prev) {
  const uniqueMap = new Map();
  [...fresh, ...prev].forEach((item) => {
    const id = getPostId(item);
    if (id && !uniqueMap.has(id)) uniqueMap.set(id, item);
  });
  return Array.from(uniqueMap.values());
}
  function Protected({ username, children }) {
     return username ? children : <Navigate to="/" replace />;
}

function App() {
  // Start from the saved session so a refresh keeps the user logged in
  const [username, setUsername] = useState( ()=> getCookie(SESSION_COOKIE) || "" );
  const [users, setUsers] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [posts, setPosts] = useState([]);

  // Keep storage in sync:  uses a Cookie (Clinet-side )
  useEffect(() => {
      if (username) {
        setCookie(SESSION_COOKIE ,username , 7); // 7 days cookie
      } else {
        deleteCookie(SESSION_COOKIE);
      }
  }, [username]);

  // On startup: confirm the saved user still exists, and preload the feed
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      const stored =  getCookie(SESSION_COOKIE);

      if (stored) {
        try {
          const res = await fetch(`/api/profile/${encodeURIComponent(stored)}`);
         
          if (res.status === 404 && !cancelled) {
            setUsername((current) => (current === stored ? "" : current));
            return; //logged out
          }
        } catch {
          // Server unreachable: keep the session
        }

      try {
        const res = await fetch("/api/posts");
        if (res.ok) {
          const data = await res.json();
          const loaded = Array.isArray(data) ? data : data.posts || [];
          if (!cancelled) setPosts((prev) => mergePosts(loaded, prev));
        }
      } catch {
        // Home page will fetch it. 
      }
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

   const guard = (el) => <Protected username={username}>{el}</Protected>;

  return (
    <BrowserRouter>
    
    <Shell username={username}>

      <Routes>
        <Route path="/" element={<LandingPage username={username} />} />
         <Route path="*" element={<Navigate to="/" replace />} />
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
          element={guard(
            <HomePage  username={username} posts={posts} setPosts={setPosts}  onUpdatePost={handleUpdatePost}
            />
          )}
        />

        <Route
          path="/themeOfDay"
          element={ guard(<ThemeOfDay username={username} posts={posts} />)}
        />

        {/* User Profiles */}
        <Route
          path="/profile"
          element={ guard(
            <ProfilePage username={username} setUsername={setUsername} friendsList={friendsList} setFriendsList={setFriendsList}   posts={posts}
            />
          )}
        />
        <Route
          path="/profile/:id"
          element={ guard(
            <ProfilePage username={username} setUsername={setUsername}  friendsList={friendsList} setFriendsList={setFriendsList}   posts={posts}
            />
          )}
        />
        {/* User Posts Page */}
        <Route
          path="/posts"
          element={ guard(
            <Posts username={username}  posts={posts}setPosts={setPosts} onAddPost={handleAddPost} onUpdatePost={handleUpdatePost}
            />
        )}
        />
        <Route
          path="/posts/:id"
          element={ guard(
            <Posts  username={username} posts={posts} setPosts={setPosts} onAddPost={handleAddPost} onUpdatePost={handleUpdatePost}
            />
        )}
        />
        {/* Friends Page */}
        <Route
          path="/friends"
          element={ guard(
            <Friends  username={username} friendsList={friendsList} setFriendsList={setFriendsList} users={users} setUsers={setUsers}
            />
          )}
        />

        {/* Albums Page */}
        <Route
          path="/albums"
          element={ guard(<Albums username={username} posts={posts} setPosts={setPosts} />)}
        />
      </Routes>
      </Shell>
    </BrowserRouter>
  );
}

export default App;