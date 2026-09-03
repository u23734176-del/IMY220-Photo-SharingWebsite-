//pages
import LandingPage from './Pages/LandingPage'
import HomePage from './Pages/HomePage';
import ThemeOfDay from './Pages/ThemeOfDay';
import Posts from './Pages/PostPage';
import Albums from './Pages/AlbumsPage'
import Friends from './Pages/FriendsPage'
//compononets
import Navigation from './components/navigation';
import Login from './components/Login';
import SignUp from './components/SignUp';

//styling
import './App.css'
//imports for use
import { BrowserRouter , Routes , Route} from "react-router-dom";
import { useState } from 'react';

function App() {
  
    const [username , setUsername] = useState("");

    //Dummy Values
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
    }
  ]);

  return (

    <BrowserRouter>
    
      <Navigation/>

        <Routes>
          <Route path="/" element={<LandingPage/>}/>
          <Route path="/themeOfDay" element ={<ThemeOfDay/>}/>

          <Route path="/home" element={<HomePage username ={username} posts = {posts}/>}/>

          <Route path = "/posts" element = {<Posts posts = {posts} setPosts = {setPosts}/>} />

          <Route path = "/friends" element = {<Friends/>}/>
          <Route path = "/albums" element = {<Albums/>}/>

           <Route path="/login" element={<Login username ={username} setUsername = {setUsername}/>} />
           <Route path="/signUp" element={<SignUp setUsername = {setUsername}/>} />
        </Routes>

    </BrowserRouter>
  )
}

export default App;
