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
  const [users] = useState([
    {
      id: 1,
      username: "tadiwanashe",
      firstname: "Tadiwanashe",
      surname: "Chigeza",
      email: "tadiwanashe@example.com"
    },
    {
      id: 2,
      username: "john_doe",
      firstname: "John",
      surname: "Doe",
      email: "john@example.com"
    },
    {
      id: 3,
      username: "sarah_c",
      firstname: "Sarah",
      surname: "Connor",
      email: "sarah@example.com"
    },
    {
      id: 4,
      username: "alex_smith",
      firstname: "Alex",
      surname: "Smith",
      email: "alex@example.com"
    }
  ]);

  // Central dummy friends list data
  const [friendsList, setFriendsList] = useState([
    { id: 1, name: "john_doe", status: "Online" },
    { id: 2, name: "sarah_c", status: "Offline" },
    { id: 3, name: "alex_smith", status: "Online" }
  ]);

  // Dummy posts data
  const [posts, setPosts] = useState([
    {
      id: 1,
      image: "../assets/logo.png",
      caption: "Exploring new places!",
      author: "john_doe",
      category: "Travel",
      createdAt: "2026-09-03 10:15",
      likes: 12,
      comments: ["Amazing shot!", "Hope you had fun!"]
    },
    {
      id: 2,
      image: "../assets/logo.png",
      caption: "Building a React app.",
      author: "tadiwanashe",
      category: "Technology",
      createdAt: "2026-09-03 14:30",
      likes: 25,
      comments: ["Looks clean!"]
    },
    {
      id: 3,
      image: "../assets/logo.png",
      caption: "Morning coffee and sunset vibes.",
      author: "sarah_c",
      category: "Nature",
      createdAt: "2026-09-02 08:00",
      likes: 45,
      comments: ["So peaceful", "Where is this?"]
    },
    {
      id: 4,
      image: "../assets/logo.png",
      caption: "New fashion style unlocked.",
      author: "alex_smith",
      category: "Fashion",
      createdAt: "2026-09-01 18:20",
      likes: 8,
      comments: ["Awesome fit!"]
    }
  ]);

  return (
    <BrowserRouter>
      <Navigation />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/themeOfDay" element={<ThemeOfDay />} />
        
        <Route path="/home" element={<HomePage username={username} posts={posts} />}/>
        <Route path="/profile" element={ <ProfilePage username={username} posts={posts} users={users} friendsList={friendsList} setFriendsList={setFriendsList} />} />

        <Route path="/posts" element={<Posts username={username} posts={posts} setPosts={setPosts}/>} />

        <Route path="/friends" element={ <Friends friendsList={friendsList} setFriendsList={setFriendsList} />} />
  
        <Route path="/albums" element={<Albums />} />

        <Route 
          path="/login" 
          element={<Login username={username} setUsername={setUsername} />} 
        />
        <Route 
          path="/signUp" 
          element={<SignUp setUsername={setUsername} />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;