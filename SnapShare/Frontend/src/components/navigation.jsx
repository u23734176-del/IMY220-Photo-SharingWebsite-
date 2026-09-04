import { Link } from "react-router-dom"

function Navigation(){
    return(
        <nav>
            <Link to="/themeOfDay">Theme of the Day</Link>
            <br/>
            <Link to="/home">Home</Link>
            <br/>
            <Link to ="/posts">Posts</Link>
            <br/>
            <Link to ="/friends">Friends</Link>
            <br/>
            <Link to ="/albums">Albums</Link>
        </nav>
    )
}

export default Navigation;