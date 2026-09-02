//pages
import LandingPage from './Pages/LandingPage'
import HomePage from './Pages/HomePage';
import ThemeOfDay from './Pages/ThemeOfDay';
import Posts from './Pages/PostPage';
import Albums from './Pages/AlbumsPage'
import Friends from './Pages/FriendsPage'
//compononets
import Navigation from './components/navigation';

//styling
import './App.css'
//imports for use
    //Router
import { BrowserRouter , Routes , Route} from "react-router-dom";


function App() {
  return (
    <BrowserRouter>
      <Navigation/>
        <Routes>
          <Route path="/" element={<LandingPage/>}/>
          <Route path="/home" element={<HomePage/>}/>
          <Route path="/themeOfDay" element ={<ThemeOfDay/>}/>
          <Route path = "/posts" element = {<Posts/>}/>
          <Route path = "/friends" element = {<Friends/>}/>
          <Route path = "/albums" element = {<Albums/>}/>
        </Routes>
    </BrowserRouter>
  )
}

export default App;
