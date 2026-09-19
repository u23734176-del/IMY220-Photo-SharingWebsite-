// componenet for putting the header in the profile page
function ProfileHeader({user}){
    return(
        <>
        <div>
            <img src="../assets/profile-avatar.png" alt="Profile A"/>
        </div>
            <section>
                <h2>Profile Details :</h2>
                <p><strong>User ID:</strong> { user.ID || "N/A"}</p>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Pronouns:</strong> {user.pronouns}</p>
                <p><strong>Bio:</strong> {user.bio}</p>
            </section>
        </>
    )
}
export default ProfileHeader;