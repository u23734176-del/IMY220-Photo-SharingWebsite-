// src/Pages/FriendsPage.jsx
import FriendsComponent from '../components/FriendsComponent';
import UserSearchSection from '../components/UserSearchSection';

// FriendsComponent now loads friends, handles accept/decline and unfriend itself,
// so this page only needs to hand it the logged-in username.
function Friends({ username, friendsList = [] }) {
  return (
    <main>
      <h2>Friends & Community ({username || "Guest"})</h2>

      {/* Friends list + pending requests */}
      <FriendsComponent username={username} friendsList={friendsList} />

      <hr />

      {/* Community search + Add Friend */}
      <UserSearchSection username={username} />
    </main>
  );
}

export default Friends;