// src/components/UserSearchSection.jsx

import { useState } from 'react';
import ProfilePreview from './ProfilePreview';

function UserSearchSection({ users = [] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = searchQuery.trim()
    ? users.filter((u) =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.surname.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

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

      {searchQuery.trim() !== "" && (
        <div>
          <h4>Results ({filteredUsers.length})</h4>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div key={user.id}>
                <ProfilePreview user={user} />
                <hr />
              </div>
            ))
          ) : (
            <p>No users found matching "{searchQuery}".</p>
          )}
        </div>
      )}
    </section>
  );
}

export default UserSearchSection;