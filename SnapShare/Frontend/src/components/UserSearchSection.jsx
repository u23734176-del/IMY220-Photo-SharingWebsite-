// src/components/UserSearchSection.jsx
import { useState, useEffect } from 'react';
import ProfilePreview from './ProfilePreview';
import AdminDeleteUserButton from './AdminDeleteUserButton';

function UserSearchSection({ username }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [result, setResult] = useState({ query: "", users: [], error: "" });
  const [messages, setMessages] = useState({});

  const query = searchQuery.trim();

  // Debounced search; state is only set inside the timer callback
  useEffect(() => {
    if (!query) return undefined;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Search failed.");
        if (!cancelled) setResult({ query, users: data.users || [], error: "" });
      } catch (err) {
        console.error("User search failed:", err);
        if (!cancelled) setResult({ query, users: [], error: err.message });
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const isCurrent = result.query === query;
  const users = isCurrent ? result.users : [];

  const handleAddFriend = async (user) => {
    const key = String(user._id);
    try {
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderUsername: username, receiverUsername: user.username }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not send request.");
      setMessages((prev) => ({ ...prev, [key]: data.message || "Friend request sent." }));
    } catch (err) {
      setMessages((prev) => ({ ...prev, [key]: err.message }));
    }
  };

  const handleDeleted = (deletedUsername) => {
    setResult((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.username !== deletedUsername),
    }));
  };

  return (
    <section>
      <h3>Search Users</h3>
      <div>
        <input
          type="text"
          placeholder="Search by username or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {query !== "" && (
        <div>
          {!isCurrent ? (
            <p>Searching...</p>
          ) : (
            <>
              <h4>Results ({users.length})</h4>
              {result.error && <p style={{ color: "red" }}>{result.error}</p>}
              {users.length > 0 ? (
                users.map((user) => (
                  <div key={String(user._id)}>
                    <ProfilePreview user={user} />

                    {username && user.username !== username && (
                      <div>
                        <button type="button" onClick={() => handleAddFriend(user)}>
                          Add Friend
                        </button>
                        {messages[String(user._id)] && <span> {messages[String(user._id)]}</span>}
                      </div>
                    )}

                    <AdminDeleteUserButton
                      targetUsername={user.username}
                      currentUser={username}
                      onDeleted={handleDeleted}
                    />
                    <hr />
                  </div>
                ))
              ) : (
                !result.error && <p>No users found matching "{searchQuery}".</p>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default UserSearchSection;