
// src/Pages/FriendsPage.jsx

import FriendsComponent from '../components/FriendsComponent';
import UserSearchSection from '../components/UserSearchSection';

function Friends({ friendsList = [], users = [] }) {
  return (
    <main>
      <h2>Friends & Community</h2>

      {/* Your Setup Friends Component */}
      <FriendsComponent friendsList={friendsList} />

      <hr />

      {/* Search Bar & User Previews */}
      <UserSearchSection users={users} />
    </main>
  );
}

export default Friends;