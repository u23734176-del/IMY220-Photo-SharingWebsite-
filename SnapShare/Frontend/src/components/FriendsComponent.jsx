// src/components/FriendsComponent.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const JSON_HEADERS = { "Content-Type": "application/json" };

const displayName = (u) =>
  [u?.firstname, u?.surname].filter(Boolean).join(" ") || u?.username || "Unknown";

function FriendsComponent({ username, friendsList = [] }) {
  const [reloadKey, setReloadKey] = useState(0);
  const [loaded, setLoaded] = useState({ forUser: "", friends: [], requests: [], error: "" });
  const [actionError, setActionError] = useState("");
  const [busyKey, setBusyKey] = useState(null);

  // ---------- LOAD FRIENDS + PENDING REQUESTS ----------
  useEffect(() => {
    if (!username) return undefined;

    let cancelled = false;

    async function load() {
      const name = encodeURIComponent(username);
      try {
        const [friendsRes, requestsRes] = await Promise.all([
          fetch(`/api/friends/${name}`),
          fetch(`/api/friends/requests/${name}`),
        ]);
        const friendsData = await friendsRes.json().catch(() => ({}));
        const requestsData = await requestsRes.json().catch(() => ({}));

        if (!friendsRes.ok) throw new Error(friendsData.error || "Could not load friends.");
        if (!requestsRes.ok) throw new Error(requestsData.error || "Could not load friend requests.");

        if (!cancelled) {
          setLoaded({
            forUser: username,
            friends: friendsData.friends || [],
            requests: requestsData.requests || [],
            error: "",
          });
        }
      } catch (err) {
        console.error("Failed to load friends:", err);
        if (!cancelled) {
          setLoaded({ forUser: username, friends: [], requests: [], error: err.message });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [username, reloadKey]);

  const isCurrent = !!username && loaded.forUser === username;

  // ---------- BUILD THE LIST ----------
  const items = username
    ? [
        ...(isCurrent ? loaded.requests : []).map((r) => ({
          key: String(r.requestId),
          kind: "request",
          requestId: r.requestId,
          username: r.sender?.username,
          name: displayName(r.sender),
          status: "Pending",
        })),
        ...(isCurrent ? loaded.friends : []).map((f) => ({
          key: String(f._id),
          kind: "friend",
          username: f.username,
          name: displayName(f),
          status: "Friends",
        })),
      ]
    : friendsList.map((f) => ({
        key: String(f._id || f.id),
        kind: "static",
        name: f.name || f.username,
        status: f.status || "Pending",
      }));

  const error = actionError || (isCurrent ? loaded.error : "");

  // ---------- ACTIONS ----------
  const handleRespond = async (item, action) => {
    setActionError("");
    setBusyKey(item.key);
    try {
      const response = await fetch("/api/friends/respond", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
          requestId: item.requestId,
          action,
          responderUsername: username,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not respond to the request.");
      setReloadKey((k) => k + 1);
    } catch (err) {
      console.error("Respond failed:", err);
      setActionError(err.message);
    } finally {
      setBusyKey(null);
    }
  };

  const handleRemove = async (item) => {
    if (!window.confirm(`Remove ${item.name} from your friends?`)) return;

    setActionError("");
    setBusyKey(item.key);
    try {
      const response = await fetch("/api/friends/remove", {
        method: "DELETE",
        headers: JSON_HEADERS,
        body: JSON.stringify({ username, friendUsername: item.username }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not remove friend.");
      setReloadKey((k) => k + 1);
    } catch (err) {
      console.error("Remove friend failed:", err);
      setActionError(err.message);
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <section>
      <h2>Friends</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {items.length === 0 ? (
        <p>No friends or pending requests yet.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.key}>
              <span>Picture of {item.name}</span>
              <br />
              <p>Status: {item.status}</p>
              <p>Name: {item.name}</p>
              <br />

              {item.kind === "request" && (
                <>
                  <button
                    type="button"
                    disabled={busyKey === item.key}
                    onClick={() => handleRespond(item, "accept")}
                  >
                    Accept Friend request
                  </button>
                  <button
                    type="button"
                    disabled={busyKey === item.key}
                    onClick={() => handleRespond(item, "decline")}
                  >
                    Decline Friend request
                  </button>
                </>
              )}

              {item.kind === "friend" && (
                <button
                  type="button"
                  disabled={busyKey === item.key}
                  onClick={() => handleRemove(item)}
                >
                  Unfriend
                </button>
              )}
              <br />
            </li>
          ))}
        </ul>
      )}

      <div>
        <Link to="/friends">
          <button type="button">More</button>
        </Link>
      </div>
    </section>
  );
}

export default FriendsComponent;