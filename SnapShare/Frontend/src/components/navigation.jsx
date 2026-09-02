import { Link } from "react-router-dom"

function Navigation(){
    return(
        <nav>
            <Link to="/themeOfDay">Theme of the Day</Link>
            <Link to="/home">Home</Link>
            <Link to ="/posts">Posts</Link>
            <Link to ="/friends">Friends</Link>
            <Link to ="/albums">Albums</Link>
        </nav>
    )
}

export default Navigation;