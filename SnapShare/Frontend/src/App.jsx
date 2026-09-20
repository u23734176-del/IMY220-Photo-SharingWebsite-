// pages
import LandingPage from './Pages/LandingPage';
import HomePage from './Pages/HomePage';
import ThemeOfDay from './Pages/ThemeOfDay';
import Posts from './Pages/PostPage';
import Albums from './Pages/AlbumsPage';
import Friends from './Pages/FriendsPage';
import ProfilePage from './Pages/ProfilePage';

// components
import Navigation from './components/navigation';
import Login from './components/Login';
import SignUp from './components/SignUp';

// styling
import './App.css';

// imports for use
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react';

function App() {
  const [username, setUsername] = useState("");

  // Omitted setUsers since user state is currently static dummy data
  const [users] = useState([ ]);

  // Central dummy friends list data
  const [friendsList, setFriendsList] = useState([]);

  // Dummy posts data
  const [posts, setPosts] = useState([]);

  return (
    <BrowserRouter>
      <Navigation />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/themeOfDay" element={<ThemeOfDay />} />
        <Route path="/home" element={<HomePage username={username} posts={posts} />} />

        {/* Supports both /profile (Guest) and /profile/1 (Specific User) */}
        <Route 
          path="/profile" 
          element={<ProfilePage users={users} friendsList={friendsList} />} 
        />
        <Route 
          path="/profile/:id" 
          element={<ProfilePage users={users} friendsList={friendsList} />} 
        />
        
        <Route path="/posts" element={<Posts username={username} posts={posts} setPosts={setPosts} />} />
        <Route path="/posts/:id" element={<Posts username={username} posts={posts} setPosts={setPosts} />} />
        <Route path="/friends" element={<Friends friendsList={friendsList} setFriendsList={setFriendsList} users={users} />} />
        <Route path="/albums" element={<Albums username={username} posts={posts} />} />

        <Route path="/login" element={<Login username={username} setUsername={setUsername} />} />
        <Route path="/signUp" element={<SignUp setUsername={setUsername} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;