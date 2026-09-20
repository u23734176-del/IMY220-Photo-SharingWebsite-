// src/components/ProfilePreview.jsx

import { useState } from 'react';

function ProfilePreview({ user = {} }) {
  const [requestSent, setRequestSent] = useState(false);

  const {
    username = "Guest",
    pronouns = "They/Them",
    bio = "No description available."
  } = user;

  const handleSendRequest = () => {
    setRequestSent(true);
  };

  return (
    <article className="profile-preview-card">
      <div>
        <h3>{username}</h3>
        <p><strong>Pronouns:</strong> {pronouns}</p>
        <p><strong>Bio:</strong> {bio}</p>
      </div>

      <div>
        {requestSent ? (
          <button type="button" disabled>
            Friend Request Sent
          </button>
        ) : (
          <button type="button" onClick={handleSendRequest}>
            Send Friend Request
          </button>
        )}
      </div>
    </article>
  );
}

export default ProfilePreview;