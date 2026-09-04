
import { useState } from 'react';
import { Link } from 'react-router-dom';

function FriendsComponent({ friendsList = [] }) {
  const [friendStatuses, setFriendStatuses] = useState({});

  const handleAccept = (friendId) => {
    setFriendStatuses((prev) => ({ ...prev, [friendId]: "Accepted" }));
  };

  const handleDecline = (friendId) => {
    setFriendStatuses((prev) => ({ ...prev, [friendId]: "Declined" }));
  };

  return (
    <section>
      <h2>Friends</h2>
      <ul>
        {friendsList.map((friend) => {
          const currentStatus = friendStatuses[friend.id];

          return (
            <li key={friend.id}>
              <span>Picture of Friend</span>
              <br />
              <p>Status: {friend.status}</p>
              <p>Name: {friend.name}</p>
              <br />
              {currentStatus ? (
                <p><strong>{currentStatus}</strong></p>
              ) : (
                <>
                  <button type="button" onClick={() => handleAccept(friend.id)}>
                    Accept Friend request
                  </button>
                  <button type="button" onClick={() => handleDecline(friend.id)}>
                    Decline Friend request
                  </button>
                </>
              )}
              <br />
            </li>
          );
        })}
      </ul>
      <div>
        <Link to="/friends">
          <button type="button">More</button>
        </Link>
      </div>
    </section>
  );
}

export default FriendsComponent;