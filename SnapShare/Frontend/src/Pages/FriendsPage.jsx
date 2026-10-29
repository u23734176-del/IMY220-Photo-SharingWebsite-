// src/Pages/FriendsPage.jsx
import FriendsComponent from '../components/FriendsComponent';
import UserSearchSection from '../components/UserSearchSection';

// FriendsComponent now loads friends, handles accept/decline and unfriend itself,
// so this page only needs to hand it the logged-in username.
function Friends({ username, friendsList = [] }) {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6">
      <h2 className="rounded-md bg-brand-panel py-4 text-center">
        Friends &amp; Community ({username || "Guest"})
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Friends list + pending requests */}
        <section className="rounded-md bg-brand-panel p-4">
          <FriendsComponent username={username} friendsList={friendsList} />
        </section>

        {/* Community search + Add Friend */}
        <section className="rounded-md bg-brand-panel p-4">
          <UserSearchSection username={username} />
        </section>
      </div>
    </main>
  );
}

export default Friends;