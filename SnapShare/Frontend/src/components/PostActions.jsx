// Component that allows the User to like and comment Different posts
function PostActions({ likesCount , isLiked , onLikeToggle}){
    return(
            <div>
                <button type="button" onClick={onLikeToggle}>
                    {isLiked ? "Unlike" : "Like"}
                </button>
                <p><span>{likesCount} Likes</span></p>
            </div>
    );
}
export default PostActions;

