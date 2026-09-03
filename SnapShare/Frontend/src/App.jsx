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

  return (

    <BrowserRouter>
    
      <Navigation/>

        <Routes>
          <Route path="/" element={<LandingPage/>}/>
          <Route path="/home" element={<HomePage username ={username}/>}/>
          <Route path="/themeOfDay" element ={<ThemeOfDay/>}/>
          <Route path = "/posts" element = {<Posts/>}/>
          <Route path = "/friends" element = {<Friends/>}/>
          <Route path = "/albums" element = {<Albums/>}/>

           <Route path="/login" element={<Login username ={username} setUsername = {setUsername}/>} />
           <Route path="/signUp" element={<SignUp />} />
        </Routes>

    </BrowserRouter>
  )
}

export default App;
