// src/components/ProfilePreview.jsx
import { useState } from 'react';

function ProfilePreview({ user = {}, currentUsername = "", allowFriendRequest = false }) {
  const [requestSent, setRequestSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const {
    username = "Guest",
    firstname = "",
    surname = "",
    pronouns = "",
    bio = ""
  } = user;

  const fullName = [firstname, surname].filter(Boolean).join(" ");
  const isSelf = !!currentUsername && username === currentUsername;

  const handleSendRequest = async () => {
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderUsername: currentUsername,
          receiverUsername: username,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Could not send friend request.");
      }

      setRequestSent(true);
      setMessage({ type: "success", text: data.message || "Friend request sent." });
    } catch (error) {
      console.error("Error sending friend request:", error);
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article className="profile-preview-card">
      <div>
        <h3>{username}</h3>
        {fullName && <p><strong>Name:</strong> {fullName}</p>}
        <p><strong>Pronouns:</strong> {pronouns || "Not specified"}</p>
        <p><strong>Bio:</strong> {bio || "No description available."}</p>
      </div>

      {/* Only shown where the parent asks for it (e.g. the Home page popup) */}
      {allowFriendRequest && (
        <div>
          {isSelf ? (
            <p>This is your own profile.</p>
          ) : !currentUsername ? (
            <p>Log in to send a friend request.</p>
          ) : requestSent ? (
            <button type="button" disabled>
              Friend Request Sent
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSendRequest}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Friend Request"}
            </button>
          )}

          {message.text && (
            <p style={{ color: message.type === "error" ? "red" : "green" }}>
              {message.text}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

export default ProfilePreview;